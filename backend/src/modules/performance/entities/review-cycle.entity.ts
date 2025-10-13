import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ReviewCycleType {
  QUARTERLY = 'QUARTERLY',
  MID_YEAR = 'MID_YEAR',
  ANNUAL = 'ANNUAL',
  PROBATION = 'PROBATION',
  CUSTOM = 'CUSTOM',
}

export enum ReviewCycleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SELF_REVIEW_OPEN = 'SELF_REVIEW_OPEN',
  MANAGER_REVIEW_OPEN = 'MANAGER_REVIEW_OPEN',
  PEER_REVIEW_OPEN = 'PEER_REVIEW_OPEN',
  CALIBRATION = 'CALIBRATION',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export enum RatingScale {
  FOUR_POINT = 'FOUR_POINT', // 1-4
  FIVE_POINT = 'FIVE_POINT', // 1-5
  PERCENTAGE = 'PERCENTAGE', // 0-100%
}

@Entity('review_cycles')
export class ReviewCycle extends BaseEntity {
  @Column()
  name: string; // e.g., "Q4 2025 Performance Review"

  @Column({
    type: 'enum',
    enum: ReviewCycleType,
  })
  type: ReviewCycleType;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date' })
  selfReviewStartDate: Date;

  @Column({ type: 'date' })
  selfReviewEndDate: Date;

  @Column({ type: 'date' })
  managerReviewStartDate: Date;

  @Column({ type: 'date' })
  managerReviewEndDate: Date;

  @Column({ type: 'date', nullable: true })
  peerReviewStartDate: Date;

  @Column({ type: 'date', nullable: true })
  peerReviewEndDate: Date;

  @Column({ type: 'date', nullable: true })
  calibrationDate: Date;

  @Column({ type: 'date', nullable: true })
  publishDate: Date;

  @Column({
    type: 'enum',
    enum: ReviewCycleStatus,
    default: ReviewCycleStatus.DRAFT,
  })
  status: ReviewCycleStatus;

  @Column({
    type: 'enum',
    enum: RatingScale,
    default: RatingScale.FIVE_POINT,
  })
  ratingScale: RatingScale;

  @Column({ default: false })
  enablePeerReviews: boolean;

  @Column({ default: false })
  enableUpwardReviews: boolean;

  @Column({ default: false })
  allowAnonymousPeerReviews: boolean;

  @Column({ type: 'int', default: 3 })
  minimumPeerReviewers: number;

  @Column({ type: 'int', default: 5 })
  maximumPeerReviewers: number;

  @Column({ default: false })
  linkToCompensation: boolean;

  @Column({ default: true })
  requireCalibration: boolean;

  @OneToMany('ReviewForm', 'cycle')
  forms: any[];

  @Column({ type: 'jsonb' })
  config: {
    sections: Array<{
      name: string;
      weight: number; // Objectives 60%, Competencies 30%, Values 10%
      questions: Array<{
        id: string;
        text: string;
        type: 'RATING' | 'TEXT' | 'MULTILINE' | 'SCALE';
        required: boolean;
        competencyKey?: string;
      }>;
    }>;
    ratingDefinitions?: {
      [key: string]: { label: string; description: string };
    };
    guidelines?: string;
    calibrationGuidelines?: string;
  };

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'simple-array', nullable: true })
  applicableDepartments: string[]; // null = all

  @Column({ type: 'simple-array', nullable: true })
  excludedEmployeeIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    participantCount?: number;
    completionRate?: number;
    remindersSent?: number;
    escalationsSent?: number;
  };
}
