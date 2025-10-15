import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClientOnboardingCase } from './client-onboarding-case.entity';

export enum RiskSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum RiskStatus {
  OPEN = 'Open',
  MITIGATING = 'Mitigating',
  CLOSED = 'Closed',
  ACCEPTED = 'Accepted',
}

@Entity('onboarding_risks')
export class Risk extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => ClientOnboardingCase, caseEntity => caseEntity.risks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: ClientOnboardingCase;

  @Column({
    type: 'enum',
    enum: RiskSeverity,
  })
  severity: RiskSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  mitigation: string;

  @Column({ nullable: true })
  ownerId: string; // User responsible for mitigation

  @Column({
    type: 'enum',
    enum: RiskStatus,
    default: RiskStatus.OPEN,
  })
  status: RiskStatus;

  @Column({ type: 'timestamp', nullable: true })
  identifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  targetResolutionDate: Date;

  @Column({ type: 'text', nullable: true })
  impact: string;

  @Column({ type: 'int', nullable: true })
  probability: number; // 1-5 scale

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    relatedTaskIds?: string[];
    escalated?: boolean;
    [key: string]: any;
  };
}
