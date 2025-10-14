import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ContractorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  TERMINATED = 'TERMINATED',
}

export enum PaymentFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  PROJECT_BASED = 'PROJECT_BASED',
}

export enum IR35Status {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
  UNDETERMINED = 'UNDETERMINED',
}

@Entity('contractors')
export class Contractor extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  contractorId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  taxId?: string;

  @Column()
  country: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'enum', enum: ContractorStatus, default: ContractorStatus.PENDING })
  status: ContractorStatus;

  @Column({ type: 'date' })
  contractStartDate: Date;

  @Column({ type: 'date', nullable: true })
  contractEndDate?: Date;

  @Column({ type: 'enum', enum: PaymentFrequency })
  paymentFrequency: PaymentFrequency;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  rate: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  projectName?: string;

  @Column({ type: 'text', nullable: true })
  scopeOfWork?: string;

  @Column({ nullable: true })
  contractDocument?: string;

  @Column({ nullable: true })
  w9Form?: string;

  @Column({ type: 'jsonb', nullable: true })
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  skills?: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: IR35Status, default: IR35Status.UNDETERMINED })
  ir35Status: IR35Status;

  @Column({ type: 'date', nullable: true })
  ir35AssessmentDate?: Date;

  @Column({ type: 'text', nullable: true })
  ir35Notes?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'int', default: 0 })
  invoiceCount: number;
}

@Entity('contractor_payments')
export class ContractorPayment extends BaseEntity {
  @Column()
  contractorId: string;

  @Column()
  organizationId: string;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hoursWorked: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'date', nullable: true })
  paidDate?: Date;

  @Column({ nullable: true })
  invoiceNumber?: string;

  @Column({ nullable: true })
  invoiceUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('contractor_invoices')
export class ContractorInvoice extends BaseEntity {
  @Column()
  contractorId: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' })
  status: string;

  @Column({ type: 'date', nullable: true })
  paidDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  lineItems?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;

  @Column({ nullable: true })
  invoiceUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
