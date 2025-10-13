import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  AUTO_APPROVED = 'AUTO_APPROVED',
  EXPIRED = 'EXPIRED',
}

export enum ApprovalLevel {
  L1_MANAGER = 'L1_MANAGER',
  L2_SENIOR_MANAGER = 'L2_SENIOR_MANAGER',
  L3_PAYROLL = 'L3_PAYROLL',
  BUDGET_APPROVER = 'BUDGET_APPROVER',
  EMERGENCY_OVERRIDE = 'EMERGENCY_OVERRIDE',
}

/**
 * OvertimeApproval - Multi-level approval workflow
 * Tracks approval process with SLA and escalation
 */
@Entity('overtime_approvals')
@Index(['shiftId'])
@Index(['currentLevel', 'status'])
@Index(['dueAt'])
export class OvertimeApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === SUBJECT ===
  
  @Column({ nullable: true })
  shiftId: string;

  @Column({ nullable: true })
  overtimeLineId: string;

  @Column({ nullable: true })
  onCallStandbyId: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column()
  requestedBy: string;

  @Column()
  requestedAt: Date;

  // === FLOW ===
  
  @Column()
  approvalFlowId: string; // References WorkRuleSet approval hierarchy

  @Column({ type: 'enum', enum: ApprovalLevel })
  currentLevel: ApprovalLevel;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @Column({ type: 'jsonb' })
  levels: Array<{
    level: ApprovalLevel;
    sequence: number;
    assignedTo?: string;
    assignedToRole?: string;
    status: ApprovalStatus;
    actionedBy?: string;
    actionedAt?: Date;
    comments?: string;
    autoApproveThreshold?: number; // Auto-approve if under X hours
  }>;

  @Column({ nullable: true })
  currentAssignee: string;

  // === SLA ===
  
  @Column({ nullable: true })
  dueAt: Date; // When approval is due

  @Column({ type: 'int', nullable: true })
  slaHours: number; // SLA in hours

  @Column({ default: false })
  isOverdue: boolean;

  @Column({ nullable: true })
  overdueBy: number; // Minutes overdue

  // === ESCALATION ===
  
  @Column({ type: 'int', nullable: true })
  escalationHours: number; // Hours before escalation

  @Column({ nullable: true })
  escalateAt: Date;

  @Column({ default: false })
  isEscalated: boolean;

  @Column({ nullable: true })
  escalatedTo: string;

  @Column({ nullable: true })
  escalatedAt: Date;

  @Column({ nullable: true })
  escalationReason: string;

  // === AUTO-APPROVAL ===
  
  @Column({ default: false })
  isAutoApproved: boolean;

  @Column({ nullable: true })
  autoApprovalReason: string;

  // === DETAILS ===
  
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hoursRequested: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amountEstimated: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  employeeJustification: string;

  // === DECISION ===
  
  @Column({ nullable: true })
  finalApprovedBy: string;

  @Column({ nullable: true })
  finalApprovedAt: Date;

  @Column({ nullable: true })
  finalRejectedBy: string;

  @Column({ nullable: true })
  finalRejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // === COMMENTS & ATTACHMENTS ===
  
  @Column({ type: 'jsonb', default: [] })
  comments: Array<{
    id: string;
    actor: string;
    actorRole: string;
    timestamp: Date;
    comment: string;
    isInternal?: boolean;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  // === FLAGS ===
  
  @Column({ default: false })
  requiresBudgetApproval: boolean;

  @Column({ default: false })
  budgetApproved: boolean;

  @Column({ nullable: true })
  budgetApprovedBy: string;

  @Column({ default: false })
  exceedsBudget: boolean;

  @Column({ default: false })
  isEmergency: boolean;

  @Column({ default: false })
  isPreApproved: boolean;

  @Column({ default: false })
  restBreachFlag: boolean;

  @Column({ default: false })
  fatigueFlag: boolean;

  // === NOTIFICATIONS ===
  
  @Column({ type: 'jsonb', nullable: true })
  notifications: Array<{
    type: 'REQUEST' | 'REMINDER' | 'ESCALATION' | 'APPROVED' | 'REJECTED';
    sentTo: string;
    sentAt: Date;
    channel: 'EMAIL' | 'SMS' | 'PUSH';
    acknowledged?: boolean;
  }>;

  // === METADATA ===
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    costCenter?: string;
    project?: string;
    budgetId?: string;
    shiftType?: string;
    consecutiveDays?: number;
    weeklyTotal?: number;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // === HELPER METHODS ===

  /**
   * Approve current level
   */
  approveLevel(approver: string, comments?: string): boolean {
    const level = this.levels.find(l => l.level === this.currentLevel);
    if (!level) return false;

    level.status = ApprovalStatus.APPROVED;
    level.actionedBy = approver;
    level.actionedAt = new Date();
    level.comments = comments;

    this.addComment(approver, `Approved at ${this.currentLevel}`, comments);

    // Move to next level
    const nextLevel = this.levels.find(l => l.sequence === level.sequence + 1);
    if (nextLevel) {
      this.currentLevel = nextLevel.level;
      this.currentAssignee = nextLevel.assignedTo;
      return false; // Not final
    } else {
      this.status = ApprovalStatus.APPROVED;
      this.finalApprovedBy = approver;
      this.finalApprovedAt = new Date();
      return true; // Final approval
    }
  }

  /**
   * Reject approval
   */
  reject(rejector: string, reason: string): void {
    const level = this.levels.find(l => l.level === this.currentLevel);
    if (level) {
      level.status = ApprovalStatus.REJECTED;
      level.actionedBy = rejector;
      level.actionedAt = new Date();
      level.comments = reason;
    }

    this.status = ApprovalStatus.REJECTED;
    this.finalRejectedBy = rejector;
    this.finalRejectedAt = new Date();
    this.rejectionReason = reason;

    this.addComment(rejector, `Rejected at ${this.currentLevel}`, reason);
  }

  /**
   * Escalate to next level
   */
  escalate(reason: string): void {
    const level = this.levels.find(l => l.level === this.currentLevel);
    if (!level) return;

    this.isEscalated = true;
    this.escalatedAt = new Date();
    this.escalationReason = reason;

    level.status = ApprovalStatus.ESCALATED;

    // Move to next level
    const nextLevel = this.levels.find(l => l.sequence === level.sequence + 1);
    if (nextLevel) {
      this.currentLevel = nextLevel.level;
      this.currentAssignee = nextLevel.assignedTo;
      this.escalatedTo = nextLevel.assignedTo;
    }
  }

  /**
   * Check if overdue
   */
  checkOverdue(): boolean {
    if (!this.dueAt) return false;

    const now = new Date();
    if (now > this.dueAt && this.status === ApprovalStatus.PENDING) {
      this.isOverdue = true;
      this.overdueBy = Math.floor((now.getTime() - this.dueAt.getTime()) / (1000 * 60));
      return true;
    }
    return false;
  }

  /**
   * Check if should escalate
   */
  shouldEscalate(): boolean {
    if (!this.escalateAt || this.isEscalated) return false;
    return new Date() > this.escalateAt && this.status === ApprovalStatus.PENDING;
  }

  /**
   * Add comment
   */
  private addComment(actor: string, title: string, comment?: string): void {
    this.comments = this.comments || [];
    this.comments.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actor,
      actorRole: this.currentLevel,
      timestamp: new Date(),
      comment: comment || title,
    });
  }
}
