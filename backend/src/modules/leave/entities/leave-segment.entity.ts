import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * LeaveSegment
 * Day-by-day breakdown of leave request
 * Enables accurate deduction based on working patterns
 */
@Entity('leave_segments')
@Index(['leaveRequestId', 'date'])
export class LeaveSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  leaveRequestId: string;

  @ManyToOne(() => require('./leave-request.entity').LeaveRequest)
  @JoinColumn({ name: 'leaveRequestId' })
  leaveRequest: any;

  @Column()
  @Index()
  employeeId: string;

  @Column()
  @Index()
  organizationId: string;

  // Date this segment applies to
  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'varchar', length: 3 })
  dayOfWeek: string; // MON, TUE, WED...

  // Deduction details (in minutes)
  @Column({ type: 'int' })
  minutesDeducted: number;

  @Column({ type: 'int', nullable: true })
  scheduledMinutes: number; // What was scheduled on pattern

  @Column({ type: 'boolean', default: true })
  isWorkingDay: boolean;

  @Column({ type: 'boolean', default: false })
  isPublicHoliday: boolean;

  @Column({ type: 'varchar', nullable: true })
  publicHolidayName: string;

  @Column({ type: 'boolean', default: false })
  isWeekend: boolean;

  // Partial day details
  @Column({ type: 'boolean', default: false })
  isPartialDay: boolean;

  @Column({ type: 'time', nullable: true })
  partialStartTime: string;

  @Column({ type: 'time', nullable: true })
  partialEndTime: string;

  // Roster integration
  @Column({ nullable: true })
  rosterShiftId: string; // If employee had scheduled shift

  @Column({ type: 'varchar', nullable: true })
  shiftType: string; // DAY, NIGHT, EVENING

  @Column({ type: 'boolean', default: false })
  requiresBackfill: boolean; // Manager marked for replacement

  @Column({ nullable: true })
  backfillAssignedTo: string; // Replacement employee ID

  // Coverage impact
  @Column({ type: 'jsonb', nullable: true })
  coverageImpact: {
    scope?: string; // WARD:ICU, DEPT:ENGINEERING
    role?: string;
    skillRequired?: string;
    minStaffingBreach?: boolean;
  };

  // Status
  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'],
    default: 'PENDING',
  })
  status: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    costCenterOnDate?: string;
    projectOnDate?: string;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}
