import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EnforcementType {
  IMPROVEMENT_NOTICE = 'IMPROVEMENT_NOTICE',
  PROHIBITION_NOTICE = 'PROHIBITION_NOTICE',
  PROSECUTION = 'PROSECUTION',
  SIMPLE_CAUTION = 'SIMPLE_CAUTION',
  FEE_FOR_INTERVENTION = 'FEE_FOR_INTERVENTION',
}

export enum EnforcementStatus {
  RECEIVED = 'RECEIVED',
  ACTION_PLAN_CREATED = 'ACTION_PLAN_CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  APPEAL_LODGED = 'APPEAL_LODGED',
  COMPLIED = 'COMPLIED',
  EXTENDED = 'EXTENDED',
  WITHDRAWN = 'WITHDRAWN',
  PROSECUTION_PENDING = 'PROSECUTION_PENDING',
  CLOSED = 'CLOSED',
}

export enum NoticeSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SERIOUS = 'SERIOUS',
  IMMINENT_DANGER = 'IMMINENT_DANGER',
}

@Entity('hse_enforcement')
export class HSEEnforcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  noticeNumber: string;

  @Column({ nullable: true })
  hseReference: string;

  @Column({
    type: 'enum',
    enum: EnforcementType,
  })
  type: EnforcementType;

  @Column({
    type: 'enum',
    enum: NoticeSeverity,
  })
  severity: NoticeSeverity;

  @Column({ type: 'date' })
  issuedDate: Date;

  @Column()
  issuedBy: string; // HSE Inspector name

  @Column({ nullable: true })
  inspectorContactDetails: string;

  @Column()
  location: string; // Premises where notice applies

  @Column()
  specificLocation: string; // Specific area/equipment

  // Notice Details
  @Column({ type: 'text' })
  breachDescription: string;

  @Column({ type: 'text' })
  contravention: string; // Which law/regulation was breached

  @Column({ type: 'simple-array' })
  legislationBreached: string[]; // e.g., "HASAWA 1974 Section 2(1)"

  @Column({ type: 'text' })
  reasonForNotice: string;

  @Column({ type: 'text' })
  immediateDanger: string; // For prohibition notices

  // Compliance Requirements
  @Column({ type: 'jsonb' })
  requiredActions: Array<{
    id: string;
    action: string;
    deadline: Date;
    completed: boolean;
    completedDate?: Date;
    evidence?: string;
    verifiedBy?: string;
  }>;

  @Column({ type: 'date' })
  complianceDeadline: Date;

  @Column({ type: 'int', nullable: true })
  daysToComply: number;

  // Prohibition Details (if applicable)
  @Column({ default: false })
  isProhibitionNotice: boolean;

  @Column({ default: false })
  immediateProhibition: boolean; // Takes effect immediately

  @Column({ default: false })
  deferredProhibition: boolean; // Takes effect at specified date

  @Column({ type: 'date', nullable: true })
  prohibitionEffectiveDate: Date;

  @Column({ type: 'text', nullable: true })
  activitiesProhibited: string;

  @Column({ type: 'text', nullable: true })
  conditionsForLifting: string;

  // Improvement Notice Details
  @Column({ default: false })
  isImprovementNotice: boolean;

  @Column({ type: 'jsonb', nullable: true })
  improvementsRequired: Array<{
    improvement: string;
    timeframe: string;
    completed: boolean;
    completedDate?: Date;
  }>;

  // Response & Action Plan
  @Column({ nullable: true })
  responsiblePerson: string;

  @Column({ type: 'jsonb', nullable: true })
  actionPlan: Array<{
    action: string;
    assignedTo: string;
    targetDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    completedDate?: Date;
    cost?: number;
  }>;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualCost: number;

  // Appeal Process
  @Column({ default: false })
  appealLodged: boolean;

  @Column({ type: 'date', nullable: true })
  appealDate: Date; // Must be within 21 days of notice

  @Column({ nullable: true })
  appealTribunal: string;

  @Column({ type: 'text', nullable: true })
  appealGrounds: string;

  @Column({ nullable: true })
  appealOutcome: string;

  @Column({ type: 'date', nullable: true })
  appealDecisionDate: Date;

  // Extension Requests
  @Column({ default: false })
  extensionRequested: boolean;

  @Column({ type: 'date', nullable: true })
  extensionRequestDate: Date;

  @Column({ default: false })
  extensionGranted: boolean;

  @Column({ type: 'date', nullable: true })
  extendedDeadline: Date;

  @Column({ type: 'text', nullable: true })
  extensionReason: string;

  // Compliance Verification
  @Column({ default: false })
  complianceAchieved: boolean;

  @Column({ type: 'date', nullable: true })
  complianceDate: Date;

  @Column({ nullable: true })
  verifiedBy: string; // HSE Inspector

  @Column({ type: 'date', nullable: true })
  verificationDate: Date;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  // Fee for Intervention
  @Column({ default: false })
  feeForInterventionApplies: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  feeAmount: number;

  @Column({ default: false })
  feePaid: boolean;

  @Column({ type: 'date', nullable: true })
  feePaymentDate: Date;

  @Column({ nullable: true })
  invoiceNumber: string;

  // Prosecution Details
  @Column({ default: false })
  prosecutionProceedings: boolean;

  @Column({ type: 'date', nullable: true })
  courtDate: Date;

  @Column({ nullable: true })
  courtLocation: string;

  @Column({ type: 'text', nullable: true })
  charges: string;

  @Column({ nullable: true })
  prosecutionOutcome: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  fineAmount: number;

  @Column({ type: 'date', nullable: true })
  finePaymentDate: Date;

  // Documentation
  @Column({ type: 'simple-array', nullable: true })
  noticeDocuments: string[]; // Scanned copies of notices

  @Column({ type: 'simple-array', nullable: true })
  evidenceDocuments: string[]; // Evidence of compliance

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  correspondence: string[]; // Letters, emails with HSE

  // Status & Timeline
  @Column({
    type: 'enum',
    enum: EnforcementStatus,
    default: EnforcementStatus.RECEIVED,
  })
  status: EnforcementStatus;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    date: Date;
    event: string;
    notes: string;
    performedBy?: string;
  }>;

  // Impact Assessment
  @Column({ type: 'text', nullable: true })
  businessImpact: string;

  @Column({ type: 'text', nullable: true })
  reputationalImpact: string;

  @Column({ default: false })
  mediaAttention: boolean;

  // Lessons Learned
  @Column({ type: 'text', nullable: true })
  rootCauseAnalysis: string;

  @Column({ type: 'jsonb', nullable: true })
  preventiveMeasures: Array<{
    measure: string;
    implemented: boolean;
    implementationDate?: Date;
  }>;

  @Column({ type: 'text', nullable: true })
  lessonsLearned: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    relatedIncidentId?: string;
    relatedRiskAssessmentId?: string;
    boardNotified?: boolean;
    insuranceNotified?: boolean;
    additionalNotes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
