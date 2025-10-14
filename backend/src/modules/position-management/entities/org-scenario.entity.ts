import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ScenarioStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  IMPLEMENTED = 'IMPLEMENTED',
}

@Entity('org_scenarios')
export class OrgScenario extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column({ unique: true })
  scenarioId: string;

  @Column()
  scenarioName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ScenarioStatus,
    default: ScenarioStatus.DRAFT,
  })
  status: ScenarioStatus;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'jsonb' })
  baselineSnapshot: Record<string, any>;

  @Column({ type: 'jsonb' })
  proposedChanges: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  impactAnalysis?: {
    headcountChange: number;
    budgetChange: number;
    spanOfControlImpact: any;
  };

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
