import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Country, Currency } from '../../../common/enums';

export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER',
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/**
 * BankDetails Entity
 * Stores employee bank account information for payroll
 * GDPR: Sensitive financial data - strict access control
 */
@Entity('bank_details')
export class BankDetails extends BaseEntity {
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ default: true })
  isPrimary: boolean;

  // Account Information
  @Column()
  accountHolderName: string;

  @Column()
  accountNumber: string; // Encrypted at rest

  @Column({ nullable: true })
  sortCode?: string; // UK

  @Column({ nullable: true })
  routingNumber?: string; // US

  @Column({ nullable: true })
  iban?: string; // International

  @Column({ nullable: true })
  swiftCode?: string; // International

  @Column({
    type: 'enum',
    enum: BankAccountType,
    default: BankAccountType.CHECKING,
  })
  accountType: BankAccountType;

  // Bank Information
  @Column()
  bankName: string;

  @Column({ nullable: true })
  branchName?: string;

  @Column({ nullable: true })
  branchCode?: string;

  @Column({ nullable: true })
  branchAddress?: string;

  @Column({
    type: 'enum',
    enum: Country,
  })
  country: Country;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  // Payment Configuration
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fixedAmount?: number; // For split payments

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageAmount?: number; // For percentage splits

  // Verification
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
  })
  @Index()
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  verifiedByUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedByUserId' })
  verifiedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'text', nullable: true })
  verificationNotes?: string;

  // Document Attachments (void cheque, bank letter)
  @Column({ type: 'simple-array', nullable: true })
  attachmentIds?: string[];

  // Effective Dates
  @Column({ type: 'date', nullable: true })
  effectiveFrom?: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo?: Date;

  // Consent
  @Column({ default: false })
  consentGiven: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentGivenAt?: Date;

  @Column({ nullable: true })
  consentIpAddress?: string;

  // GDPR: Retention
  @Column({ type: 'date', nullable: true })
  retentionUntil?: Date;

  // Audit
  @Column({ nullable: true })
  createdByUserId?: string;

  @Column({ nullable: true })
  modifiedByUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
