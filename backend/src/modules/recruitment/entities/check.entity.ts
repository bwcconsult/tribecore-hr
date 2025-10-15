import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from './application.entity';

export enum CheckType {
  BACKGROUND = 'BACKGROUND',
  CRIMINAL = 'CRIMINAL',
  CREDIT = 'CREDIT',
  RIGHT_TO_WORK = 'RIGHT_TO_WORK',
  VISA_VERIFICATION = 'VISA_VERIFICATION',
  REFERENCE = 'REFERENCE',
  EDUCATION = 'EDUCATION',
  EMPLOYMENT = 'EMPLOYMENT',
  LICENSE = 'LICENSE',
  MEDICAL = 'MEDICAL',
  DRUG_SCREEN = 'DRUG_SCREEN',
  SECURITY_CLEARANCE = 'SECURITY_CLEARANCE',
  PROFESSIONAL_REGISTRATION = 'PROFESSIONAL_REGISTRATION',
}

export enum CheckStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_CANDIDATE = 'PENDING_CANDIDATE',
  PENDING_THIRD_PARTY = 'PENDING_THIRD_PARTY',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  WAIVED = 'WAIVED',
}

export enum CheckResult {
  CLEAR = 'CLEAR',
  CONDITIONAL = 'CONDITIONAL',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

@Entity('checks')
export class Check extends BaseEntity {
  @Column()
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column()
  candidateId: string;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: CheckType,
  })
  type: CheckType;

  @Column({
    type: 'enum',
    enum: CheckStatus,
    default: CheckStatus.NOT_STARTED,
  })
  status: CheckStatus;

  @Column({
    type: 'enum',
    enum: CheckResult,
    default: CheckResult.PENDING,
  })
  result: CheckResult;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: false })
  isBlocking: boolean; // Must pass before hire

  // Vendor tracking
  @Column({ nullable: true })
  vendorId: string;

  @Column({ nullable: true })
  vendorName: string;

  @Column({ nullable: true })
  vendorReferenceId: string;

  @Column({ nullable: true })
  vendorUrl: string;

  // Timing
  @Column({ type: 'timestamp', nullable: true })
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'int', nullable: true })
  expectedDurationDays: number;

  // SLA
  @Column({ type: 'timestamp', nullable: true })
  dueAt: Date;

  @Column({ default: false })
  isOverdue: boolean;

  // Results and documents
  @Column({ type: 'jsonb', nullable: true })
  resultData: {
    findings?: string[];
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    restrictions?: string[];
    expiryDate?: string;
    certificateNumber?: string;
    issuer?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
    verifiedBy?: string;
  }>;

  // Flags and issues
  @Column({ type: 'jsonb', default: [] })
  issues: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    raisedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
  }>;

  // Consent and privacy
  @Column({ default: false })
  consentGiven: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentGivenAt: Date;

  @Column({ nullable: true })
  consentDocumentUrl: string;

  // Waiver (for exceptions)
  @Column({ default: false })
  isWaived: boolean;

  @Column({ nullable: true })
  waivedBy: string;

  @Column({ type: 'text', nullable: true })
  waiverReason: string;

  @Column({ type: 'timestamp', nullable: true })
  waivedAt: Date;

  // Cost tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ length: 3, nullable: true })
  costCurrency: string;

  // Notes
  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'text', nullable: true })
  candidateFacingNotes: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    jurisdiction?: string;
    scope?: string;
    checkDepth?: string;
    yearsBack?: number;
    [key: string]: any;
  };

  /**
   * Check if expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Check if passed
   */
  hasPassed(): boolean {
    return this.status === CheckStatus.COMPLETED && 
           (this.result === CheckResult.CLEAR || this.result === CheckResult.CONDITIONAL);
  }

  /**
   * Check if blocking hire
   */
  isBlockingHire(): boolean {
    return this.isBlocking && 
           this.isRequired && 
           !this.hasPassed() && 
           !this.isWaived;
  }

  /**
   * Mark as overdue
   */
  markOverdue(): void {
    if (this.dueAt && new Date() > this.dueAt && this.status !== CheckStatus.COMPLETED) {
      this.isOverdue = true;
    }
  }
}
