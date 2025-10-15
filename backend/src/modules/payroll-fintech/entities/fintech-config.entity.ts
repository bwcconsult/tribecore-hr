import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('fintech_configs')
export class FintechConfig extends BaseEntity {
  @Column()
  organizationId: string;

  @Column({ type: 'boolean', default: false })
  ewaEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  instantPayEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  walletEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50 })
  ewaMaxPercentage: number; // Max % of earned wages that can be accessed

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.5 })
  ewaFeePercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ewaFixedFee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })
  instantPayFeePercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  instantPayFixedFee: number;

  @Column({ type: 'int', default: 1 })
  ewaMinDaysWorked: number; // Minimum days worked before EWA is available

  @Column({ type: 'int', default: 3 })
  ewaMaxRequestsPerMonth: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ewaMinAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ewaMaxAmount: number;

  @Column({ type: 'boolean', default: true })
  autoApproveEWA: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  autoApproveThreshold: number;

  @Column({ type: 'jsonb', nullable: true })
  walletLimits: {
    dailyWithdrawal: number;
    weeklyWithdrawal: number;
    monthlyWithdrawal: number;
    perTransactionLimit: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  supportedPaymentMethods: Array<{
    type: 'BANK_ACCOUNT' | 'DEBIT_CARD' | 'MOBILE_MONEY';
    enabled: boolean;
    providers: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  complianceSettings: {
    kycRequired: boolean;
    maxDailyTransactions: number;
    suspiciousActivityThreshold: number;
    reportingCurrency: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    transactionAlerts: boolean;
    lowBalanceAlerts: boolean;
    lowBalanceThreshold: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    primaryPaymentRailId?: string;
    backupPaymentRailId?: string;
    settlementAccountId?: string;
    [key: string]: any;
  };
}
