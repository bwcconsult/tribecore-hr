import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AISystem } from './ai-system.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum DecisionOutcome {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  OVERRIDDEN = 'OVERRIDDEN',
}

/**
 * AI Decision Log Entity
 * Logs all decisions made by AI systems for audit trail
 * Required for EU AI Act compliance (Article 12 - Record-keeping)
 */
@Entity('ai_decision_logs')
@Index(['aiSystemId', 'createdAt'])
@Index(['subjectType', 'subjectId'])
export class AIDecisionLog extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  @Index()
  aiSystemId: string;

  @ManyToOne(() => AISystem)
  @JoinColumn({ name: 'aiSystemId' })
  aiSystem: AISystem;

  // Subject of the decision (e.g., candidate, employee)
  @Column()
  subjectType: string; // 'CANDIDATE', 'EMPLOYEE', 'APPLICATION', etc.

  @Column()
  subjectId: string; // ID of the candidate/employee/application

  @Column({ nullable: true })
  subjectName?: string;

  // Decision details
  @Column({ type: 'text' })
  decisionType: string; // 'CV_SCORE', 'PERFORMANCE_RATING', 'ATTRITION_RISK', etc.

  @Column({
    type: 'enum',
    enum: DecisionOutcome,
  })
  outcome: DecisionOutcome;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidenceScore?: number; // 0.0 - 1.0

  // AI output
  @Column({ type: 'jsonb' })
  aiOutput: {
    recommendation: string;
    score?: number;
    reasoning?: string[];
    factors?: Record<string, any>;
    alternatives?: any[];
  };

  // Input data (sanitized - no PII if possible)
  @Column({ type: 'jsonb', nullable: true })
  inputData?: Record<string, any>;

  // Human review
  @Column({ default: false })
  humanReviewed: boolean;

  @Column({ nullable: true })
  reviewedBy?: string; // User ID

  @Column({ nullable: true })
  reviewerName?: string;

  @Column({ nullable: true, type: 'timestamp' })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ default: false })
  overridden: boolean; // Did human override AI decision?

  @Column({ type: 'text', nullable: true })
  overrideReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  finalDecision?: {
    outcome: string;
    decidedBy: string; // 'AI' or 'HUMAN'
    timestamp: string;
  };

  // Model info at time of decision
  @Column({ nullable: true })
  modelVersion?: string;

  @Column({ nullable: true })
  modelEndpoint?: string;

  // Compliance & audit
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  decisionTimestamp: Date;

  @Column({ default: false })
  auditFlagged: boolean; // Flagged for compliance review

  @Column({ nullable: true })
  auditNotes?: string;

  // Feedback & outcomes
  @Column({ default: false })
  feedbackReceived: boolean;

  @Column({ type: 'jsonb', nullable: true })
  outcomeTracking?: {
    actualOutcome?: string; // What actually happened
    aiCorrect?: boolean; // Was AI prediction correct?
    feedbackDate?: string;
    notes?: string;
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
