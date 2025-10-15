import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum EWARequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  REPAID = 'REPAID',
  CANCELLED = 'CANCELLED',
}

export enum RepaymentMethod {
  NEXT_PAYROLL = 'NEXT_PAYROLL',
  INSTALLMENTS = 'INSTALLMENTS',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
  MANUAL = 'MANUAL',
}

@Entity('ewa_requests')
@Index(['employeeId'])
@Index(['organizationId'])
@Index(['status'])
@Index(['requestDate'])
export class EWARequest extends BaseEntity {
  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column()
  walletId: string;

  @Column({
    type: 'enum',
    enum: EWARequestStatus,
    default: EWARequestStatus.PENDING,
  })
  status: EWARequestStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  disbursedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRepayment: number;

  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  earnedSoFar: number; // Amount earned in current pay period

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  maxEligibleAmount: number; // Max they can access

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  feePercentage: number;

  @Column({ type: 'date' })
  requestDate: Date;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  disbursementDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedRepaymentDate: Date;

  @Column({ type: 'date', nullable: true })
  actualRepaymentDate: Date;

  @Column({
    type: 'enum',
    enum: RepaymentMethod,
    default: RepaymentMethod.NEXT_PAYROLL,
  })
  repaymentMethod: RepaymentMethod;

  @Column({ type: 'int', nullable: true })
  installmentCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  repaidAmount: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  transactionId: string; // Linked wallet transaction

  @Column({ nullable: true })
  payrollRunId: string; // For repayment tracking

  @Column({ type: 'jsonb', nullable: true })
  calculation: {
    workDaysInPeriod: number;
    daysWorked: number;
    hourlyRate: number;
    hoursWorked: number;
    baseEarnings: number;
    deductions: number;
    netEligible: number;
    accessLimit: number; // % of earned wages that can be accessed
    previousAdvances: number;
    availableForAccess: number;
  };

  @Column({ type: 'boolean', default: false })
  isAutoApproved: boolean;

  @Column({ type: 'jsonb', nullable: true })
  approvalRules: {
    rulesPassed: string[];
    rulesFailed: string[];
    riskScore: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    requestSource?: 'MOBILE_APP' | 'WEB' | 'API';
    ipAddress?: string;
    deviceInfo?: string;
    [key: string]: any;
  };
}
