import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';

export enum DelegationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

/**
 * Role Delegation Entity
 * Allows temporary delegation of roles/permissions
 * Used for: vacation coverage, executive assistants, temporary assignments
 */
@Entity('role_delegations')
@Index(['delegatorId', 'delegateId', 'status'])
@Index(['startDate', 'endDate'])
export class RoleDelegation extends BaseEntity {
  // Who is delegating
  @Column()
  delegatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'delegatorId' })
  delegator: User;

  // Who receives the delegation
  @Column()
  delegateId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'delegateId' })
  delegate: User;

  // What is being delegated
  @Column({ nullable: true })
  roleId?: string;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  // Or specific permissions
  @Column({ type: 'simple-array', nullable: true })
  permissionIds?: string[];

  // Time bounds
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  // Status
  @Column({
    type: 'enum',
    enum: DelegationStatus,
    default: DelegationStatus.PENDING,
  })
  status: DelegationStatus;

  // Scope restrictions
  @Column({ type: 'jsonb', nullable: true })
  scopeRestrictions?: {
    department?: string[];
    businessUnit?: string[];
    country?: string[];
    maxAmount?: number; // For financial approvals
    specificEmployees?: string[]; // Only for certain employees
  };

  // Approval workflow
  @Column({ nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver?: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string; // Why delegation is needed

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  // Revocation
  @Column({ nullable: true })
  revokedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ type: 'text', nullable: true })
  revocationReason?: string;

  // Auto-expiry
  @Column({ default: true })
  autoRevoke: boolean; // Auto-revoke after endDate

  // Notifications
  @Column({ default: false })
  notifyDelegator: boolean;

  @Column({ default: false })
  notifyDelegate: boolean;

  @Column({ default: 0 })
  remindersSent: number;

  // Audit
  @Column({ type: 'jsonb', nullable: true })
  auditLog?: Array<{
    timestamp: Date;
    action: string;
    actor: string;
    details: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    usageCount?: number; // How many times delegated permissions used
    lastUsedAt?: Date;
    actionsPerformed?: string[];
  };
}
