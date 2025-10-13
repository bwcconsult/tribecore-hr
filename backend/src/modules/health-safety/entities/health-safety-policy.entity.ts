import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REQUIRES_UPDATE = 'REQUIRES_UPDATE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('health_safety_policies')
export class HealthSafetyPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  policyNumber: string;

  @Column()
  title: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'text' })
  generalStatement: string; // Part 1: General statement of intent

  @Column({ type: 'jsonb' })
  responsibilities: Array<{
    // Part 2: Organization & responsibilities
    role: string;
    name: string;
    duties: string[];
    contactDetails?: string;
  }>;

  @Column({ type: 'jsonb' })
  arrangements: Array<{
    // Part 3: Arrangements for health & safety
    area: string;
    description: string;
    procedures: string[];
    responsiblePerson: string;
    reviewFrequency: string;
  }>;

  @Column({ type: 'text', nullable: true })
  riskAssessmentArrangements: string;

  @Column({ type: 'text', nullable: true })
  trainingArrangements: string;

  @Column({ type: 'text', nullable: true })
  consultationArrangements: string;

  @Column({ type: 'text', nullable: true })
  emergencyArrangements: string;

  @Column({ type: 'text', nullable: true })
  accidentReportingArrangements: string;

  @Column({ type: 'text', nullable: true })
  firePreventionArrangements: string;

  @Column({ type: 'text', nullable: true })
  firstAidArrangements: string;

  @Column({ type: 'text', nullable: true })
  workplaceInspectionArrangements: string;

  @Column()
  ceoSignatory: string;

  @Column({ type: 'date' })
  signatureDate: Date;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  nextReviewDate: Date;

  @Column()
  authoredBy: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.DRAFT,
  })
  status: PolicyStatus;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'jsonb', nullable: true })
  distributionList: Array<{
    department: string;
    acknowledgedBy: string[];
    acknowledgedDate: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  revisionHistory: Array<{
    version: number;
    date: Date;
    changes: string;
    authoredBy: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    companySize?: string; // Determines if policy is legally required
    numberOfEmployees?: number;
    industryType?: string;
    hseRequirements?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
