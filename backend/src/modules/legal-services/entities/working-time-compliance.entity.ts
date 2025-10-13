import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum WorkingTimeViolationType {
  EXCEEDS_48_HOURS = 'EXCEEDS_48_HOURS',
  INSUFFICIENT_REST_BREAK = 'INSUFFICIENT_REST_BREAK',
  INSUFFICIENT_DAILY_REST = 'INSUFFICIENT_DAILY_REST',
  INSUFFICIENT_WEEKLY_REST = 'INSUFFICIENT_WEEKLY_REST',
  INADEQUATE_ANNUAL_LEAVE = 'INADEQUATE_ANNUAL_LEAVE',
  NIGHT_WORK_LIMIT_EXCEEDED = 'NIGHT_WORK_LIMIT_EXCEEDED',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  AT_RISK = 'AT_RISK',
  VIOLATION = 'VIOLATION',
  RESOLVED = 'RESOLVED',
}

@Entity('working_time_compliance')
@Index(['employeeId', 'weekStartDate'])
export class WorkingTimeCompliance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  employeeId: string;

  @Column({ type: 'date' })
  @Index()
  weekStartDate: Date;

  @Column({ type: 'date' })
  weekEndDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  totalHoursWorked: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  averageWeeklyHours: number;

  @Column({ default: false })
  hasOptedOut: boolean;

  @Column({ type: 'date', nullable: true })
  optOutDate: Date;

  @Column({ type: 'date', nullable: true })
  optOutExpiryDate: Date;

  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.COMPLIANT,
  })
  complianceStatus: ComplianceStatus;

  @Column({ type: 'jsonb', nullable: true })
  violations: Array<{
    type: WorkingTimeViolationType;
    date: Date;
    details: string;
    resolved: boolean;
    resolvedDate?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  restBreaks: Array<{
    date: Date;
    breakDuration: number; // minutes
    hoursWorked: number;
    compliant: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  dailyRest: Array<{
    date: Date;
    restHours: number;
    compliant: boolean;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  annualLeaveEntitlement: number; // weeks

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  annualLeaveTaken: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  annualLeaveRemaining: number;

  @Column({ default: false })
  isNightWorker: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  nightHoursWorked: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
