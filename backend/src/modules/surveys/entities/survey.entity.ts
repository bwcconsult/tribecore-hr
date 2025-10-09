import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SurveyType {
  ENGAGEMENT = 'ENGAGEMENT',
  PULSE = 'PULSE',
  EXIT = 'EXIT',
  ONBOARDING = 'ONBOARDING',
  PERFORMANCE = 'PERFORMANCE',
  CUSTOM = 'CUSTOM',
}

export enum SurveyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('surveys')
export class Survey extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: SurveyType })
  type: SurveyType;

  @Column({ type: 'enum', enum: SurveyStatus, default: SurveyStatus.DRAFT })
  status: SurveyStatus;

  @Column({ default: true })
  isAnonymous: boolean;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'jsonb' })
  questions: Array<{
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'YES_NO' | 'SCALE';
    required: boolean;
    options?: string[];
    order: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  targetAudience?: {
    departments?: string[];
    roles?: string[];
    employmentTypes?: string[];
  };

  @Column({ type: 'int', default: 0 })
  responseCount: number;

  @Column({ type: 'int', default: 0 })
  targetCount: number;

  @Column({ nullable: true })
  createdBy?: string;
}

@Entity('survey_responses')
export class SurveyResponse extends BaseEntity {
  @Column()
  surveyId: string;

  @Column({ nullable: true })
  employeeId?: string;

  @Column({ type: 'jsonb' })
  answers: Record<string, any>;

  @Column({ type: 'timestamp with time zone' })
  submittedAt: Date;

  @Column({ nullable: true })
  ipAddress?: string;
}
