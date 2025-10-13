import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CompTimeStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PAID_OUT = 'PAID_OUT',
  REDEEMED = 'REDEEMED',
}

/**
 * CompTimeBank - Comp-time/TOIL (Time Off In Lieu) tracking
 * Tracks accrued comp-time hours and redemptions
 */
@Entity('comp_time_banks')
@Index(['employeeId'])
export class CompTimeBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({ nullable: true })
  workRuleSetId: string; // Policy that governs this bank

  // === BALANCE ===
  
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  balanceHours: number; // Current available hours

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  totalAccruedHours: number; // Lifetime accrued

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  totalRedeemedHours: number; // Lifetime redeemed

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  totalExpiredHours: number; // Lifetime expired

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  totalPaidOutHours: number; // Lifetime paid in cash

  // === POLICY LIMITS ===
  
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxBankHours: number; // Cap on total hours (e.g., 240h)

  @Column({ type: 'int', nullable: true })
  expiryDays: number; // Days until hours expire (e.g., 90 days)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })
  accrualRatio: number; // e.g., 1.5 (1 OT hour = 1.5 comp hours)

  @Column({ default: false })
  allowsCarryover: boolean; // Can carry over to next year?

  // === ACCRUALS (History) ===
  
  @Column({ type: 'jsonb', default: [] })
  accruals: Array<{
    id: string;
    overtimeLineId: string;
    shiftId?: string;
    date: Date;
    overtimeHours: number; // Original OT hours
    compHoursEarned: number; // After ratio applied
    expiryDate?: Date;
    status: CompTimeStatus;
    notes?: string;
  }>;

  // === REDEMPTIONS (Time Off Taken) ===
  
  @Column({ type: 'jsonb', default: [] })
  redemptions: Array<{
    id: string;
    leaveRequestId?: string;
    date: Date;
    hoursUsed: number;
    approvedBy: string;
    approvedAt: Date;
    accrualIdsUsed: string[]; // Which accruals were consumed (FIFO)
    notes?: string;
  }>;

  // === EXPIRATIONS ===
  
  @Column({ type: 'jsonb', default: [] })
  expirations: Array<{
    id: string;
    accrualId: string;
    date: Date;
    hoursExpired: number;
    reason: string;
    canRecover?: boolean; // Some policies allow recovery if used soon
  }>;

  // === PAYOUTS (Cash instead of time) ===
  
  @Column({ type: 'jsonb', default: [] })
  payouts: Array<{
    id: string;
    accrualIds: string[];
    date: Date;
    hoursPaidOut: number;
    amount: number;
    currency: string;
    payrollId?: string;
    reason: string; // 'REQUESTED', 'FORCED_PAYOUT', 'TERMINATION'
  }>;

  // === ALERTS ===
  
  @Column({ type: 'jsonb', nullable: true })
  alerts: Array<{
    type: 'NEAR_CAP' | 'NEAR_EXPIRY' | 'EXPIRED' | 'CAP_REACHED';
    message: string;
    date: Date;
    acknowledged?: boolean;
  }>;

  // === STATUS ===
  
  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  suspendedReason: string; // Why bank is suspended

  @Column({ nullable: true })
  suspendedUntil: Date;

  // === AUDIT ===
  
  @Column({ type: 'jsonb', nullable: true })
  auditLog: Array<{
    action: string; // 'ACCRUED', 'REDEEMED', 'EXPIRED', 'PAID_OUT', 'ADJUSTED'
    actor: string;
    timestamp: Date;
    hoursBefore: number;
    hoursAfter: number;
    changeAmount: number;
    reason?: string;
  }>;

  // === METADATA ===
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    lastRedemptionDate?: Date;
    lastAccrualDate?: Date;
    yearStartDate?: Date; // For annual carryover tracking
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // === HELPER METHODS ===

  /**
   * Add comp-time accrual
   */
  accrue(overtimeLineId: string, overtimeHours: number, ratio?: number): void {
    const accrualRatio = ratio || this.accrualRatio;
    const compHoursEarned = overtimeHours * accrualRatio;
    
    // Check cap
    if (this.maxBankHours && (this.balanceHours + compHoursEarned) > this.maxBankHours) {
      throw new Error(`Exceeds maximum bank hours of ${this.maxBankHours}`);
    }

    const accrual = {
      id: this.generateId(),
      overtimeLineId,
      date: new Date(),
      overtimeHours,
      compHoursEarned,
      expiryDate: this.expiryDays ? this.calculateExpiryDate() : undefined,
      status: CompTimeStatus.ACTIVE,
    };

    this.accruals.push(accrual);
    this.balanceHours += compHoursEarned;
    this.totalAccruedHours += compHoursEarned;
  }

  /**
   * Redeem comp-time (use hours)
   */
  redeem(hoursToUse: number, approvedBy: string, leaveRequestId?: string): void {
    if (hoursToUse > this.balanceHours) {
      throw new Error(`Insufficient balance. Available: ${this.balanceHours}h, Requested: ${hoursToUse}h`);
    }

    // FIFO: consume oldest accruals first
    const accrualIdsUsed: string[] = [];
    let remaining = hoursToUse;

    for (const accrual of this.accruals) {
      if (remaining <= 0) break;
      if (accrual.status !== CompTimeStatus.ACTIVE) continue;

      const toConsume = Math.min(remaining, accrual.compHoursEarned);
      accrual.compHoursEarned -= toConsume;
      remaining -= toConsume;
      accrualIdsUsed.push(accrual.id);

      if (accrual.compHoursEarned === 0) {
        accrual.status = CompTimeStatus.REDEEMED;
      }
    }

    const redemption = {
      id: this.generateId(),
      leaveRequestId,
      date: new Date(),
      hoursUsed: hoursToUse,
      approvedBy,
      approvedAt: new Date(),
      accrualIdsUsed,
    };

    this.redemptions.push(redemption);
    this.balanceHours -= hoursToUse;
    this.totalRedeemedHours += hoursToUse;
  }

  /**
   * Expire old comp-time
   */
  expireStaleHours(): number {
    if (!this.expiryDays) return 0;

    const now = new Date();
    let hoursExpired = 0;

    for (const accrual of this.accruals) {
      if (accrual.status !== CompTimeStatus.ACTIVE) continue;
      if (!accrual.expiryDate) continue;

      if (now > accrual.expiryDate) {
        const expiredHours = accrual.compHoursEarned;
        
        this.expirations.push({
          id: this.generateId(),
          accrualId: accrual.id,
          date: now,
          hoursExpired: expiredHours,
          reason: 'Expiry date reached',
        });

        accrual.status = CompTimeStatus.EXPIRED;
        accrual.compHoursEarned = 0;
        
        this.balanceHours -= expiredHours;
        this.totalExpiredHours += expiredHours;
        hoursExpired += expiredHours;
      }
    }

    return hoursExpired;
  }

  /**
   * Get hours expiring soon (within days)
   */
  getHoursExpiringSoon(days: number = 30): number {
    if (!this.expiryDays) return 0;

    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    let expiringSoon = 0;
    for (const accrual of this.accruals) {
      if (accrual.status !== CompTimeStatus.ACTIVE) continue;
      if (!accrual.expiryDate) continue;

      if (accrual.expiryDate <= threshold) {
        expiringSoon += accrual.compHoursEarned;
      }
    }

    return expiringSoon;
  }

  /**
   * Calculate expiry date
   */
  private calculateExpiryDate(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (this.expiryDays || 90));
    return expiry;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if near capacity
   */
  isNearCapacity(threshold: number = 0.9): boolean {
    if (!this.maxBankHours) return false;
    return this.balanceHours >= (this.maxBankHours * threshold);
  }
}
