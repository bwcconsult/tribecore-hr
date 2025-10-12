import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum TaxFilingStatus {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  FILED = 'FILED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum TaxFilingType {
  // UK
  PAYE_RTI = 'PAYE_RTI',
  NIC = 'NIC',
  P60 = 'P60',
  P11D = 'P11D',
  P45 = 'P45',
  
  // US
  W2 = 'W2',
  W3 = 'W3',
  FORM_941 = 'FORM_941',
  FORM_940 = 'FORM_940',
  
  // Nigeria
  PAYE_NG = 'PAYE_NG',
  NHF = 'NHF',
  NSITF = 'NSITF',
  ITF = 'ITF',
  PENSION_NG = 'PENSION_NG',
  
  // South Africa
  PAYE_ZA = 'PAYE_ZA',
  UIF = 'UIF',
  SDL = 'SDL',
  IRP5 = 'IRP5',
  
  // General
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
}

@Entity('tax_filings')
export class TaxFiling extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  country: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ type: 'enum', enum: TaxFilingType })
  filingType: TaxFilingType;

  @Column()
  taxYear: string; // e.g., "2024/25"

  @Column({ nullable: true })
  taxMonth?: string; // e.g., "2024-01" for monthly filings

  @Column({ nullable: true })
  taxQuarter?: string; // e.g., "2024-Q1"

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'enum', enum: TaxFilingStatus, default: TaxFilingStatus.PENDING })
  status: TaxFilingStatus;

  // Filing Details
  @Column({ nullable: true })
  filingReference?: string;

  @Column({ nullable: true })
  governmentReference?: string;

  @Column({ type: 'jsonb' })
  taxData: {
    totalEmployees: number;
    totalGrossPay: number;
    totalTaxableIncome: number;
    totalTaxWithheld: number;
    employeeContributions?: number;
    employerContributions?: number;
    breakdown?: Record<string, any>;
  };

  // Employee-level data
  @Column({ type: 'jsonb', nullable: true })
  employeeData?: Array<{
    employeeId: string;
    employeeName: string;
    taxId: string;
    grossPay: number;
    taxableIncome: number;
    taxWithheld: number;
    employeeContribution?: number;
    employerContribution?: number;
  }>;

  // File Management
  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ nullable: true })
  fileFormat?: string; // XML, CSV, JSON, PDF

  @Column({ type: 'timestamp with time zone', nullable: true })
  generatedAt?: Date;

  @Column({ nullable: true })
  generatedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  filedAt?: Date;

  @Column({ nullable: true })
  filedBy?: string;

  // API Integration
  @Column({ nullable: true })
  apiProvider?: string; // HMRC, IRS, FIRS, SARS

  @Column({ nullable: true })
  apiRequestId?: string;

  @Column({ nullable: true })
  apiResponseId?: string;

  @Column({ type: 'jsonb', nullable: true })
  apiResponse?: any;

  // Payment Details
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amountDue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'date', nullable: true })
  paymentDate?: Date;

  @Column({ nullable: true })
  paymentReference?: string;

  // Validation
  @Column({ type: 'jsonb', nullable: true })
  validationErrors?: Array<{
    field: string;
    message: string;
    severity: 'ERROR' | 'WARNING';
  }>;

  @Column({ type: 'boolean', default: true })
  isValid: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
