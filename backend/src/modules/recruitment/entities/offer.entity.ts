import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Application } from './application.entity';

export enum OfferStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('offers')
export class Offer extends BaseEntity {
  @Column()
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column()
  candidateId: string;

  @Column()
  organizationId: string;

  @Column()
  jobTitle: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'date' })
  proposedStartDate: Date;

  // Compensation
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  baseSalary: number;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @Column({ default: 'ANNUAL' })
  salaryFrequency: string; // ANNUAL, MONTHLY, HOURLY

  @Column({ nullable: true })
  band: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  signingBonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  annualBonus: number;

  @Column({ type: 'int', default: 0 })
  equityShares: number;

  @Column({ type: 'jsonb', nullable: true })
  benefits: Array<{
    name: string;
    description: string;
    value?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  allowances: Array<{
    type: string;
    amount: number;
    frequency: string;
  }>;

  // Total compensation
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalCompensation: number;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.DRAFT,
  })
  status: OfferStatus;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date;

  @Column({ type: 'date', nullable: true })
  sentAt: Date;

  @Column({ type: 'date', nullable: true })
  respondedAt: Date;

  @Column({ type: 'date', nullable: true })
  signedAt: Date;

  // Approval workflow
  @Column({ type: 'jsonb', default: [] })
  approvals: Array<{
    approverId: string;
    approverName: string;
    role: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decidedAt?: Date;
    comments?: string;
  }>;

  @Column({ default: false })
  requiresCompException: boolean; // Outside normal band

  @Column({ type: 'text', nullable: true })
  exceptionJustification: string;

  // Documents
  @Column({ nullable: true })
  offerLetterUrl: string;

  @Column({ nullable: true })
  contractUrl: string;

  @Column({ default: false })
  documentsSigned: boolean;

  // Decline tracking
  @Column({ nullable: true })
  declineReason: string;

  @Column({ type: 'text', nullable: true })
  declineFeedback: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    probationPeriod?: number;
    noticePeriod?: number;
    holidayEntitlement?: number;
    workingHours?: number;
    remote?: boolean;
    hybrid?: boolean;
    relocationPackage?: number;
    [key: string]: any;
  };

  /**
   * Calculate total comp
   */
  calculateTotalComp(): void {
    this.totalCompensation = 
      this.baseSalary + 
      this.signingBonus + 
      this.annualBonus;
  }

  /**
   * Check if offer expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Check if needs approval
   */
  needsApproval(): boolean {
    return this.approvals.some(a => a.status === 'PENDING');
  }
}
