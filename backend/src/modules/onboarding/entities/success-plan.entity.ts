import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClientOnboardingCase } from './client-onboarding-case.entity';

export enum ReviewCadence {
  WEEKLY = 'Weekly',
  BIWEEKLY = 'Biweekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
}

@Entity('success_plans')
export class SuccessPlan extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => ClientOnboardingCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: ClientOnboardingCase;

  @Column({ type: 'jsonb', default: [] })
  objectives: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    achieved: boolean;
  }>;

  @Column({ type: 'jsonb', default: [] })
  kpis: Array<{
    id: string;
    name: string;
    target: number;
    actual?: number;
    unit: string; // %, users, $, etc.
    frequency: string; // weekly, monthly, quarterly
  }>;

  @Column({
    type: 'enum',
    enum: ReviewCadence,
    default: ReviewCadence.MONTHLY,
  })
  reviewCadence: ReviewCadence;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ownerCSM?: string;
    executiveSponsor?: string;
    successCriteria?: string[];
    milestones?: Array<{
      name: string;
      targetDate: string;
      completed: boolean;
    }>;
    [key: string]: any;
  };
}
