import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

/**
 * LeaveRequest
 * Enhanced leave request with full workflow support
 * Replaces simple Leave entity with policy-driven features
 */
@Entity('leave_requests')
@Index(['employeeId', 'status', 'startDate'])
export class LeaveRequest {
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

  @ManyToOne(() => require('./leave-type.entity').LeaveType)
  @JoinColumn({ name: 'leaveTypeId' })
  leaveType: any;

  @OneToMany(() => require('./leave-segment.entity').LeaveSegment, (segment: any) => segment.leaveRequest)
  segments: any[];

  @OneToMany(() => require('./leave-approval.entity').LeaveApproval, (approval: any) => approval.leaveRequest)
  approvals: any[];

  // Date range
  @Column({ type: 'timestamp with time zone' })
  @Index()
  startDate: Date;

  @Column({ type: 'timestamp with time zone' })
  @Index()
  endDate: Date;

  // Duration (in minutes for precision)
  @Column({ type: 'int' })
  totalMinutesRequested: number;

  @Column({ type: 'int' })
  totalMinutesDeducted: number; // May differ due to PHs, pattern

  @Column({ type: 'int', default: 0 })
  workingDaysCount: number;

  @Column({ type: 'int', default: 0 })
  calendarDaysCount: number;

  // Partial days
  @Column({ type: 'jsonb', nullable: true })
  partialDays: Array<{
    date: string; // ISO date
    startTime?: string; // HH:mm
    endTime?: string;
    minutes: number;
  }>;

  // Reason & documentation
  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  employeeNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    id: string;
    name: string;
    type: string; // FIT_NOTE, MEDICAL_CERT, COURT_LETTER
    url: string;
    uploadedAt: Date;
  }>;

  // Status
  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'],
    default: 'PENDING',
  })
  @Index()
  status: string;

  // Approval workflow
  @Column({ type: 'varchar', nullable: true })
  currentApprovalStep: string; // LINE_MANAGER, ROSTER_OWNER, DEPARTMENT_HEAD, HR

  @Column({ type: 'int', default: 0 })
  approvalLevel: number; // 0, 1, 2...

  @Column({ type: 'boolean', default: false })
  isFullyApproved: boolean;

  @Column({ type: 'boolean', default: false })
  autoApproved: boolean;

  @Column({ type: 'varchar', nullable: true })
  autoApprovalReason: string; // "Under 4h and >7 days notice"

  // Rejection
  @Column({ nullable: true })
  rejectedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Coverage impact
  @Column({ type: 'jsonb', nullable: true })
  coverageAnalysis: {
    affected: boolean;
    breaches: Array<{
      date: string;
      scope: string;
      role: string;
      scheduled: number;
      onLeave: number;
      remaining: number;
      minRequired: number;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    requiresBackfill: boolean;
    alternativeDates?: string[];
  };

  // Embargo & conflicts
  @Column({ type: 'boolean', default: false })
  hasEmbargoConflict: boolean;

  @Column({ type: 'jsonb', nullable: true })
  embargoConflicts: Array<{
    embargoId: string;
    name: string;
    canOverride: boolean;
  }>;

  @Column({ type: 'boolean', default: false })
  hasRosterConflict: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rosterConflicts: Array<{
    date: string;
    shiftId: string;
    shiftType: string;
    critical: boolean;
  }>;

  // Public holidays
  @Column({ type: 'int', default: 0 })
  publicHolidaysInRange: number;

  @Column({ type: 'jsonb', nullable: true })
  publicHolidayDates: string[];

  @Column({
    type: 'enum',
    enum: ['DEDUCTED', 'IGNORED', 'IN_LIEU_GRANTED'],
    nullable: true,
  })
  publicHolidayHandling: string;

  // Notice & compliance
  @Column({ type: 'int' })
  noticeDaysGiven: number;

  @Column({ type: 'boolean', default: true })
  meetsNoticeRequirement: boolean;

  @Column({ type: 'boolean', default: true })
  meetsComplianceRules: boolean;

  @Column({ type: 'jsonb', nullable: true })
  complianceWarnings: string[];

  // Balance tracking
  @Column({ type: 'int', nullable: true })
  balanceBeforeRequest: number; // Minutes

  @Column({ type: 'int', nullable: true })
  balanceAfterRequest: number;

  @Column({ type: 'boolean', default: false })
  causesNegativeBalance: boolean;

  // TOIL specific
  @Column({ nullable: true })
  toilSourceId: string; // OvertimeLine ID that generated TOIL

  @Column({ type: 'date', nullable: true })
  toilExpiryDate: Date;

  // Cancellation & changes
  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  originalRequestId: string; // If this is an amendment

  @Column({ type: 'boolean', default: false })
  isAmendment: boolean;

  // Payroll integration
  @Column({ type: 'boolean', default: false })
  exportedToPayroll: boolean;

  @Column({ type: 'varchar', nullable: true })
  payrollBatchId: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  payrollExportedAt: Date;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean; // Locked after payroll export

  // SLA tracking
  @Column({ type: 'timestamp with time zone', nullable: true })
  slaDeadline: Date; // When approval should be completed

  @Column({ type: 'boolean', default: false })
  isOverdue: boolean;

  @Column({ type: 'boolean', default: false })
  hasEscalated: boolean;

  // Notification tracking
  @Column({ type: 'timestamp with time zone', nullable: true })
  employeeNotifiedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  managersNotifiedAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: 'WEB' | 'MOBILE' | 'API' | 'BULK_IMPORT';
    ipAddress?: string;
    deviceInfo?: string;
    swapProposal?: {
      coverEmployeeId: string;
      consentGiven: boolean;
      consentAt?: Date;
    };
    travelBlock?: {
      hasBookedTravel: boolean;
      destination?: string;
      visaRequired?: boolean;
    };
    costImpact?: {
      backfillCost?: number;
      lostProductivity?: number;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper: Get duration in hours
  getDurationInHours(): number {
    return this.totalMinutesDeducted / 60;
  }

  // Helper: Get duration in days
  getDurationInDays(hoursPerDay: number = 8): number {
    return this.totalMinutesDeducted / (hoursPerDay * 60);
  }

  // Helper: Check if within date range
  containsDate(date: Date): boolean {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }

  // Helper: Check if approved
  isApproved(): boolean {
    return this.status === 'APPROVED' || this.isFullyApproved;
  }

  // Helper: Check if pending
  isPending(): boolean {
    return this.status === 'PENDING';
  }

  // Helper: Check if can be cancelled
  canBeCancelled(): boolean {
    return (
      !this.isCancelled &&
      !this.isLocked &&
      (this.status === 'PENDING' || this.status === 'APPROVED') &&
      new Date() < new Date(this.startDate)
    );
  }
}
