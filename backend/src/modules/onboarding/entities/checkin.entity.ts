import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardCase } from './onboard-case.entity';

export enum CheckinType {
  DAY_30 = '30',
  DAY_60 = '60',
  DAY_90 = '90',
  PROBATION_END = 'PROBATION_END',
  CUSTOM = 'CUSTOM',
}

@Entity('onboarding_checkins')
export class Checkin extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  caseId: string;

  @ManyToOne(() => OnboardCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: OnboardCase;

  @Column({
    type: 'enum',
    enum: CheckinType,
  })
  type: CheckinType;

  @Column({ type: 'timestamp' })
  scheduledFor: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  submittedBy: string; // Manager/HR ID

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 or 1-10 scale

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'jsonb', nullable: true })
  formJson: {
    questions?: Array<{
      question: string;
      answer: string;
      rating?: number;
    }>;
    strengths?: string[];
    areasForImprovement?: string[];
    supportNeeded?: string;
    goals?: string[];
    [key: string]: any;
  };

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  nextAction: string;

  @Column({ type: 'timestamp', nullable: true })
  nextActionDue: Date;
}
