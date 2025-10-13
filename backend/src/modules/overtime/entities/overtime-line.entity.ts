import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RateClass {
  // Standard overtime
  OT125 = 'OT125', // 1.25x multiplier
  OT150 = 'OT150', // 1.5x multiplier
  OT175 = 'OT175', // 1.75x multiplier
  OT200 = 'OT200', // 2.0x multiplier
  OT250 = 'OT250', // 2.5x multiplier
  
  // Time-based premiums
  NIGHT = 'NIGHT', // Night shift differential
  NIGHT10 = 'NIGHT10', // Night +10%
  NIGHT15 = 'NIGHT15', // Night +15%
  NIGHT25 = 'NIGHT25', // Night +25%
  
  WEEKEND = 'WEEKEND', // Weekend premium
  WKD15 = 'WKD15', // Weekend +15%
  WKD25 = 'WKD25', // Weekend +25%
  WKD50 = 'WKD50', // Weekend +50%
  
  HOLIDAY = 'HOLIDAY', // Holiday premium
  HOL200 = 'HOL200', // Holiday 2x
  HOL250 = 'HOL250', // Holiday 2.5x
  
  // Special premiums
  CALL_OUT = 'CALL_OUT', // Call-out from on-call
  CALL_OUT_MIN2H = 'CALL_OUT_MIN2H', // 2-hour minimum
  CALL_OUT_MIN3H = 'CALL_OUT_MIN3H', // 3-hour minimum
  CALL_OUT_MIN4H = 'CALL_OUT_MIN4H', // 4-hour minimum
  
  ON_CALL_FLAT = 'ON_CALL_FLAT', // Flat on-call payment
  ON_CALL_HR = 'ON_CALL_HR', // Hourly on-call rate
  STANDBY_HR = 'STANDBY_HR', // Standby hourly rate
  
  // Penalties
  MEAL_PENALTY = 'MEAL_PENALTY', // Meal break penalty (CA)
  REST_PENALTY = 'REST_PENALTY', // Rest break penalty (CA)
  SPLIT_PENALTY = 'SPLIT_PENALTY', // Split shift penalty (CA)
  REST_BREACH = 'REST_BREACH', // Rest period breach premium
  
  // Other
  TRAVEL_TIME = 'TRAVEL_TIME', // Travel time premium
  TRAINING = 'TRAINING', // Training time
  EMERGENCY = 'EMERGENCY', // Emergency call premium
}

export enum OvertimeBasis {
  DAILY = 'DAILY', // Based on daily threshold
  WEEKLY = 'WEEKLY', // Based on weekly threshold
  CONSECUTIVE = 'CONSECUTIVE', // Consecutive days worked
  NTH_SHIFT = 'NTH_SHIFT', // Nth shift in period (e.g., 7th day)
  TIME_OF_DAY = 'TIME_OF_DAY', // Night/evening
  DAY_OF_WEEK = 'DAY_OF_WEEK', // Weekend
  HOLIDAY = 'HOLIDAY', // Public holiday
  CALL_OUT = 'CALL_OUT', // Call-out event
  ON_CALL = 'ON_CALL', // On-call period
  PENALTY = 'PENALTY', // Statutory penalty
  MINIMUM = 'MINIMUM', // Minimum payment guarantee
}

/**
 * OvertimeLine - Calculated overtime result
 * One line per premium type per shift
 * Fully explainable with calculation trace
 */
@Entity('overtime_lines')
@Index(['shiftId'])
@Index(['employeeId', 'periodStart'])
@Index(['rateClass'])
@Index(['status'])
export class OvertimeLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shiftId: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  // === POLICY & CLASSIFICATION ===
  
  @Column()
  workRuleSetId: string; // Which policy was applied

  @Column()
  policyCode: string; // Short code (e.g., "US-CA-DAILY-OT1")

  @Column({ type: 'enum', enum: RateClass })
  rateClass: RateClass;

  @Column({ type: 'enum', enum: OvertimeBasis })
  basis: OvertimeBasis;

  // === TIME & QUANTITY ===
  
  @Column()
  periodStart: Date; // Period this OT applies to

  @Column()
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantityHours: number; // Hours of OT

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantityUnits: number; // For flat payments (e.g., 1 call-out = 1 unit)

  // === RATES & AMOUNT ===
  
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  multiplier: number; // e.g., 1.5, 2.0, 1.25

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  baseHourlyRate: number; // Employee's base rate

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  effectiveRate: number; // Base * multiplier

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  calculatedAmount: number; // Final amount for this line

  @Column({ nullable: true })
  currency: string; // e.g., 'USD', 'GBP'

  // === PAYROLL MAPPING ===
  
  @Column()
  earningCode: string; // Maps to payroll earning code (e.g., "OT_150")

  @Column({ nullable: true })
  costCenter: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  glAccount: string; // General ledger account

  // === CALCULATION TRACE (Explainability) ===
  
  @Column({ type: 'jsonb' })
  explainTrace: {
    ruleName: string; // "California Daily Overtime Tier 1"
    ruleDescription: string;
    legislationRef?: string; // "29 CFR 541.118"
    
    steps: Array<{
      step: number;
      description: string;
      formula?: string;
      inputs?: { [key: string]: any };
      output?: any;
    }>;
    
    thresholds?: {
      dailyThreshold?: number;
      weeklyThreshold?: number;
      triggerHour?: number;
    };
    
    calculation: {
      hoursWorked: number;
      thresholdHours: number;
      overtimeHours: number;
      baseRate: number;
      multiplier: number;
      finalAmount: number;
    };
    
    evidence?: Array<{
      type: string; // 'TIME_BLOCK', 'SHIFT', 'POLICY'
      id: string;
      timestamp?: Date;
      value?: any;
    }>;
  };

  // === STATUS & PROCESSING ===
  
  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED, PAID

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paidInPayrollId: string;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ default: false })
  isLocked: boolean; // Locked after export to payroll

  // === BUDGET TRACKING ===
  
  @Column({ nullable: true })
  budgetId: string;

  @Column({ default: false })
  exceedsBudget: boolean;

  @Column({ nullable: true })
  budgetApprovalRequired: boolean;

  @Column({ nullable: true })
  budgetApprovedBy: string;

  // === COMP-TIME ===
  
  @Column({ default: false })
  convertedToCompTime: boolean; // Employee chose comp-time instead of pay

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  compTimeHoursBanked: number; // Hours banked (with ratio applied)

  @Column({ nullable: true })
  compTimeBankId: string;

  // === STACKING INFO ===
  
  @Column({ type: 'simple-array', nullable: true })
  stackedWith: string[]; // IDs of other lines stacked with this

  @Column({ default: false })
  isStackedResult: boolean; // This line is result of stacking multiple premiums

  // === VERSIONING (for corrections) ===
  
  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  supersededBy: string; // ID of line that replaced this

  @Column({ nullable: true })
  supersedes: string; // ID of line this replaces

  @Column({ default: false })
  isCorrection: boolean;

  @Column({ type: 'text', nullable: true })
  correctionReason: string;

  // === AUDIT ===
  
  @Column({ nullable: true })
  calculatedBy: string; // User or system that calculated

  @Column({ nullable: true })
  calculatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  auditLog: Array<{
    action: string;
    actor: string;
    timestamp: Date;
    changes?: any;
  }>;

  // === METADATA ===
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    batchId?: string;
    recalculated?: boolean;
    originalAmount?: number;
    adjustmentAmount?: number;
    notes?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // === HELPER METHODS ===

  /**
   * Generate human-readable explanation
   */
  getExplanation(): string {
    const steps = this.explainTrace.steps.map(s => `${s.step}. ${s.description}`).join('\n');
    return `${this.explainTrace.ruleName}\n\n${steps}\n\nResult: ${this.quantityHours}h × ${this.multiplier}× = ${this.currency} ${this.calculatedAmount}`;
  }

  /**
   * Check if this line can be edited
   */
  canEdit(): boolean {
    return !this.isLocked && !this.isPaid;
  }

  /**
   * Check if this line needs approval
   */
  needsApproval(): boolean {
    return this.status === 'PENDING' && !this.isApproved;
  }
}
