import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from './application.entity';

export enum InterviewType {
  PHONE_SCREEN = 'PHONE_SCREEN',
  VIDEO_INTERVIEW = 'VIDEO_INTERVIEW',
  IN_PERSON = 'IN_PERSON',
  TECHNICAL_ASSESSMENT = 'TECHNICAL_ASSESSMENT',
  PANEL_INTERVIEW = 'PANEL_INTERVIEW',
  CASE_STUDY = 'CASE_STUDY',
}

export enum InterviewOutcome {
  PENDING = 'PENDING',
  STRONG_YES = 'STRONG_YES',
  YES = 'YES',
  MAYBE = 'MAYBE',
  NO = 'NO',
  STRONG_NO = 'STRONG_NO',
}

@Entity('interviews')
export class Interview extends BaseEntity {
  @Column()
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: InterviewType,
  })
  type: InterviewType;

  @Column({ type: 'jsonb', default: [] })
  panel: Array<{
    userId: string;
    name: string;
    role: string;
  }>;

  @Column({ type: 'timestamp' })
  scheduledStart: Date;

  @Column({ type: 'timestamp' })
  scheduledEnd: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  meetingLink: string;

  @Column({ nullable: true })
  interviewKitId: string;

  // Scorecards from each panelist
  @Column({ type: 'jsonb', default: [] })
  scorecards: Array<{
    panelId: string;
    submittedAt: Date;
    scores: Array<{
      competency: string;
      score: number;
      maxScore: number;
      notes: string;
    }>;
    overallRating: number;
    recommendation: InterviewOutcome;
    feedback: string;
  }>;

  @Column({ type: 'date', nullable: true })
  feedbackDueAt: Date;

  @Column({
    type: 'enum',
    enum: InterviewOutcome,
    default: InterviewOutcome.PENDING,
  })
  outcome: InterviewOutcome;

  @Column({ type: 'text', nullable: true })
  consolidatedFeedback: string;

  @Column({ default: false })
  feedbackSharedWithCandidate: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    calendarEventId?: string;
    recordingUrl?: string;
    notesUrl?: string;
    [key: string]: any;
  };

  /**
   * Check if all feedback submitted
   */
  isAllFeedbackIn(): boolean {
    return this.scorecards.length === this.panel.length;
  }

  /**
   * Calculate average score
   */
  getAverageScore(): number | null {
    if (this.scorecards.length === 0) return null;
    const total = this.scorecards.reduce((sum, sc) => sum + sc.overallRating, 0);
    return total / this.scorecards.length;
  }
}
