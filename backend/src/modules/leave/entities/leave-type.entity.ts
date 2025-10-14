import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * LeaveType
 * Policy-driven leave type configuration
 * Stores all rules for Annual Leave, Sick, TOIL, Maternity, etc.
 */
@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column({ unique: true })
  @Index()
  code: string; // AL, SICK, MAT, PAT, TOIL, STUDY, SABBATICAL, UNPAID

  @Column()
  name: string; // Annual Leave, Sickness, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  // Unit of measurement
  @Column({
    type: 'enum',
    enum: ['HOURS', 'DAYS', 'WEEKS'],
    default: 'HOURS',
  })
  unit: string;

  // Color for UI display
  @Column({ nullable: true })
  color: string; // #4CAF50

  @Column({ nullable: true })
  icon: string; // lucide icon name

  // Entitlement configuration
  @Column({ type: 'jsonb', nullable: true })
  entitlement: {
    fullTimeHoursPerYear?: number;
    fullTimeDaysPerYear?: number;
    staticAmount?: number;
    unlimitedBalance?: boolean; // For sick leave in some countries
  };

  // Accrual settings
  @Column({ type: 'jsonb', nullable: true })
  accrual: {
    method: 'UPFRONT' | 'MONTHLY_PRORATA' | 'ANNIVERSARY' | 'NONE';
    rounding: 'UP' | 'DOWN' | 'NEAREST_0_5H' | 'NEAREST_1H';
    startMonth?: number; // 1-12
    startDay?: number; // 1-31
  };

  // Pro-rating
  @Column({ type: 'boolean', default: true })
  proRataOnJoin: boolean;

  @Column({ type: 'boolean', default: true })
  proRataOnLeave: boolean;

  // Carryover rules
  @Column({ type: 'jsonb', nullable: true })
  carryover: {
    enabled: boolean;
    maxHours?: number;
    maxDays?: number;
    expiresOn?: string; // MM-DD format (e.g., "04-01" for April 1st)
    expiryDays?: number; // Alternative: X days from start of new year
    requiresApproval?: boolean;
  };

  // Purchase/Sell programme
  @Column({ type: 'jsonb', nullable: true })
  purchaseSell: {
    purchaseEnabled: boolean;
    sellEnabled: boolean;
    purchaseMaxHours?: number;
    sellMaxHours?: number;
    window?: {
      start: string; // MM-DD
      end: string;
    };
    costPerHour?: number;
    minBalanceAfterSell?: number; // Can't sell below statutory minimum
  };

  // Approval requirements
  @Column({ type: 'boolean', default: true })
  requiresApproval: boolean;

  @Column({ type: 'int', default: 0 })
  minNoticeDays: number; // Min days notice required

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  minBlockHours: number; // Minimum block that can be requested

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxBlockHours: number; // Maximum continuous block

  @Column({ type: 'int', nullable: true })
  maxRequestsPerYear: number;

  // Documentation requirements
  @Column({ type: 'jsonb', nullable: true })
  documentation: {
    required: boolean;
    types: string[]; // ['FIT_NOTE', 'MEDICAL_CERT', 'COURT_LETTER']
    requiredAfterDays?: number;
  };

  // Sick pay stages (for sickness)
  @Column({ type: 'jsonb', nullable: true })
  paidStages: Array<{
    days: number;
    payRate: number; // 1.0 = 100%, 0.5 = 50%, 0 = unpaid
  }>;

  @Column({ type: 'int', nullable: true })
  selfCertDays: number; // Days before fit note required

  @Column({ type: 'int', nullable: true })
  fitNoteRequiredAfterDays: number;

  // TOIL-specific
  @Column({ type: 'varchar', nullable: true })
  balanceSource: string; // OVERTIME, MANUAL

  @Column({ type: 'int', nullable: true })
  expiryDays: number; // TOIL expires after X days

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  conversionRate: number; // 1.0 or 1.5 (1h OT = 1.5h TOIL)

  // Deduction behavior
  @Column({ type: 'boolean', default: true })
  deductPublicHolidays: boolean;

  @Column({ type: 'boolean', default: false })
  deductWeekends: boolean;

  @Column({ type: 'boolean', default: false })
  allowNegativeBalance: boolean;

  @Column({ type: 'boolean', default: true })
  allowPartialDays: boolean;

  // Restrictions
  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    blackoutPeriods?: Array<{ start: string; end: string }>; // MM-DD format
    maxConsecutiveDays?: number;
    minGapDays?: number; // Min days between requests
    maxTeamOffPercent?: number; // Max % of team off at once
  };

  // Compliance & statutory
  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    statutory: boolean;
    jurisdiction?: string; // UK_WTD, US_FMLA, SA_BCEA, NG_LABOUR
    legislationRef?: string;
    jobProtected?: boolean; // FMLA, maternity
    minEntitlement?: number;
  };

  // Payroll integration
  @Column({ type: 'varchar', nullable: true })
  payrollCode: string; // AL-TAKEN, SICK-FULL, MAT-PAY

  @Column({ type: 'boolean', default: true })
  affectsPayroll: boolean;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // Display order in UI

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    applicableRoles?: string[];
    applicableGrades?: string[];
    requiresManagerApproval?: boolean;
    requiresHRApproval?: boolean;
    autoApproveUnder?: number; // Auto-approve if under X hours
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper: Calculate entitlement for FTE
  calculateEntitlement(ftePercentage: number): number {
    if (this.entitlement.unlimitedBalance) return 999999;
    if (this.entitlement.staticAmount) return this.entitlement.staticAmount;
    
    const baseHours = this.entitlement.fullTimeHoursPerYear || 0;
    return baseHours * ftePercentage;
  }

  // Helper: Check if date is in blackout period
  isBlackoutPeriod(date: Date): boolean {
    if (!this.restrictions?.blackoutPeriods) return false;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    return this.restrictions.blackoutPeriods.some(period => {
      return dateStr >= period.start && dateStr <= period.end;
    });
  }
}
