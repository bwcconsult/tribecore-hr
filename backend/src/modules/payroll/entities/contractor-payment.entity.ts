import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Currency } from '../../../common/enums';

export enum ContractorPaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ContractorRateType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  PROJECT = 'PROJECT',
  MILESTONE = 'MILESTONE',
}

@Entity('contractor_payments')
export class ContractorPayment extends BaseEntity {
  @Column()
  contractorId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'contractorId' })
  contractor: Employee;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  contractNumber: string;

  @Column({ type: 'enum', enum: ContractorRateType })
  rateType: ContractorRateType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hoursWorked?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  daysWorked?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossAmount: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  currency: Currency;

  // Tax Treatment
  @Column({ type: 'boolean', default: false })
  withHoldingTaxApplied: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  withHoldingTaxPercent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  withHoldingTaxAmount: number;

  @Column({ type: 'boolean', default: false })
  vatApplicable: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatPercent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netAmount: number;

  // Payment Period
  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date' })
  paymentDate: Date;

  // Invoice Details
  @Column({ nullable: true })
  invoiceNumber?: string;

  @Column({ type: 'date', nullable: true })
  invoiceDate?: Date;

  @Column({ nullable: true })
  invoiceUrl?: string;

  // Status & Approval
  @Column({ type: 'enum', enum: ContractorPaymentStatus, default: ContractorPaymentStatus.PENDING })
  status: ContractorPaymentStatus;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  paidBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  paymentReferenceNumber?: string;

  // Bank Details
  @Column({ type: 'jsonb', nullable: true })
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
  };

  // Compliance
  @Column({ nullable: true })
  taxFormType?: string; // 1099, IR35, etc.

  @Column({ nullable: true })
  taxFormUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  milestones?: Array<{
    name: string;
    description?: string;
    amount: number;
    dueDate?: Date;
    completed: boolean;
  }>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
