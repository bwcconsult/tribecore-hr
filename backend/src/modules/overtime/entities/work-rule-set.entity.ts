import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum Country {
  US = 'US',
  UK = 'UK',
  NG = 'NG', // Nigeria
  ZA = 'ZA', // South Africa
  EU = 'EU',
}

export enum Sector {
  GENERAL = 'GENERAL',
  NHS = 'NHS',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  PUBLIC_SECTOR = 'PUBLIC_SECTOR',
  TECH = 'TECH',
  HEALTHCARE = 'HEALTHCARE',
}

export enum StackingStrategy {
  ADD_ON = 'ADD_ON', // Stack premiums
  HIGHEST = 'HIGHEST', // Choose highest premium
  REPLACE = 'REPLACE', // Replace base with premium
}

export enum RoundingMethod {
  NEAREST_6MIN = 'NEAREST_6MIN',
  NEAREST_15MIN = 'NEAREST_15MIN',
  NEAREST_30MIN = 'NEAREST_30MIN',
  UP_6MIN = 'UP_6MIN',
  UP_15MIN = 'UP_15MIN',
  DOWN_6MIN = 'DOWN_6MIN',
  NONE = 'NONE',
}

/**
 * WorkRuleSet - The policy engine core
 * Defines all OT rules for a country/sector/union combination
 */
@Entity('work_rule_sets')
@Index(['country', 'sector', 'effectiveFrom', 'effectiveTo'])
export class WorkRuleSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Jurisdiction
  @Column({ type: 'enum', enum: Country })
  country: Country;

  @Column({ type: 'enum', enum: Sector, default: Sector.GENERAL })
  sector: Sector;

  @Column({ nullable: true })
  unionCBA: string; // Collective Bargaining Agreement reference

  @Column({ nullable: true })
  stateProvince: string; // e.g., "CA" for California-specific rules

  // Effective dates (for versioning)
  @Column()
  effectiveFrom: Date;

  @Column({ nullable: true })
  effectiveTo: Date;

  @Column({ default: true })
  isActive: boolean;

  // === THRESHOLDS ===
  
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 40 })
  weeklyHoursThreshold: number; // Hours before weekly OT kicks in

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  dailyHoursThreshold: number; // Hours before daily OT kicks in (e.g., 8 for CA)

  @Column({ type: 'int', default: 7 })
  weekResetDay: number; // 0=Sun, 1=Mon, etc.

  // === PREMIUM MULTIPLIERS ===
  
  @Column({ type: 'jsonb' })
  premiumLadders: {
    // Daily OT
    dailyOT1?: { afterHours: number; multiplier: number; earningCode: string }; // e.g., >8h = 1.5x
    dailyOT2?: { afterHours: number; multiplier: number; earningCode: string }; // e.g., >12h = 2.0x
    
    // Weekly OT
    weeklyOT1?: { afterHours: number; multiplier: number; earningCode: string }; // e.g., >40h = 1.5x
    weeklyOT2?: { afterHours: number; multiplier: number; earningCode: string }; // e.g., >60h = 2.0x
    
    // Time-based premiums
    night?: { startTime: string; endTime: string; multiplier: number; earningCode: string }; // e.g., 10pm-6am +10%
    weekend?: { multiplier: number; earningCode: string }; // Saturday/Sunday
    holiday?: { multiplier: number; earningCode: string }; // Public holidays
    
    // Consecutive days
    consecutiveDay7?: { multiplier: number; earningCode: string }; // 7th consecutive day
    consecutiveDay14?: { multiplier: number; earningCode: string }; // 14th consecutive day
    
    // Special premiums
    splitShift?: { minimumGapHours: number; premium: number; earningCode: string }; // CA split shift
    mealPenalty?: { afterHours: number; penalty: number; earningCode: string }; // CA meal break penalty
    restPenalty?: { afterHours: number; penalty: number; earningCode: string }; // CA rest break penalty
  };

  @Column({ type: 'enum', enum: StackingStrategy, default: StackingStrategy.HIGHEST })
  stackingStrategy: StackingStrategy;

  // === REST & SAFETY RULES ===
  
  @Column({ type: 'int', default: 11 })
  minimumRestHours: number; // Hours between shifts (EU = 11h)

  @Column({ type: 'int', default: 24 })
  weeklyRestHours: number; // Weekly rest period (EU = 24h)

  @Column({ type: 'int', nullable: true })
  maxDailyHours: number; // Max hours per day (safety limit)

  @Column({ type: 'int', nullable: true })
  maxWeeklyHours: number; // Max hours per week (EU WTD = 48h unless opt-out)

  @Column({ type: 'int', nullable: true })
  maxConsecutiveDays: number; // Max days worked without rest day

  @Column({ default: false })
  allowOptOut: boolean; // EU WTD opt-out allowed?

  // === ON-CALL & CALL-OUT ===
  
  @Column({ type: 'jsonb', nullable: true })
  onCallPolicy: {
    enabled: boolean;
    flatRate?: number; // Flat payment per on-call period
    hourlyRate?: number; // Hourly rate while on-call
    callOutMinimumHours?: number; // Minimum hours paid when called out (e.g., 2h)
    travelTimePaid?: boolean;
    travelTimeMultiplier?: number;
  };

  // === COMP-TIME (TOIL) ===
  
  @Column({ type: 'jsonb', nullable: true })
  compTimeRules: {
    allowed: boolean;
    accrualRatio?: number; // e.g., 1.5 (1 OT hour = 1.5 comp hours)
    maxBankHours?: number; // Cap on banked hours
    expiryDays?: number; // Days until comp-time expires
    requireApproval?: boolean;
  };

  // === APPROVAL HIERARCHY ===
  
  @Column({ type: 'jsonb' })
  approvalHierarchy: {
    level1: { role: string; autoApproveUnder?: number }; // Manager
    level2?: { role: string; autoApproveUnder?: number }; // Senior Manager / Roster Owner
    level3?: { role: string }; // Payroll / Finance
    slaHours?: number; // SLA for approval
    escalationHours?: number; // Hours before escalation
  };

  // === ROUNDING & GRACE ===
  
  @Column({ type: 'enum', enum: RoundingMethod, default: RoundingMethod.NEAREST_15MIN })
  roundingMethod: RoundingMethod;

  @Column({ type: 'int', default: 7 })
  graceMinutes: number; // Grace period for early/late punches

  // === BUDGETS & CAPS ===
  
  @Column({ type: 'jsonb', nullable: true })
  budgetRules: {
    enforceWeeklyCapHours?: number;
    enforceMonthlyCapHours?: number;
    requireBudgetCodeForOT?: boolean;
    alertThresholdPercent?: number; // Alert at % of cap
  };

  // === HOLIDAY CALENDAR ===
  
  @Column({ type: 'jsonb', nullable: true })
  holidayCalendar: Array<{
    date: string; // ISO date
    name: string;
    multiplier?: number; // Override holiday multiplier for specific days
  }>;

  // === SPECIAL RULES ===
  
  @Column({ type: 'jsonb', nullable: true })
  specialRules: {
    minorMaxHours?: number; // Max hours for minors
    visaHourCaps?: { [visaType: string]: number }; // Hour caps by visa type
    contractorNoOT?: boolean; // Contractors don't get OT
    emergencyOverride?: boolean; // Allow emergency exceptions
    nhsSafeStaffingRatio?: number; // NHS: patients per nurse
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    legislationReferences?: string[]; // Legal citations
    lastReviewedDate?: string;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;
}
