import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RedundancyStage {
  PLANNING = 'PLANNING',
  SELECTION_POOL_DEFINED = 'SELECTION_POOL_DEFINED',
  CRITERIA_SET = 'CRITERIA_SET',
  CONSULTATION_STARTED = 'CONSULTATION_STARTED',
  INDIVIDUAL_CONSULTATION = 'INDIVIDUAL_CONSULTATION',
  ALTERNATIVE_EMPLOYMENT_OFFERED = 'ALTERNATIVE_EMPLOYMENT_OFFERED',
  TRIAL_PERIOD = 'TRIAL_PERIOD',
  NOTICE_ISSUED = 'NOTICE_ISSUED',
  APPEAL_SUBMITTED = 'APPEAL_SUBMITTED',
  APPEAL_REVIEWED = 'APPEAL_REVIEWED',
  COMPLETED = 'COMPLETED',
}

export enum RedundancyReason {
  BUSINESS_CLOSURE = 'BUSINESS_CLOSURE',
  WORKPLACE_CLOSURE = 'WORKPLACE_CLOSURE',
  REDUCED_WORKFORCE = 'REDUCED_WORKFORCE',
  ROLE_NO_LONGER_REQUIRED = 'ROLE_NO_LONGER_REQUIRED',
  RESTRUCTURING = 'RESTRUCTURING',
  BUSINESS_SALE = 'BUSINESS_SALE',
}

export enum ConsultationType {
  INDIVIDUAL = 'INDIVIDUAL',
  COLLECTIVE = 'COLLECTIVE',
}

@Entity('redundancy_processes')
@Index(['organizationId', 'status'])
export class RedundancyProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  processNumber: string;

  @Column({
    type: 'enum',
    enum: RedundancyReason,
  })
  reason: RedundancyReason;

  @Column({ type: 'text' })
  businessJustification: string;

  @Column({ type: 'int' })
  proposedRedundancies: number;

  @Column({ type: 'date' })
  proposedStartDate: Date;

  @Column({
    type: 'enum',
    enum: ConsultationType,
  })
  consultationType: ConsultationType;

  @Column({ type: 'int', nullable: true })
  consultationDays: number; // 30 or 45 for collective

  @Column({ type: 'date', nullable: true })
  consultationStartDate: Date;

  @Column({ type: 'date', nullable: true })
  consultationEndDate: Date;

  @Column({ default: false })
  hr1FormSubmitted: boolean;

  @Column({ type: 'date', nullable: true })
  hr1SubmissionDate: Date;

  @Column({
    type: 'enum',
    enum: RedundancyStage,
    default: RedundancyStage.PLANNING,
  })
  @Index()
  status: RedundancyStage;

  @Column({ type: 'jsonb', nullable: true })
  selectionPool: Array<{
    employeeId: string;
    employeeName: string;
    role: string;
    department: string;
    addedDate: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  selectionCriteria: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  selectionScores: Array<{
    employeeId: string;
    scores: Record<string, number>;
    totalScore: number;
    selected: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  consultationMeetings: Array<{
    date: Date;
    attendees: string[];
    type: string; // 'collective' | 'individual'
    topics: string[];
    notes: string;
    documents: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  alternativeRoles: Array<{
    roleId: string;
    roleTitle: string;
    offeredTo: string[];
    suitability: string;
    acceptedBy?: string;
    rejectedBy?: string[];
    rejectionReasons?: Record<string, string>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  trialPeriods: Array<{
    employeeId: string;
    newRole: string;
    startDate: Date;
    endDate: Date;
    successful: boolean;
    feedback: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  redundancyPayments: Array<{
    employeeId: string;
    serviceYears: number;
    weeklyPay: number;
    statutoryAmount: number;
    enhancedAmount: number;
    totalAmount: number;
    paymentDate: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  appeals: Array<{
    employeeId: string;
    submittedDate: Date;
    grounds: string;
    reviewedBy: string;
    reviewDate: Date;
    outcome: string; // 'UPHELD' | 'REJECTED' | 'PARTIALLY_UPHELD'
    notes: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    date: Date;
    stage: string;
    event: string;
    performedBy: string;
    notes: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ nullable: true })
  leadHRContact: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
