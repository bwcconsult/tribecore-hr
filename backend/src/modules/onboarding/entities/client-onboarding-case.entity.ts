import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClientTier } from './client-account.entity';

export enum ClientOnboardingStatus {
  INTAKE = 'INTAKE',
  KICKOFF = 'KICKOFF',
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  SOLUTION_CONFIG = 'SOLUTION_CONFIG',
  CONTRACT_LIVE = 'CONTRACT_LIVE',
  ENABLEMENT = 'ENABLEMENT',
  HYPERCARE = 'HYPERCARE',
  STEADY_STATE = 'STEADY_STATE',
  ON_HOLD = 'ON_HOLD',
  CHURNED = 'CHURNED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('client_onboarding_cases')
export class ClientOnboardingCase extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  accountId: string;

  @ManyToOne(() => require('./client-account.entity').ClientAccount, account => account.onboardingCases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: any;

  @Column({ nullable: true })
  csmId: string; // Customer Success Manager ID

  @Column({
    type: 'enum',
    enum: ClientTier,
  })
  tier: ClientTier;

  @Column()
  region: string;

  @Column({ type: 'date' })
  goLiveTarget: Date;

  @Column({
    type: 'enum',
    enum: ClientOnboardingStatus,
    default: ClientOnboardingStatus.INTAKE,
  })
  status: ClientOnboardingStatus;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  risk: RiskLevel;

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  kickoffDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  goLiveDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  hypercareEndDate: Date;

  @OneToMany(() => require('./workstream.entity').Workstream, workstream => workstream.case, { cascade: true })
  workstreams: any[];

  @OneToMany(() => require('./environment.entity').Environment, environment => environment.case, { cascade: true })
  environments: any[];

  @OneToMany(() => require('./risk.entity').Risk, risk => risk.case, { cascade: true })
  risks: any[];

  @Column({ type: 'jsonb', nullable: true })
  gateChecks: {
    securityApproved?: boolean;
    legalApproved?: boolean;
    billingApproved?: boolean;
    uatApproved?: boolean;
    runbookApproved?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    contractValue?: number;
    projectManager?: string;
    slackChannel?: string;
    jiraProject?: string;
    [key: string]: any;
  };
}
