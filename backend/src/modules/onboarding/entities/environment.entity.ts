import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClientOnboardingCase } from './client-onboarding-case.entity';

export enum EnvironmentType {
  SANDBOX = 'sandbox',
  UAT = 'uat',
  STAGING = 'staging',
  PRODUCTION = 'prod',
}

export enum EnvironmentStatus {
  PENDING = 'PENDING',
  PROVISIONING = 'PROVISIONING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

@Entity('environments')
export class Environment extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => ClientOnboardingCase, caseEntity => caseEntity.environments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: ClientOnboardingCase;

  @Column({
    type: 'enum',
    enum: EnvironmentType,
  })
  envType: EnvironmentType;

  @Column()
  region: string; // us-east-1, eu-west-1, etc.

  @Column()
  domain: string; // customer-sandbox.tribecore.com

  @Column({
    type: 'enum',
    enum: EnvironmentStatus,
    default: EnvironmentStatus.PENDING,
  })
  status: EnvironmentStatus;

  @Column({ nullable: true })
  apiKeyRef: string; // Reference to secure key storage

  @Column({ nullable: true })
  ssoConfig: string; // SAML/OIDC configuration reference

  @Column({ type: 'timestamp', nullable: true })
  provisionedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  goLiveAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    instanceId?: string;
    databaseSize?: string;
    storageSize?: string;
    customDomain?: string;
    ipWhitelist?: string[];
    features?: string[];
    [key: string]: any;
  };
}
