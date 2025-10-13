import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum RiskStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  ARCHIVED = 'ARCHIVED',
}

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  referenceNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Column()
  department: string;

  @Column({ type: 'simple-array', nullable: true })
  affectedPersons: string[];

  @Column()
  assessedBy: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date' })
  assessmentDate: Date;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({
    type: 'enum',
    enum: RiskStatus,
    default: RiskStatus.DRAFT,
  })
  status: RiskStatus;

  @Column({ type: 'jsonb' })
  hazards: Array<{
    id: string;
    hazard: string;
    whoAtRisk: string;
    existingControls: string;
    likelihood: number; // 1-5
    severity: number; // 1-5
    riskRating: number; // likelihood × severity
    riskLevel: RiskLevel;
    additionalControls: string;
    residualLikelihood: number;
    residualSeverity: number;
    residualRisk: number;
    residualRiskLevel: RiskLevel;
    actionRequired: string;
    actionOwner: string;
    actionDeadline: Date;
    actionCompleted: boolean;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'simple-array', nullable: true })
  relatedDocuments: string[];

  @Column({ nullable: true })
  templateId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    industry?: string;
    activityType?: string;
    numberOfPeople?: number;
    isHSECompliant?: boolean;
    legislationReferences?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
