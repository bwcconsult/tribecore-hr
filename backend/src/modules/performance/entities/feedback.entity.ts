import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum FeedbackType {
  PRIVATE = 'PRIVATE', // Private coaching
  PUBLIC = 'PUBLIC', // Public kudos
  PEER = 'PEER', // Peer feedback
  UPWARD = 'UPWARD', // Upward to manager
  REQUESTED = 'REQUESTED', // 360 requested
}

export enum FeedbackVisibility {
  PRIVATE_TO_RECIPIENT_AND_MANAGER = 'PRIVATE_TO_RECIPIENT_AND_MANAGER',
  PUBLIC_TO_TEAM = 'PUBLIC_TO_TEAM',
  PUBLIC_TO_ORG = 'PUBLIC_TO_ORG',
  ANONYMOUS = 'ANONYMOUS',
}

@Entity('feedback')
export class Feedback extends BaseEntity {
  @Column()
  fromUserId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: Employee;

  @Column()
  toUserId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'toUserId' })
  toUser: Employee;

  @Column({
    type: 'enum',
    enum: FeedbackType,
  })
  type: FeedbackType;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // Competencies: Technical Depth, Problem Solving, etc.

  @Column({ type: 'simple-array', nullable: true })
  values: string[]; // Company values

  @Column({
    type: 'enum',
    enum: FeedbackVisibility,
    default: FeedbackVisibility.PRIVATE_TO_RECIPIENT_AND_MANAGER,
  })
  visibility: FeedbackVisibility;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ default: false })
  addToNextOneOnOne: boolean;

  @Column({ nullable: true })
  relatedObjectiveId: string;

  @Column({ nullable: true })
  relatedReviewCycleId: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ default: false })
  isAcknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    requestId?: string; // If this was requested feedback
    sentiment?: 'POSITIVE' | 'CONSTRUCTIVE' | 'NEUTRAL';
    category?: string;
  };
}
