import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * AccrualLog
 * Tracks monthly accrual entries for audit trail
 */
@Entity('accrual_logs')
@Index(['employeeId', 'leaveTypeId', 'period'])
export class AccrualLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  employeeId: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  leaveTypeId: string;

  // Period this accrual is for
  @Column({ type: 'date' })
  @Index()
  period: Date; // First day of month

  // Accrual details (in minutes)
  @Column({ type: 'int' })
  minutesAdded: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  ftePercentage: number; // FTE at time of accrual

  @Column({ type: 'int', nullable: true })
  daysInMonth: number;

  @Column({ type: 'int', nullable: true })
  daysWorked: number; // For mid-month joiners

  // Source of accrual
  @Column({
    type: 'enum',
    enum: ['MONTHLY_PRORATA', 'UPFRONT', 'ANNIVERSARY', 'MANUAL_ADJUSTMENT', 'TOIL_EARNED', 'PURCHASE'],
    default: 'MONTHLY_PRORATA',
  })
  source: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Calculation details
  @Column({ type: 'jsonb', nullable: true })
  calculation: {
    annualEntitlement?: number;
    monthlyRate?: number;
    proRataFactor?: number;
    roundingApplied?: string;
    formula?: string;
  };

  // Processed by
  @Column({ nullable: true })
  processedBy: string; // System or user ID

  @CreateDateColumn()
  createdAt: Date;
}
