import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Payroll } from './payroll.entity';

export enum PayrollRunStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('payroll_runs')
export class PayrollRun extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  runName: string; // e.g., "January 2025 Payroll"

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column()
  payFrequency: string; // MONTHLY, BIWEEKLY, WEEKLY

  @Column({ type: 'enum', enum: PayrollRunStatus, default: PayrollRunStatus.DRAFT })
  status: PayrollRunStatus;

  // Summary
  @Column({ type: 'int', default: 0 })
  totalEmployees: number;

  @Column({ type: 'int', default: 0 })
  totalContractors: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalGrossPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalNetPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEmployerContributions: number;

  @Column()
  baseCurrency: string;

  // Multi-Currency Breakdown
  @Column({ type: 'jsonb', nullable: true })
  currencyBreakdown?: Record<string, {
    totalGross: number;
    totalNet: number;
    totalTax: number;
    count: number;
  }>;

  // Country/Region Breakdown
  @Column({ type: 'jsonb', nullable: true })
  countryBreakdown?: Record<string, {
    employeeCount: number;
    totalGross: number;
    totalNet: number;
    totalTax: number;
    currency: string;
  }>;

  // Department Breakdown
  @Column({ type: 'jsonb', nullable: true })
  departmentBreakdown?: Record<string, {
    employeeCount: number;
    totalGross: number;
    totalNet: number;
  }>;

  // Processing Details
  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt?: Date;

  @Column({ nullable: true })
  processedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  paidBy?: string;

  // Bank Files
  @Column({ type: 'jsonb', nullable: true })
  bankFiles?: Array<{
    country: string;
    format: string; // SEPA, NACHA, NIBSS, SWIFT
    fileUrl: string;
    generatedAt: Date;
  }>;

  // Journal Entry
  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ nullable: true })
  journalEntryUrl?: string;

  // Tax Filing
  @Column({ type: 'jsonb', nullable: true })
  taxFilings?: Array<{
    country: string;
    type: string; // PAYE, NIC, UIF, etc.
    amount: number;
    filedAt?: Date;
    filingUrl?: string;
  }>;

  // Errors & Warnings
  @Column({ type: 'jsonb', nullable: true })
  errors?: Array<{
    employeeId: string;
    employeeName: string;
    message: string;
    severity: 'ERROR' | 'WARNING';
  }>;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'int', default: 0 })
  warningCount: number;

  // Audit
  @Column({ type: 'jsonb', nullable: true })
  auditLog?: Array<{
    action: string;
    userId: string;
    userName: string;
    timestamp: Date;
    details?: any;
  }>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Payroll, payroll => payroll.id)
  payrolls: Payroll[];
}
