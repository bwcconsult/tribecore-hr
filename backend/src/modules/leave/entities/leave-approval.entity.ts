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
 * LeaveApproval
 * Multi-level approval workflow tracking
 * Supports LINE_MANAGER → ROSTER_OWNER → DEPARTMENT_HEAD → HR flow
 */
@Entity('leave_approvals')
@Index(['leaveRequestId', 'step'])
export class LeaveApproval {
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
  employeeId: string; // Employee who made the request

  @Column()
  @Index()
  organizationId: string;

  // Approval step
  @Column({ type: 'int' })
  step: number; // 1, 2, 3...

  @Column()
  stepName: string; // LINE_MANAGER, ROSTER_OWNER, DEPARTMENT_HEAD, HR_IF_SPECIAL, BUDGET_OWNER

  @Column({ type: 'boolean', default: false })
  isConditional: boolean; // e.g., ROSTER_OWNER only if roster conflict

  @Column({ type: 'text', nullable: true })
  condition: string; // "Only if hasRosterConflict"

  // Approver
  @Column()
  @Index()
  approverId: string;

  @Column({ nullable: true })
  approverName: string;

  @Column({ nullable: true })
  approverRole: string;

  // Decision
  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SKIPPED', 'ESCALATED'],
    default: 'PENDING',
  })
  @Index()
  decision: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  decidedAt: Date;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Override permissions
  @Column({ type: 'boolean', default: false })
  isOverride: boolean; // Override coverage/embargo breach

  @Column({ type: 'jsonb', nullable: true })
  overrideDetails: {
    type: 'COVERAGE' | 'EMBARGO' | 'NOTICE' | 'BALANCE' | 'COMPLIANCE';
    reason: string;
    authorizedBy?: string;
  };

  // SLA tracking
  @Column({ type: 'timestamp with time zone' })
  dueAt: Date; // When this step should be completed

  @Column({ type: 'int', default: 48 })
  slaHours: number; // SLA for this step

  @Column({ type: 'boolean', default: false })
  isOverdue: boolean;

  @Column({ type: 'boolean', default: false })
  isEscalated: boolean;

  @Column({ nullable: true })
  escalatedTo: string; // Escalation approver ID

  @Column({ type: 'timestamp with time zone', nullable: true })
  escalatedAt: Date;

  // Delegation
  @Column({ type: 'boolean', default: false })
  isDelegated: boolean;

  @Column({ nullable: true })
  delegatedFrom: string; // Original approver

  @Column({ nullable: true })
  delegatedTo: string; // Delegate

  @Column({ type: 'timestamp with time zone', nullable: true })
  delegatedAt: Date;

  // Notification tracking
  @Column({ type: 'timestamp with time zone', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'int', default: 0 })
  remindersSent: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastReminderAt: Date;

  // Actions taken
  @Column({ type: 'jsonb', nullable: true })
  actions: Array<{
    type: 'APPROVED' | 'REJECTED' | 'COMMENTED' | 'REQUESTED_CHANGES' | 'DELEGATED' | 'ESCALATED';
    timestamp: Date;
    actor: string;
    detail?: string;
  }>;

  // Backfill decision (for roster owners)
  @Column({ type: 'boolean', default: false })
  requiresBackfill: boolean;

  @Column({ nullable: true })
  backfillAssignedTo: string;

  @Column({ type: 'boolean', default: false })
  backfillCreated: boolean;

  // Alternative dates suggested
  @Column({ type: 'jsonb', nullable: true })
  suggestedAlternatives: Array<{
    startDate: string;
    endDate: string;
    reason: string;
  }>;

  @Column({ type: 'boolean', default: false })
  alternativesProvided: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ipAddress?: string;
    deviceInfo?: string;
    approvalSource?: 'WEB' | 'MOBILE' | 'EMAIL' | 'SLACK' | 'TEAMS';
    viewedAt?: Date;
    timeSpentSeconds?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Helper: Check if this approval is waiting
  isWaiting(): boolean {
    return this.decision === 'PENDING' && !this.isSkipped();
  }

  // Helper: Check if skipped
  isSkipped(): boolean {
    return this.decision === 'SKIPPED';
  }

  // Helper: Check if completed
  isCompleted(): boolean {
    return ['APPROVED', 'REJECTED', 'SKIPPED'].includes(this.decision);
  }

  // Helper: Check if this step should be active
  shouldBeActive(previousStepsCompleted: boolean, conditionMet: boolean = true): boolean {
    if (!previousStepsCompleted) return false;
    if (this.isConditional && !conditionMet) return false;
    return this.decision === 'PENDING';
  }
}
