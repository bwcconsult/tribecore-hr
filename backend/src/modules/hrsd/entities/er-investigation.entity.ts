import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum InvestigationType {
  HARASSMENT = 'HARASSMENT',
  DISCRIMINATION = 'DISCRIMINATION',
  BULLYING = 'BULLYING',
  MISCONDUCT = 'MISCONDUCT',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  GRIEVANCE = 'GRIEVANCE',
  COMPLAINT = 'COMPLAINT',
  WHISTLEBLOWER = 'WHISTLEBLOWER',
  OTHER = 'OTHER',
}

export enum InvestigationStatus {
  REPORTED = 'REPORTED',
  PRELIMINARY_REVIEW = 'PRELIMINARY_REVIEW',
  INVESTIGATION_STARTED = 'INVESTIGATION_STARTED',
  EVIDENCE_GATHERING = 'EVIDENCE_GATHERING',
  INTERVIEWS_SCHEDULED = 'INTERVIEWS_SCHEDULED',
  ANALYSIS = 'ANALYSIS',
  CONCLUDED = 'CONCLUDED',
  OUTCOME_COMMUNICATED = 'OUTCOME_COMMUNICATED',
  CLOSED = 'CLOSED',
}

export enum InvestigationOutcome {
  SUBSTANTIATED = 'SUBSTANTIATED',
  PARTIALLY_SUBSTANTIATED = 'PARTIALLY_SUBSTANTIATED',
  UNSUBSTANTIATED = 'UNSUBSTANTIATED',
  INCONCLUSIVE = 'INCONCLUSIVE',
  WITHDRAWN = 'WITHDRAWN',
}

export enum InvestigationSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * ER Investigation Entity
 * Employee Relations investigations - separate from general HR cases
 * Restricted visibility, evidence locker, compliance tracking
 */
@Entity('er_investigations')
@Index(['organizationId', 'status'])
export class ERInvestigation extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Investigation identification
  @Column({ unique: true })
  @Index()
  caseNumber: string; // ER-2025-0001

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: InvestigationType,
  })
  @Index()
  investigationType: InvestigationType;

  @Column({
    type: 'enum',
    enum: InvestigationSeverity,
    default: InvestigationSeverity.MEDIUM,
  })
  severity: InvestigationSeverity;

  @Column({
    type: 'enum',
    enum: InvestigationStatus,
    default: InvestigationStatus.REPORTED,
  })
  @Index()
  status: InvestigationStatus;

  // Parties involved
  @Column()
  @Index()
  complainantId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'complainantId' })
  complainant: Employee;

  @Column({ default: false })
  anonymousComplaint: boolean;

  @Column({ type: 'simple-array', nullable: true })
  respondentIds?: string[]; // Employee IDs

  @Column({ type: 'simple-array', nullable: true })
  witnessIds?: string[]; // Employee IDs

  // Investigation team (restricted access)
  @Column()
  leadInvestigatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'leadInvestigatorId' })
  leadInvestigator: User;

  @Column({ type: 'simple-array', nullable: true })
  investigationTeam?: string[]; // User IDs with access

  @Column({ type: 'simple-array', nullable: true })
  authorizedViewers?: string[]; // User IDs who can view (HR, Legal, etc.)

  // Dates & timeline
  @Column({ type: 'timestamp' })
  reportedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  investigationStartDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  targetCompletionDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  concludedDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedDate?: Date;

  // Allegations
  @Column({ type: 'text' })
  allegations: string;

  @Column({ type: 'simple-array', nullable: true })
  policiesViolated?: string[]; // Policy names/codes

  @Column({ nullable: true, type: 'date' })
  incidentDate?: Date;

  @Column({ nullable: true })
  incidentLocation?: string;

  // Evidence locker (secure storage)
  @Column({ type: 'simple-array', nullable: true })
  evidenceFiles?: string[]; // S3 URLs with encryption

  @Column({ type: 'jsonb', nullable: true })
  evidenceLog?: Array<{
    id: string;
    type: string; // 'DOCUMENT', 'EMAIL', 'PHOTO', 'VIDEO', 'AUDIO'
    description: string;
    uploadedBy: string;
    uploadedAt: string;
    secureUrl: string;
    checksumMD5?: string; // For integrity verification
  }>;

  // Interviews
  @Column({ type: 'jsonb', nullable: true })
  interviews?: Array<{
    id: string;
    intervieweeId: string;
    intervieweeName: string;
    role: string; // 'COMPLAINANT', 'RESPONDENT', 'WITNESS'
    scheduledDate?: string;
    completedDate?: string;
    interviewerId: string;
    interviewerName: string;
    transcriptUrl?: string;
    notes?: string;
  }>;

  // Findings & outcome
  @Column({
    type: 'enum',
    enum: InvestigationOutcome,
    nullable: true,
  })
  outcome?: InvestigationOutcome;

  @Column({ type: 'text', nullable: true })
  findings?: string;

  @Column({ type: 'text', nullable: true })
  recommendations?: string;

  @Column({ type: 'text', nullable: true })
  actionsTaken?: string;

  @Column({ type: 'jsonb', nullable: true })
  disciplinaryActions?: Array<{
    employeeId: string;
    actionType: string; // 'VERBAL_WARNING', 'WRITTEN_WARNING', 'SUSPENSION', 'TERMINATION', etc.
    effectiveDate: string;
    notes?: string;
  }>;

  // Legal & compliance
  @Column({ default: false })
  legalReviewRequired: boolean;

  @Column({ default: false })
  legalReviewCompleted: boolean;

  @Column({ nullable: true })
  legalReviewedBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  legalReviewDate?: Date;

  @Column({ default: false })
  externalReportRequired: boolean; // EEOC, etc.

  @Column({ default: false })
  externalReportFiled: boolean;

  @Column({ nullable: true, type: 'date' })
  externalReportDate?: Date;

  @Column({ nullable: true })
  externalCaseNumber?: string;

  // Confidentiality & security
  @Column({ default: true })
  confidential: boolean;

  @Column({ type: 'text', nullable: true })
  confidentialityAgreements?: string; // Who signed NDAs

  @Column({ type: 'jsonb', nullable: true })
  accessLog?: Array<{
    userId: string;
    userName: string;
    accessedAt: string;
    action: string; // 'VIEWED', 'EDITED', 'DOWNLOADED'
    ipAddress?: string;
  }>;

  // Notifications & communication
  @Column({ default: false })
  complainantNotified: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  complainantNotifiedAt?: Date;

  @Column({ default: false })
  respondentNotified: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  respondentNotifiedAt?: Date;

  // Related items
  @Column({ nullable: true })
  relatedCaseId?: string; // Link to HR case if created

  @Column({ nullable: true })
  relatedInvestigationIds?: string; // Related ER cases

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @OneToMany(() => ERInvestigationNote, note => note.investigation)
  notes?: ERInvestigationNote[];
}

/**
 * ER Investigation Note Entity
 * Secure notes on investigations - restricted access
 */
@Entity('er_investigation_notes')
@Index(['investigationId', 'createdAt'])
export class ERInvestigationNote extends BaseEntity {
  @Column()
  @Index()
  investigationId: string;

  @ManyToOne(() => ERInvestigation, investigation => investigation.notes)
  @JoinColumn({ name: 'investigationId' })
  investigation: ERInvestigation;

  @Column({ type: 'text' })
  note: string;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorName: string;

  @Column({ default: true })
  confidential: boolean;

  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdTimestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
