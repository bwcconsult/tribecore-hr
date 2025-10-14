import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum CaseType {
  GENERAL_INQUIRY = 'GENERAL_INQUIRY',
  PAYROLL = 'PAYROLL',
  BENEFITS = 'BENEFITS',
  LEAVE = 'LEAVE',
  PERFORMANCE = 'PERFORMANCE',
  ONBOARDING = 'ONBOARDING',
  OFFBOARDING = 'OFFBOARDING',
  IT_ACCESS = 'IT_ACCESS',
  EQUIPMENT = 'EQUIPMENT',
  POLICY_QUESTION = 'POLICY_QUESTION',
  DOCUMENT_REQUEST = 'DOCUMENT_REQUEST',
  EMPLOYEE_RELATIONS = 'EMPLOYEE_RELATIONS', // Separate from general
  OTHER = 'OTHER',
}

export enum CasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum CaseStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_EMPLOYEE = 'PENDING_EMPLOYEE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum CaseChannel {
  PORTAL = 'PORTAL',
  EMAIL = 'EMAIL',
  SLACK = 'SLACK',
  TEAMS = 'TEAMS',
  PHONE = 'PHONE',
  WALK_IN = 'WALK_IN',
}

/**
 * HR Case Entity
 * Tracks all HR service requests from employees
 */
@Entity('hr_cases')
@Index(['organizationId', 'status'])
@Index(['employeeId', 'status'])
@Index(['assignedTo', 'status'])
export class HRCase extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Case identification
  @Column({ unique: true })
  @Index()
  caseNumber: string; // Auto-generated: CASE-2025-0001

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: CaseType,
  })
  @Index()
  caseType: CaseType;

  @Column({
    type: 'enum',
    enum: CasePriority,
    default: CasePriority.MEDIUM,
  })
  @Index()
  priority: CasePriority;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.NEW,
  })
  @Index()
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: CaseChannel,
  })
  channel: CaseChannel;

  // Requester
  @Column()
  @Index()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ nullable: true })
  requesterEmail?: string;

  @Column({ nullable: true })
  requesterPhone?: string;

  // Assignment
  @Column({ nullable: true })
  @Index()
  assignedTo?: string; // HR team member user ID

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee?: User;

  @Column({ nullable: true })
  assignedAt?: Date;

  @Column({ nullable: true })
  assignedBy?: string;

  // SLA tracking
  @Column({ type: 'timestamp' })
  @Index()
  createdTimestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstResponseAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ type: 'int', nullable: true })
  firstResponseSLA?: number; // Target in minutes

  @Column({ type: 'int', nullable: true })
  resolutionSLA?: number; // Target in minutes

  @Column({ default: false })
  slaBreached: boolean;

  @Column({ nullable: true })
  slaBreachReason?: string;

  // Resolution
  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ nullable: true })
  resolvedBy?: string;

  @Column({ nullable: true })
  resolutionCategory?: string; // 'RESOLVED', 'DUPLICATE', 'CANT_REPRODUCE', etc.

  // Related items
  @Column({ nullable: true })
  relatedCaseId?: string; // Link to parent/related case

  @Column({ type: 'simple-array', nullable: true })
  relatedDocuments?: string[]; // Document IDs

  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[]; // S3 URLs

  // Knowledge base deflection
  @Column({ default: false })
  deflected: boolean; // Did KB article resolve without creating case?

  @Column({ type: 'simple-array', nullable: true })
  suggestedArticles?: string[]; // KB article IDs shown to user

  // Satisfaction
  @Column({ type: 'int', nullable: true })
  satisfactionScore?: number; // 1-5 rating

  @Column({ type: 'text', nullable: true })
  satisfactionComments?: string;

  @Column({ nullable: true, type: 'timestamp' })
  satisfactionSurveyCompletedAt?: Date;

  // Escalation
  @Column({ default: false })
  escalated: boolean;

  @Column({ nullable: true })
  escalatedTo?: string; // User ID

  @Column({ nullable: true, type: 'timestamp' })
  escalatedAt?: Date;

  @Column({ nullable: true })
  escalationReason?: string;

  // Tags & categorization
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  subcategory?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @OneToMany(() => CaseComment, comment => comment.case)
  comments?: CaseComment[];

  @OneToMany(() => CaseActivity, activity => activity.case)
  activities?: CaseActivity[];
}

/**
 * Case Comment Entity
 * Tracks all communication on a case
 */
@Entity('hr_case_comments')
export class CaseComment extends BaseEntity {
  @Column()
  @Index()
  caseId: string;

  @ManyToOne(() => HRCase, hrCase => hrCase.comments)
  @JoinColumn({ name: 'caseId' })
  case: HRCase;

  @Column({ type: 'text' })
  comment: string;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorName: string;

  @Column({ default: true })
  isInternal: boolean; // Internal notes vs. visible to employee

  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  commentedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

/**
 * Case Activity Entity
 * Audit log of all case actions
 */
@Entity('hr_case_activities')
@Index(['caseId', 'createdAt'])
export class CaseActivity extends BaseEntity {
  @Column()
  @Index()
  caseId: string;

  @ManyToOne(() => HRCase, hrCase => hrCase.activities)
  @JoinColumn({ name: 'caseId' })
  case: HRCase;

  @Column()
  activityType: string; // 'CREATED', 'ASSIGNED', 'COMMENTED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', etc.

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  performedBy?: string; // User ID

  @Column({ nullable: true })
  performedByName?: string;

  @Column({ type: 'jsonb', nullable: true })
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  occurredAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
