import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  PENDING_MANAGER = 'PENDING_MANAGER',
  PENDING_HR = 'PENDING_HR',
  APPROVED = 'APPROVED',
  IMPLEMENTED = 'IMPLEMENTED',
}

@Entity('compensation_reviews')
export class CompensationReview extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column({ unique: true })
  reviewId: string;

  @Column()
  @Index()
  employeeId: string;

  @Column()
  fiscalYear: string;

  @Column()
  reviewCycle: string; // 'ANNUAL', 'PROMOTION', 'MARKET_ADJUSTMENT'

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.DRAFT,
  })
  status: ReviewStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  currentSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  proposedSalary?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  increasePercent?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  bonusAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  equityGrant?: number;

  @Column({ type: 'text', nullable: true })
  rationale?: string;

  @Column({ nullable: true })
  proposedBy?: string;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
