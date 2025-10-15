import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum WalletType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  CORPORATE = 'CORPORATE',
}

@Entity('payroll_wallets')
@Index(['employeeId'])
@Index(['organizationId'])
export class PayrollWallet extends BaseEntity {
  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.PENDING_VERIFICATION,
  })
  status: WalletStatus;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.STANDARD,
  })
  walletType: WalletType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pendingBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarned: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalWithdrawn: number;

  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency: string;

  @Column({ nullable: true })
  walletNumber: string; // Virtual wallet number

  @Column({ nullable: true })
  cardNumber: string; // Virtual or physical card number (masked)

  @Column({ type: 'jsonb', nullable: true })
  paymentMethods: Array<{
    id: string;
    type: 'BANK_ACCOUNT' | 'DEBIT_CARD' | 'MOBILE_MONEY';
    provider: string;
    last4: string;
    isDefault: boolean;
    metadata?: any;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  limits: {
    dailyWithdrawal: number;
    weeklyWithdrawal: number;
    monthlyWithdrawal: number;
    perTransactionLimit: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'boolean', default: false })
  kycVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    phoneNumber?: string;
    emailVerified?: boolean;
    smsVerified?: boolean;
    securityPin?: string; // Hashed
    biometricEnabled?: boolean;
    [key: string]: any;
  };
}
