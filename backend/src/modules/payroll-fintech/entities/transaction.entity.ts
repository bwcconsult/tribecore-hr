import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  TRANSFER = 'TRANSFER',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export enum TransactionCategory {
  SALARY_ADVANCE = 'SALARY_ADVANCE',
  EARNED_WAGE_ACCESS = 'EARNED_WAGE_ACCESS',
  INSTANT_PAY = 'INSTANT_PAY',
  BONUS = 'BONUS',
  COMMISSION = 'COMMISSION',
  REIMBURSEMENT = 'REIMBURSEMENT',
  WITHDRAWAL = 'WITHDRAWAL',
  TOP_UP = 'TOP_UP',
  PEER_TRANSFER = 'PEER_TRANSFER',
  BILL_PAYMENT = 'BILL_PAYMENT',
  MERCHANT_PAYMENT = 'MERCHANT_PAYMENT',
  SALARY = 'SALARY',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

@Entity('wallet_transactions')
@Index(['walletId'])
@Index(['employeeId'])
@Index(['status'])
@Index(['createdAt'])
export class WalletTransaction extends BaseEntity {
  @Column()
  walletId: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category: TransactionCategory;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string; // External reference number

  @Column({ nullable: true })
  paymentRailId: string; // Which payment rail was used

  @Column({ nullable: true })
  recipientWalletId: string; // For transfers

  @Column({ nullable: true })
  senderWalletId: string; // For transfers

  @Column({ nullable: true })
  linkedTransactionId: string; // For reversals/refunds

  @Column({ type: 'jsonb', nullable: true })
  paymentMethod: {
    type: string;
    provider: string;
    last4?: string;
    accountName?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  initiatedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ewaRequestId?: string;
    instantPayRequestId?: string;
    payrollRunId?: string;
    ipAddress?: string;
    deviceInfo?: string;
    location?: string;
    [key: string]: any;
  };
}
