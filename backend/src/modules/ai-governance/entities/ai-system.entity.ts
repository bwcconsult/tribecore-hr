import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum AIRiskLevel {
  MINIMAL = 'MINIMAL', // Low-risk (e.g., spam filters)
  LIMITED = 'LIMITED', // Limited-risk (e.g., chatbots with transparency)
  HIGH = 'HIGH', // High-risk (e.g., recruitment scoring, performance evaluation)
  UNACCEPTABLE = 'UNACCEPTABLE', // Prohibited (e.g., social scoring, emotion recognition)
}

export enum AISystemStatus {
  ACTIVE = 'ACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DECOMMISSIONED = 'DECOMMISSIONED',
  PROHIBITED = 'PROHIBITED',
}

export enum AIUsageArea {
  RECRUITMENT = 'RECRUITMENT', // CV screening, candidate scoring
  PERFORMANCE = 'PERFORMANCE', // Performance predictions, ratings
  SCHEDULING = 'SCHEDULING', // Shift optimization
  PAYROLL = 'PAYROLL', // Forecasting, anomaly detection
  LEARNING = 'LEARNING', // Course recommendations
  ATTRITION = 'ATTRITION', // Turnover prediction
  CHATBOT = 'CHATBOT', // HR chatbot
  OTHER = 'OTHER',
}

/**
 * AI System Entity
 * Catalog of all AI systems used in HR processes
 * Required for EU AI Act compliance
 */
@Entity('ai_systems')
export class AISystem extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // System identification
  @Column()
  name: string; // "Recruitment CV Scoring AI"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  vendor: string; // "OpenAI", "Custom", "Google", etc.

  @Column({ nullable: true })
  vendorContact?: string;

  // Risk classification
  @Column({
    type: 'enum',
    enum: AIRiskLevel,
  })
  @Index()
  riskLevel: AIRiskLevel;

  @Column({
    type: 'enum',
    enum: AIUsageArea,
  })
  @Index()
  usageArea: AIUsageArea;

  @Column({
    type: 'enum',
    enum: AISystemStatus,
    default: AISystemStatus.UNDER_REVIEW,
  })
  @Index()
  status: AISystemStatus;

  // Compliance & documentation
  @Column({ default: false })
  requiresHumanReview: boolean; // EU AI Act: High-risk AI needs human oversight

  @Column({ default: false })
  hasTransparencyNotice: boolean; // Users must be notified

  @Column({ type: 'text', nullable: true })
  transparencyNoticeText?: string;

  @Column({ default: false })
  hasDataProtectionImpactAssessment: boolean; // DPIA completed

  @Column({ nullable: true, type: 'date' })
  dpiaCompletedDate?: Date;

  @Column({ nullable: true })
  dpiaDocumentUrl?: string;

  // Training data & model info
  @Column({ type: 'text', nullable: true })
  trainingDataSources?: string; // Description of data used

  @Column({ nullable: true })
  modelVersion?: string;

  @Column({ nullable: true, type: 'date' })
  lastModelUpdate?: Date;

  // Bias & fairness testing
  @Column({ default: false })
  biasTested: boolean;

  @Column({ nullable: true, type: 'date' })
  lastBiasTestDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  biasTestResults?: {
    gender?: number; // Disparate impact ratio
    ethnicity?: number;
    age?: number;
    disability?: number;
    testDate: string;
    testMethod: string;
    notes?: string;
  };

  // Performance metrics
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number;
    falsePositiveRate?: number;
    falseNegativeRate?: number;
  };

  // Human-in-the-loop config
  @Column({ type: 'jsonb', nullable: true })
  humanReviewConfig?: {
    reviewThreshold?: number; // Confidence score below which human review required
    reviewerRoles?: string[]; // Which roles can review
    overrideAllowed: boolean;
    escalationPath?: string;
  };

  // Audit & logging
  @Column({ default: false })
  loggingEnabled: boolean;

  @Column({ default: 90 })
  logRetentionDays: number; // EU AI Act: Logs must be kept for audits

  @Column({ nullable: true })
  auditLogLocation?: string; // S3 bucket, database table, etc.

  // Prohibited practices detection
  @Column({ type: 'jsonb', nullable: true })
  prohibitedPracticesCheck?: {
    emotionRecognition: boolean; // PROHIBITED by EU AI Act
    socialScoring: boolean; // PROHIBITED
    manipulativeTechniques: boolean; // PROHIBITED
    vulnerableGroupExploitation: boolean; // PROHIBITED
    checkDate: string;
  };

  // Responsible person
  @Column({ nullable: true })
  ownerId: string; // User responsible for this AI system

  @Column({ nullable: true })
  ownerName?: string;

  @Column({ nullable: true })
  ownerEmail?: string;

  // Review & certification
  @Column({ nullable: true, type: 'date' })
  lastReviewDate?: Date;

  @Column({ nullable: true, type: 'date' })
  nextReviewDate?: Date;

  @Column({ default: false })
  certified: boolean; // Certified for use

  @Column({ nullable: true })
  certifiedBy?: string;

  @Column({ nullable: true, type: 'date' })
  certificationDate?: Date;

  @Column({ nullable: true, type: 'date' })
  certificationExpiryDate?: Date;

  // Integration details
  @Column({ nullable: true })
  apiEndpoint?: string;

  @Column({ type: 'jsonb', nullable: true })
  integrationConfig?: Record<string, any>;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
