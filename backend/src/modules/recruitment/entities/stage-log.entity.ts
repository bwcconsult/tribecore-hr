import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ActionType {
  // Application actions
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  STAGE_CHANGED = 'STAGE_CHANGED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',
  
  // Interview actions
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_RESCHEDULED = 'INTERVIEW_RESCHEDULED',
  INTERVIEW_CANCELLED = 'INTERVIEW_CANCELLED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  SCORECARD_SUBMITTED = 'SCORECARD_SUBMITTED',
  SCORECARD_OVERDUE = 'SCORECARD_OVERDUE',
  
  // Offer actions
  OFFER_CREATED = 'OFFER_CREATED',
  OFFER_SUBMITTED_FOR_APPROVAL = 'OFFER_SUBMITTED_FOR_APPROVAL',
  OFFER_APPROVED = 'OFFER_APPROVED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_VIEWED = 'OFFER_VIEWED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  OFFER_WITHDRAWN = 'OFFER_WITHDRAWN',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  
  // Check actions
  CHECK_INITIATED = 'CHECK_INITIATED',
  CHECK_COMPLETED = 'CHECK_COMPLETED',
  CHECK_FAILED = 'CHECK_FAILED',
  CHECK_WAIVED = 'CHECK_WAIVED',
  
  // Hire actions
  CANDIDATE_HIRED = 'CANDIDATE_HIRED',
  CONVERTED_TO_EMPLOYEE = 'CONVERTED_TO_EMPLOYEE',
  ONBOARDING_STARTED = 'ONBOARDING_STARTED',
  
  // Communication
  EMAIL_SENT = 'EMAIL_SENT',
  SMS_SENT = 'SMS_SENT',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  
  // Document actions
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_SIGNED = 'DOCUMENT_SIGNED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  
  // Data actions
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_ANONYMIZED = 'DATA_ANONYMIZED',
  
  // Requisition actions
  REQUISITION_CREATED = 'REQUISITION_CREATED',
  REQUISITION_SUBMITTED = 'REQUISITION_SUBMITTED',
  REQUISITION_APPROVED = 'REQUISITION_APPROVED',
  REQUISITION_REJECTED = 'REQUISITION_REJECTED',
  JOB_POSTED = 'JOB_POSTED',
  JOB_CLOSED = 'JOB_CLOSED',
}

@Entity('recruitment_stage_logs')
@Index(['objectType', 'objectId', 'createdAt'])
@Index(['applicationId', 'createdAt'])
@Index(['actorId', 'createdAt'])
export class StageLog extends BaseEntity {
  @Column()
  organizationId: string;

  // What object this action relates to
  @Column()
  objectType: string; // APPLICATION, INTERVIEW, OFFER, CHECK, REQUISITION

  @Column()
  objectId: string;

  // Always link to application (if applicable)
  @Column({ nullable: true })
  @Index()
  applicationId: string;

  @Column({ nullable: true })
  candidateId: string;

  @Column({ nullable: true })
  requisitionId: string;

  // Who did it
  @Column({ nullable: true })
  actorId: string; // null for system actions

  @Column({ nullable: true })
  actorName: string;

  @Column({ nullable: true })
  actorRole: string;

  @Column({ default: false })
  isSystemAction: boolean;

  // What happened
  @Column({
    type: 'enum',
    enum: ActionType,
  })
  action: ActionType;

  @Column({ nullable: true })
  fromValue: string; // Previous value (e.g., previous stage)

  @Column({ nullable: true })
  toValue: string; // New value

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  reasonCategory: string; // Structured reason code

  // Detailed payload (before/after)
  @Column({ type: 'jsonb', nullable: true })
  payload: {
    before?: any;
    after?: any;
    metadata?: any;
    [key: string]: any;
  };

  // Context
  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  source: string; // WEB, API, EMAIL, SLACK, MOBILE

  // Compliance tracking
  @Column({ default: false })
  requiresAudit: boolean;

  @Column({ default: false })
  isPIIRelated: boolean;

  @Column({ default: false })
  isComplianceEvent: boolean;

  // Duration tracking (for time-to-X metrics)
  @Column({ type: 'int', nullable: true })
  durationFromPreviousMs: number; // Milliseconds from previous action

  @Column({ type: 'int', nullable: true })
  durationFromStartMs: number; // Milliseconds from application start

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    notificationSent?: boolean;
    webhookFired?: boolean;
    relatedLogIds?: string[];
    [key: string]: any;
  };

  /**
   * Create a log entry
   */
  static create(params: {
    organizationId: string;
    objectType: string;
    objectId: string;
    applicationId?: string;
    candidateId?: string;
    requisitionId?: string;
    actorId?: string;
    actorName?: string;
    actorRole?: string;
    action: ActionType;
    fromValue?: string;
    toValue?: string;
    comment?: string;
    reasonCategory?: string;
    payload?: any;
    isSystemAction?: boolean;
  }): StageLog {
    const log = new StageLog();
    Object.assign(log, params);
    log.isSystemAction = params.isSystemAction || !params.actorId;
    return log;
  }
}
