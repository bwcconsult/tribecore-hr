import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AbsencePlan } from './absence-plan.entity';

/**
 * AbsenceBalance Entity
 * Enhanced balance tracking per user per plan per period
 * Replaces/extends the simple AbsenceBalanceCache
 */
@Entity('absence_balances')
@Index(['userId', 'planId', 'period'], { unique: true })
export class AbsenceBalance extends BaseEntity {
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  @Index()
  planId: string;

  @ManyToOne(() => AbsencePlan)
  @JoinColumn({ name: 'planId' })
  plan?: AbsencePlan;

  @Column()
  @Index()
  period: string; // e.g., "2025", "2025-Q1", or ISO date for rolling year

  // Entitlement
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  entitlementDays: number;

  // Accrued (for monthly accrual plans)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  accruedDays: number;

  // Usage
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  takenDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  scheduledDays: number; // Approved but future-dated

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingDays: number; // Requested but not yet approved

  // Calculated
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingDays: number; // entitlement - taken - scheduled

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableDays: number; // entitlement - taken - scheduled - pending

  // Carryover (from previous period)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  carryoverDays: number;

  @Column({ type: 'date', nullable: true })
  carryoverExpiryDate?: Date;

  // Episodes (for sickness tracking)
  @Column({ default: 0 })
  episodes: number; // Number of separate absence episodes

  // Rolling Year Data (for sickness, level-up days)
  @Column({ type: 'date', nullable: true })
  rollingWindowStart?: Date;

  @Column({ type: 'date', nullable: true })
  rollingWindowEnd?: Date;

  // FTE adjustment (for part-time employees)
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1.0 })
  fteRatio: number;

  // Pro-rata adjustment
  @Column({ default: false })
  isProRated: boolean;

  @Column({ type: 'date', nullable: true })
  proRataStartDate?: Date;

  // Last calculation
  @Column({ type: 'timestamp' })
  lastCalculatedAt: Date;

  @Column({ nullable: true })
  calculatedByUserId?: string;

  // Audit
  @Column({ type: 'jsonb', nullable: true })
  calculationDetails?: {
    method: string;
    inputs: Record<string, any>;
    adjustments: Array<{ type: string; amount: number; reason: string }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
