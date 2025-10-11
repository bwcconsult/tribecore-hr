import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum AccrualMethod {
  NONE = 'NONE', // No accrual (fixed entitlement)
  ANNUAL = 'ANNUAL', // Granted at start of year
  MONTHLY = 'MONTHLY', // Accrued monthly
  PRO_RATA = 'PRO_RATA', // Based on start date and FTE
  ROLLING = 'ROLLING', // Rolling year window
}

export enum AccrualFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

/**
 * AccrualPolicy Entity
 * Defines how absence entitlement is accrued over time
 */
@Entity('accrual_policies')
export class AccrualPolicy extends BaseEntity {
  @Column()
  @Index()
  name: string; // "Standard Monthly Accrual", "Pro-rata Annual"

  @Column({
    type: 'enum',
    enum: AccrualMethod,
  })
  method: AccrualMethod;

  @Column({
    type: 'enum',
    enum: AccrualFrequency,
    default: AccrualFrequency.MONTHLY,
  })
  frequency: AccrualFrequency;

  @Column({ nullable: true })
  description?: string;

  // Entitlement Configuration
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  annualEntitlementDays: number; // Base entitlement per year

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  accrualRate?: number; // e.g., 2.08 days per month

  // Pro-rata Rules
  @Column({ type: 'jsonb', nullable: true })
  proRataRules?: {
    enabled: boolean;
    basedOnFTE: boolean; // Adjust for part-time
    basedOnStartDate: boolean; // Adjust for mid-year joiners
    minimumServiceDays?: number; // Must work X days before accruing
  };

  // Rolling Year Configuration
  @Column({ type: 'jsonb', nullable: true })
  rollingYearConfig?: {
    windowDays: number; // 365 days
    trackEpisodes: boolean; // Track number of episodes (for sickness)
    resetDate?: string; // Optional: fixed reset date (MM-DD)
  };

  // Accrual Start/End
  @Column({ type: 'date', nullable: true })
  effectiveFrom?: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo?: Date;

  // Accrual Timing
  @Column({ type: 'jsonb', nullable: true })
  accrualTiming?: {
    startOfPeriod: boolean; // Accrue at start (true) or end (false) of period
    dayOfMonth?: number; // For monthly accrual, which day (1-28)
  };

  // Maximum/Minimum Limits
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAccrualDays?: number; // Cap on total accrued days

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAccrualDays?: number; // Minimum entitlement

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
