import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum InstantPayStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum InstantPayType {
  SAME_DAY = 'SAME_DAY',
  INSTANT = 'INSTANT', // Within minutes
  NEXT_DAY = 'NEXT_DAY',
}

@Entity('instant_pay_requests')
@Index(['employeeId'])
@Index(['organizationId'])
@Index(['status'])
@Index(['requestedAt'])
export class InstantPayRequest extends BaseEntity {
  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column()
  walletId: string;

  @Column({
    type: 'enum',
    enum: InstantPayStatus,
    default: InstantPayStatus.PENDING,
  })
  status: InstantPayStatus;

  @Column({
    type: 'enum',
    enum: InstantPayType,
    default: InstantPayType.INSTANT,
  })
  payType: InstantPayType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  processedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  netAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency: string;

  @Column({ type: 'timestamp with time zone' })
  requestedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expectedDeliveryTime: Date;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  paymentRailId: string;

  @Column({ type: 'jsonb', nullable: true })
  destinationAccount: {
    type: 'BANK_ACCOUNT' | 'DEBIT_CARD' | 'MOBILE_MONEY' | 'WALLET';
    provider: string;
    accountNumber?: string;
    last4?: string;
    accountName?: string;
  };

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'jsonb', nullable: true })
  feeBreakdown: {
    baseFee: number;
    speedFee: number;
    processingFee: number;
    total: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    sourcePayroll?: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH';
    ipAddress?: string;
    deviceInfo?: string;
    [key: string]: any;
  };
}
