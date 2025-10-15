import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PaymentRailType {
  FASTER_PAYMENTS = 'FASTER_PAYMENTS', // UK
  SEPA_INSTANT = 'SEPA_INSTANT', // EU
  ACH_SAME_DAY = 'ACH_SAME_DAY', // US
  REAL_TIME_PAYMENTS = 'REAL_TIME_PAYMENTS', // US
  CARD_NETWORK = 'CARD_NETWORK',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CRYPTO = 'CRYPTO',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
}

export enum PaymentRailStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECATED = 'DEPRECATED',
}

@Entity('payment_rails')
@Index(['organizationId'])
@Index(['type'])
@Index(['status'])
export class PaymentRail extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PaymentRailType,
  })
  type: PaymentRailType;

  @Column({
    type: 'enum',
    enum: PaymentRailStatus,
    default: PaymentRailStatus.ACTIVE,
  })
  status: PaymentRailStatus;

  @Column()
  provider: string; // Stripe, Wise, Paystack, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  supportedCurrencies: string[];

  @Column({ type: 'jsonb' })
  supportedCountries: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  feePercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedFee: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  feeCurrency: string;

  @Column({ type: 'int', nullable: true })
  processingTimeMinutes: number; // Typical processing time

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyLimit: number;

  @Column({ type: 'boolean', default: true })
  isInstant: boolean;

  @Column({ type: 'boolean', default: false })
  requiresVerification: boolean;

  @Column({ type: 'jsonb', nullable: true })
  apiCredentials: {
    apiKey?: string;
    apiSecret?: string;
    merchantId?: string;
    webhookSecret?: string;
    environment?: 'SANDBOX' | 'PRODUCTION';
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  availability: {
    operatingHours?: {
      startTime: string;
      endTime: string;
      timezone: string;
    };
    maintenanceWindows?: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
    supportedDays?: number[]; // 0-6 (Sunday-Saturday)
  };

  @Column({ type: 'int', default: 0 })
  successfulTransactions: number;

  @Column({ type: 'int', default: 0 })
  failedTransactions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  successRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVolumeProcessed: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    webhookUrl?: string;
    callbackUrl?: string;
    settlementAccount?: string;
    [key: string]: any;
  };
}
