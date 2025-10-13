import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ReviewCycle } from './review-cycle.entity';

export enum ReviewFormType {
  SELF = 'SELF',
  MANAGER = 'MANAGER',
  PEER = 'PEER',
  UPWARD = 'UPWARD',
}

export enum ReviewFormStatus {
  NOT_STARTED = 'NOT_STARTED',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CALIBRATED = 'CALIBRATED',
  PUBLISHED = 'PUBLISHED',
}

@Entity('review_forms')
export class ReviewForm extends BaseEntity {
  @Column()
  cycleId: string;

  @ManyToOne('ReviewCycle', 'forms', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycleId' })
  cycle: any;

  @Column()
  userId: string; // Employee being reviewed

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column()
  reviewerId: string; // Person filling out the form

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: Employee;

  @Column({
    type: 'enum',
    enum: ReviewFormType,
  })
  type: ReviewFormType;

  @Column({
    type: 'enum',
    enum: ReviewFormStatus,
    default: ReviewFormStatus.NOT_STARTED,
  })
  status: ReviewFormStatus;

  @Column({ type: 'jsonb' })
  sections: Array<{
    sectionName: string;
    questions: Array<{
      questionId: string;
      answer: any; // Could be text, number, array
      rating?: number;
      evidence?: string[];
    }>;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallRating: number;

  @Column({ type: 'text', nullable: true })
  overallComments: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  areasForImprovement: string;

  @Column({ type: 'text', nullable: true })
  developmentGoals: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSavedAt: Date;

  @Column({ type: 'int', default: 0 })
  timeSpentMinutes: number;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ default: false })
  aiSummaryGenerated: boolean;

  @Column({ type: 'text', nullable: true })
  aiSummary: string;

  @Column({ type: 'simple-array', nullable: true })
  autoPopulatedData: string[]; // IDs of objectives, feedback that were pulled in

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    version?: number;
    editHistory?: Array<{
      timestamp: Date;
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    remindersSent?: number;
    flaggedForReview?: boolean;
  };
}
