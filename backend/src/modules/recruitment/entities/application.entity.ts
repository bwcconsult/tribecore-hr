import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Candidate } from './candidate.entity';
import { JobPosting } from './job-posting.entity';

export enum ApplicationStage {
  NEW = 'NEW',
  SCREENING = 'SCREENING',
  HM_SCREEN = 'HM_SCREEN',
  ASSESSMENT = 'ASSESSMENT',
  INTERVIEW = 'INTERVIEW',
  PANEL = 'PANEL',
  REFERENCE_CHECK = 'REFERENCE_CHECK',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
}

export enum ApplicationStatus {
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
}

@Entity('applications')
export class Application extends BaseEntity {
  @Column()
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column()
  jobPostingId: string;

  @ManyToOne(() => JobPosting)
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPosting;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: ApplicationStage,
    default: ApplicationStage.NEW,
  })
  stage: ApplicationStage;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.ACTIVE,
  })
  status: ApplicationStatus;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ nullable: true })
  coverLetterUrl: string;

  // Screening answers (custom questions)
  @Column({ type: 'jsonb', nullable: true })
  screeningAnswers: Array<{
    questionId: string;
    question: string;
    answer: string;
    isKnockout?: boolean;
    knockoutFailed?: boolean;
  }>;

  // Tags for filtering
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  // Scoring
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  scoreTotal: number;

  @Column({ type: 'jsonb', nullable: true })
  scores: Array<{
    criteriaId: string;
    criteriaName: string;
    score: number;
    maxScore: number;
    scoredBy: string;
    scoredAt: Date;
  }>;

  // Red/Amber/Green flags
  @Column({ type: 'jsonb', default: [] })
  flags: Array<{
    type: 'RED' | 'AMBER' | 'GREEN';
    reason: string;
    raisedBy: string;
    raisedAt: Date;
  }>;

  // Rejection
  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  rejectionFeedback: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  // Agency tracking
  @Column({ nullable: true })
  agencyId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  agencyFeePercent: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    referralSource?: string;
    referredBy?: string;
    appliedVia?: string;
    utm_source?: string;
    disabilityAdjustmentsNeeded?: boolean;
    adjustmentDetails?: string;
    [key: string]: any;
  };

  /**
   * Move to next stage
   */
  advance(nextStage: ApplicationStage): void {
    this.stage = nextStage;
  }

  /**
   * Reject application
   */
  reject(reason: string, feedback?: string): void {
    this.status = ApplicationStatus.REJECTED;
    this.rejectionReason = reason;
    this.rejectionFeedback = feedback;
    this.rejectedAt = new Date();
  }

  /**
   * Check if has red flags
   */
  hasRedFlags(): boolean {
    return this.flags.some(f => f.type === 'RED');
  }
}
