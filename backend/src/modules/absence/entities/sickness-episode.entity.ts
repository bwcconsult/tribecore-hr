import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SicknessType {
  GENERAL = 'GENERAL',
  INJURY = 'INJURY',
  CHRONIC_CONDITION = 'CHRONIC_CONDITION',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  COVID19 = 'COVID19',
  OTHER = 'OTHER',
}

/**
 * SicknessEpisode Entity
 * Tracks sickness absence episodes with special handling
 */
@Entity('sickness_episodes')
@Index(['userId', 'startDate'])
export class SicknessEpisode extends BaseEntity {
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Related Absence Request (if created)
  @Column({ nullable: true })
  absenceRequestId?: string;

  // Episode Dates
  @Column({ type: 'date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date; // Null if still ongoing

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalDays?: number; // Calculated working days

  // Sickness Details
  @Column({
    type: 'enum',
    enum: SicknessType,
    default: SicknessType.GENERAL,
  })
  sicknessType: SicknessType;

  @Column({ type: 'text', nullable: true })
  reason?: string; // General description

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  // Medical Certificate
  @Column({ default: false })
  isCertified: boolean; // Has medical certificate (typically required after 7 days)

  @Column({ type: 'date', nullable: true })
  certificateDate?: Date;

  @Column({ type: 'date', nullable: true })
  certificateValidUntil?: Date;

  @Column({ type: 'simple-array', nullable: true })
  certificateAttachmentIds?: string[];

  // Return to Work
  @Column({ default: false })
  isReturnedToWork: boolean;

  @Column({ type: 'date', nullable: true })
  returnToWorkDate?: Date;

  @Column({ default: false })
  requiresRTWInterview: boolean; // Trigger return-to-work interview

  @Column({ default: false })
  rtwInterviewCompleted: boolean;

  @Column({ nullable: true })
  rtwInterviewerId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'rtwInterviewerId' })
  rtwInterviewer?: User;

  @Column({ type: 'date', nullable: true })
  rtwInterviewDate?: Date;

  @Column({ type: 'text', nullable: true })
  rtwInterviewNotes?: string;

  // Thresholds & Triggers
  @Column({ default: false })
  triggersThreshold: boolean; // e.g., 3rd episode in 12 months

  @Column({ nullable: true })
  thresholdType?: string; // EPISODE_COUNT, TOTAL_DAYS, PATTERN

  @Column({ type: 'text', nullable: true })
  thresholdMessage?: string;

  // Related Cases
  @Column({ default: false })
  isRelatedToWorkplace: boolean; // Work-related injury/illness

  @Column({ nullable: true })
  incidentReportId?: string;

  // Notifications & Tasks
  @Column({ type: 'simple-array', nullable: true })
  generatedTaskIds?: string[]; // Tasks created (RTW interview, HR review, etc.)

  @Column({ type: 'jsonb', nullable: true })
  notificationsSent?: {
    type: string;
    sentAt: string;
    recipientId: string;
  }[];

  // Audit
  @Column({ nullable: true })
  createdByUserId?: string;

  @Column({ nullable: true })
  modifiedByUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
