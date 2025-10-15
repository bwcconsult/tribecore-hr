import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Interview } from './interview.entity';

export enum ScorecardStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  OVERDUE = 'OVERDUE',
}

export enum Recommendation {
  STRONG_HIRE = 'STRONG_HIRE',
  HIRE = 'HIRE',
  MAYBE = 'MAYBE',
  NO_HIRE = 'NO_HIRE',
  STRONG_NO_HIRE = 'STRONG_NO_HIRE',
}

@Entity('scorecards')
export class Scorecard extends BaseEntity {
  @Column()
  interviewId: string;

  @ManyToOne(() => Interview)
  @JoinColumn({ name: 'interviewId' })
  interview: Interview;

  @Column()
  applicationId: string;

  @Column()
  organizationId: string;

  @Column()
  interviewerId: string;

  @Column()
  interviewerName: string;

  @Column({ nullable: true })
  interviewerRole: string;

  @Column({
    type: 'enum',
    enum: ScorecardStatus,
    default: ScorecardStatus.PENDING,
  })
  status: ScorecardStatus;

  // Competency-based scoring
  @Column({ type: 'jsonb', default: [] })
  competencies: Array<{
    id: string;
    name: string;
    description: string;
    score: number; // 1-5
    weight: number; // percentage
    notes: string;
    examples: string;
  }>;

  // Overall assessment
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @Column({
    type: 'enum',
    enum: Recommendation,
    nullable: true,
  })
  recommendation: Recommendation;

  // Structured feedback
  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  weaknesses: string;

  @Column({ type: 'text', nullable: true })
  cultureFitNotes: string;

  @Column({ type: 'text', nullable: true })
  nextStepsRecommendation: string;

  // Red/Amber/Green flags
  @Column({ type: 'jsonb', default: [] })
  flags: Array<{
    type: 'RED' | 'AMBER' | 'GREEN';
    category: string;
    description: string;
  }>;

  // Comparison with job requirements
  @Column({ type: 'jsonb', nullable: true })
  requirementsMatch: {
    mustHave: Array<{ requirement: string; met: boolean; notes: string }>;
    niceToHave: Array<{ requirement: string; met: boolean; notes: string }>;
  };

  // SLA tracking
  @Column({ type: 'timestamp' })
  dueAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ default: false })
  isOverdue: boolean;

  // Confidentiality
  @Column({ default: false })
  sharedWithCandidate: boolean;

  @Column({ default: false })
  sharedWithHiringManager: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    interviewDuration?: number;
    environmentNotes?: string;
    technicalSetup?: string;
    [key: string]: any;
  };

  /**
   * Calculate weighted score
   */
  calculateWeightedScore(): number {
    if (this.competencies.length === 0) return 0;
    
    const totalWeight = this.competencies.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = this.competencies.reduce((sum, c) => {
      return sum + (c.score * c.weight / 100);
    }, 0);

    return Number((weightedSum * 100 / totalWeight).toFixed(2));
  }

  /**
   * Check if complete
   */
  isComplete(): boolean {
    return this.status === ScorecardStatus.SUBMITTED;
  }

  /**
   * Mark as overdue
   */
  markOverdue(): void {
    if (new Date() > this.dueAt && this.status !== ScorecardStatus.SUBMITTED) {
      this.isOverdue = true;
      this.status = ScorecardStatus.OVERDUE;
    }
  }
}
