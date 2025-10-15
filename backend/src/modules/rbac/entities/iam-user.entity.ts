import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';

export enum IamUserType {
  SERVICE_ACCOUNT = 'SERVICE_ACCOUNT',
  EXTERNAL_USER = 'EXTERNAL_USER',
  CONTRACTOR = 'CONTRACTOR',
  CONSULTANT = 'CONSULTANT',
  AUDITOR = 'AUDITOR',
  TEMPORARY = 'TEMPORARY',
}

export enum IamUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

@Entity('iam_users')
export class IamUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Basic Info
  @Column()
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({
    type: 'enum',
    enum: IamUserType,
    default: IamUserType.EXTERNAL_USER,
  })
  type: IamUserType;

  @Column({
    type: 'enum',
    enum: IamUserStatus,
    default: IamUserStatus.ACTIVE,
  })
  status: IamUserStatus;

  // Access Control
  @Column('simple-array')
  roles: string[]; // Array of role codes: ['MANAGER', 'HR_MANAGER']

  @Column('simple-json', { nullable: true })
  permissions: Record<string, any>; // Custom permissions

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>; // Additional metadata

  // Service Account Specific
  @Column({ nullable: true })
  apiKey: string; // For service accounts

  @Column({ type: 'timestamp', nullable: true })
  apiKeyExpiresAt: Date;

  @Column({ default: false })
  isServiceAccount: boolean;

  // Access Restrictions
  @Column('simple-array', { nullable: true })
  allowedIpAddresses: string[]; // IP whitelist

  @Column({ type: 'timestamp', nullable: true })
  accessExpiresAt: Date; // For temporary access

  @Column({ nullable: true })
  externalCompany: string; // For contractors/consultants

  @Column({ nullable: true })
  purpose: string; // Purpose of access

  // Security
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  loginCount: number;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ default: true })
  requiresMfa: boolean;

  // Audit
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  modifiedBy: string;

  @Column({ nullable: true })
  deactivatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @Column({ nullable: true })
  deactivationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
