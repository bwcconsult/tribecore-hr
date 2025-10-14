import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * WorkingPattern
 * Defines employee work schedules (full-time, part-time, shift patterns, compressed hours)
 * Used for accurate leave deduction calculations
 */
@Entity('working_patterns')
export class WorkingPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  name: string; // e.g., "Full-Time 5/7", "4-on-4-off 12h", "Mon-Thu 10h"

  @Column({ type: 'text', nullable: true })
  description: string;

  // Cycle configuration
  @Column({ type: 'int', default: 7 })
  cycleDays: number; // 7 for weekly, 28 for 4-week rota

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  ftePercentage: number; // 1.0 = 100%, 0.5 = 50%

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weeklyContractedHours: number; // e.g., 37.5, 40

  // Pattern definition (JSON array of day configs)
  @Column({ type: 'jsonb' })
  pattern: Array<{
    dayOfCycle: number; // 0-6 for weekly, 0-27 for 4-week
    dayOfWeek: string; // MON, TUE, WED, THU, FRI, SAT, SUN
    isWorkingDay: boolean;
    startTime?: string; // HH:mm format
    endTime?: string;
    hoursScheduled?: number;
    breaks?: Array<{
      startTime: string;
      endTime: string;
      isPaid: boolean;
      durationMinutes: number;
    }>;
  }>;

  // Shift-specific settings
  @Column({ type: 'boolean', default: false })
  isShiftPattern: boolean; // 24/7 shift work

  @Column({ type: 'boolean', default: false })
  includesNights: boolean;

  @Column({ type: 'boolean', default: false })
  includesWeekends: boolean;

  // Default hours per day (for simple calculations)
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 8 })
  defaultDailyHours: number;

  // Public holiday handling
  @Column({
    type: 'enum',
    enum: ['DEDUCT', 'IGNORE', 'GRANT_IN_LIEU'],
    default: 'DEDUCT',
  })
  publicHolidayHandling: string;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    sector?: string; // OFFICE, HEALTHCARE, RETAIL, MANUFACTURING
    rotaType?: string; // CONTINENTAL, DUPONT, PITMAN, CUSTOM
    coverageRequirements?: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper: Get working hours for a specific date
  getHoursForDate(date: Date): number {
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    const dayPattern = this.pattern.find(p => {
      const dayMap = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
      return dayMap[p.dayOfWeek] === dayOfWeek;
    });

    if (!dayPattern || !dayPattern.isWorkingDay) return 0;
    return dayPattern.hoursScheduled || this.defaultDailyHours;
  }

  // Helper: Check if date is working day
  isWorkingDay(date: Date): boolean {
    const hours = this.getHoursForDate(date);
    return hours > 0;
  }
}
