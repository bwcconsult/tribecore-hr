import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardCase } from './onboard-case.entity';

export enum ProvisioningSystem {
  EMAIL = 'EMAIL',
  SSO = 'SSO',
  LAPTOP = 'LAPTOP',
  VPN = 'VPN',
  SLACK = 'SLACK',
  JIRA = 'JIRA',
  GITHUB = 'GITHUB',
  AWS = 'AWS',
  AZURE = 'AZURE',
  GCP = 'GCP',
  OFFICE365 = 'OFFICE365',
  ZOOM = 'ZOOM',
  OTHER = 'OTHER',
}

export enum ProvisioningStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('provisioning_tickets')
export class ProvisioningTicket extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  caseId: string;

  @ManyToOne(() => OnboardCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: OnboardCase;

  @Column({
    type: 'enum',
    enum: ProvisioningSystem,
  })
  system: ProvisioningSystem;

  @Column({ nullable: true })
  externalRef: string; // Reference to external system ticket/ID

  @Column({
    type: 'enum',
    enum: ProvisioningStatus,
    default: ProvisioningStatus.PENDING,
  })
  status: ProvisioningStatus;

  @Column({ nullable: true })
  assignedTo: string; // IT admin user ID

  @Column({ type: 'timestamp', nullable: true })
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadataJson: {
    email?: string;
    groups?: string[];
    permissions?: string[];
    hardwareSpec?: any;
    softwareList?: string[];
    serialNumber?: string;
    licenseKey?: string;
    [key: string]: any;
  };
}
