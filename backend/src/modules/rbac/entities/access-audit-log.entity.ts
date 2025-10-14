import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Role & Permission Management
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REVOKED = 'ROLE_REVOKED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  DELEGATION_CREATED = 'DELEGATION_CREATED',
  DELEGATION_APPROVED = 'DELEGATION_APPROVED',
  DELEGATION_REVOKED = 'DELEGATION_REVOKED',
  
  // Data Access
  VIEW_EMPLOYEE_PROFILE = 'VIEW_EMPLOYEE_PROFILE',
  VIEW_PAYROLL_DATA = 'VIEW_PAYROLL_DATA',
  VIEW_PERFORMANCE_REVIEW = 'VIEW_PERFORMANCE_REVIEW',
  VIEW_SENSITIVE_DOCUMENT = 'VIEW_SENSITIVE_DOCUMENT',
  EXPORT_DATA = 'EXPORT_DATA',
  BULK_DATA_ACCESS = 'BULK_DATA_ACCESS',
  
  // Data Modification
  CREATE_EMPLOYEE = 'CREATE_EMPLOYEE',
  UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',
  UPDATE_SALARY = 'UPDATE_SALARY',
  PROCESS_PAYROLL = 'PROCESS_PAYROLL',
  APPROVE_PAYROLL = 'APPROVE_PAYROLL',
  TERMINATE_EMPLOYEE = 'TERMINATE_EMPLOYEE',
  
  // Policy Violations
  ACCESS_DENIED = 'ACCESS_DENIED',
  SOD_VIOLATION_DETECTED = 'SOD_VIOLATION_DETECTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  POLICY_OVERRIDE = 'POLICY_OVERRIDE',
  
  // System Administration
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  INTEGRATION_CONFIGURED = 'INTEGRATION_CONFIGURED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  DATA_PURGED = 'DATA_PURGED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Access Audit Log Entity
 * Immutable audit trail for compliance (SOC 2, ISO 27001, GDPR)
 */
@Entity('access_audit_logs')
@Index(['userId', 'action', 'timestamp'])
@Index(['entityType', 'entityId'])
@Index(['riskLevel', 'timestamp'])
@Index(['ipAddress'])
export class AccessAuditLog extends BaseEntity {
  // Actor
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  impersonatedBy?: string; // If action performed via impersonation

  // Action
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'text' })
  description: string;

  // Target entity
  @Column({ nullable: true })
  entityType?: string; // 'Employee', 'PayrollRun', 'PerformanceReview', etc.

  @Column({ nullable: true })
  entityId?: string;

  @Column({ nullable: true })
  entityName?: string; // Human-readable identifier

  // Request context
  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  requestUrl?: string;

  @Column({ nullable: true })
  requestMethod?: string; // GET, POST, PUT, DELETE

  @Column({ nullable: true })
  sessionId?: string;

  // Temporal
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'int', nullable: true })
  durationMs?: number; // How long the action took

  // Result
  @Column({ default: true })
  success: boolean;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  statusCode?: number; // HTTP status code

  // Risk assessment
  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  riskLevel: RiskLevel;

  @Column({ default: false })
  flaggedForReview: boolean;

  // Data changes (before/after)
  @Column({ type: 'jsonb', nullable: true })
  dataBefore?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  dataAfter?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  fieldsChanged?: string[];

  // Context
  @Column({ nullable: true })
  module?: string; // Payroll, Performance, Recruitment, etc.

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  businessUnit?: string;

  @Column({ nullable: true })
  department?: string;

  // Compliance
  @Column({ default: false })
  gdprRelevant: boolean; // Personal data access

  @Column({ default: false })
  financialData: boolean; // Financial data access

  @Column({ default: false })
  sensitiveData: boolean; // PII, medical, etc.

  // Delegation context
  @Column({ nullable: true })
  delegationId?: string; // If performed via delegation

  @Column({ nullable: true })
  onBehalfOf?: string; // If acting on behalf of another user

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    tags?: string[];
    reason?: string; // Why this action was performed
    ticketId?: string; // Related support ticket
    complianceReason?: string;
    retentionDays?: number; // How long to keep this log
  };

  // Make immutable
  @Column({ default: false })
  readonly immutable: boolean = true; // Prevent updates
}
