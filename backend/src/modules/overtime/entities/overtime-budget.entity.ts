import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BudgetPeriod {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  WARNING = 'WARNING', // Near threshold
  EXCEEDED = 'EXCEEDED',
  DEPLETED = 'DEPLETED', // Fully consumed
  EXPIRED = 'EXPIRED',
}

/**
 * OvertimeBudget - Cost control and budget tracking
 * Tracks OT budget caps and spending per cost center/project
 */
@Entity('overtime_budgets')
@Index(['costCenter', 'periodStart'])
@Index(['project', 'periodStart'])
@Index(['status'])
export class OvertimeBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ nullable: true })
  departmentId: string;

  // === SCOPE ===
  
  @Column({ nullable: true })
  costCenter: string; // Budget applies to this cost center

  @Column({ nullable: true })
  project: string; // Or this project

  @Column({ nullable: true })
  locationId: string;

  @Column({ type: 'simple-array', nullable: true })
  applicableEmployees: string[]; // Specific employees if needed

  @Column({ nullable: true })
  name: string; // e.g., "Q1 IT Department OT Budget"

  @Column({ type: 'text', nullable: true })
  description: string;

  // === PERIOD ===
  
  @Column({ type: 'enum', enum: BudgetPeriod })
  period: BudgetPeriod;

  @Column()
  periodStart: Date;

  @Column()
  periodEnd: Date;

  // === CAPS & LIMITS ===
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  capHours: number; // Max OT hours allowed

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  capAmount: number; // Max OT cost allowed

  @Column({ nullable: true })
  currency: string;

  @Column({ default: true })
  isHardCap: boolean; // Block if exceeded vs warning only

  @Column({ default: false })
  allowOverride: boolean; // Senior approval can override

  // === SPENDING ===
  
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spentHours: number; // Hours consumed so far

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number; // Cost consumed so far

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  committedHours: number; // Hours approved but not yet paid

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  committedAmount: number; // Cost approved but not yet paid

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  remainingHours: number; // Calculated

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingAmount: number; // Calculated

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageUsed: number; // % of budget used

  // === THRESHOLDS & ALERTS ===
  
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80 })
  warningThresholdPercent: number; // Alert at 80% by default

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 95 })
  criticalThresholdPercent: number; // Critical alert at 95%

  @Column({ default: false })
  warningTriggered: boolean;

  @Column({ default: false })
  criticalTriggered: boolean;

  @Column({ type: 'jsonb', default: [] })
  alerts: Array<{
    type: 'WARNING' | 'CRITICAL' | 'EXCEEDED' | 'DEPLETED';
    message: string;
    triggeredAt: Date;
    percentageAtTrigger: number;
    notifiedTo?: string[];
    acknowledged?: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
  }>;

  // === STATUS ===
  
  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.ACTIVE })
  status: BudgetStatus;

  @Column({ default: false })
  isExceeded: boolean;

  @Column({ nullable: true })
  exceededAt: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  excessAmount: number; // Amount over budget

  // === APPROVAL REQUIREMENTS ===
  
  @Column({ default: false })
  requireApprovalForOverBudget: boolean;

  @Column({ nullable: true })
  overBudgetApprover: string; // Who can approve over-budget requests

  @Column({ type: 'simple-array', nullable: true })
  approverRoles: string[]; // Roles that can approve over-budget

  // === TRACKING & HISTORY ===
  
  @Column({ type: 'jsonb', default: [] })
  transactions: Array<{
    id: string;
    type: 'SPEND' | 'COMMIT' | 'REFUND' | 'ADJUSTMENT';
    timestamp: Date;
    hours?: number;
    amount: number;
    overtimeLineId?: string;
    shiftId?: string;
    employeeId?: string;
    description?: string;
    balanceBefore: number;
    balanceAfter: number;
  }>;

  // === FORECASTING ===
  
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  forecastedSpend: number; // Projected total spend by period end

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  forecastedOverrun: number; // Projected % over budget

  @Column({ nullable: true })
  lastForecastAt: Date;

  // === REALLOCATION ===
  
  @Column({ default: false })
  allowReallocation: boolean; // Can move budget between cost centers

  @Column({ type: 'jsonb', nullable: true })
  reallocations: Array<{
    fromBudgetId?: string;
    toBudgetId?: string;
    amount: number;
    date: Date;
    approvedBy: string;
    reason: string;
  }>;

  // === REPORTING ===
  
  @Column({ type: 'simple-array', nullable: true })
  reportRecipients: string[]; // Who gets budget reports

  @Column({ nullable: true })
  lastReportSentAt: Date;

  // === METADATA ===
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    fiscalYear?: string;
    budgetCode?: string;
    glAccount?: string;
    approvedByFinance?: boolean;
    notes?: string;
    owner?: string; // Budget owner
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  // === HELPER METHODS ===

  /**
   * Calculate remaining budget
   */
  calculateRemaining(): void {
    const totalSpent = this.spentHours + this.committedHours;
    const totalSpentAmount = this.spentAmount + this.committedAmount;

    if (this.capHours) {
      this.remainingHours = Math.max(0, this.capHours - totalSpent);
    }

    if (this.capAmount) {
      this.remainingAmount = Math.max(0, this.capAmount - totalSpentAmount);
    }

    // Calculate percentage
    const primaryCap = this.capAmount || (this.capHours ? this.capHours * 100 : null);
    const primarySpent = this.capAmount ? totalSpentAmount : totalSpent;

    if (primaryCap) {
      this.percentageUsed = (primarySpent / primaryCap) * 100;
    }
  }

  /**
   * Check thresholds and trigger alerts
   */
  checkThresholds(): void {
    this.calculateRemaining();

    if (!this.percentageUsed) return;

    // Warning threshold
    if (this.percentageUsed >= this.warningThresholdPercent && !this.warningTriggered) {
      this.warningTriggered = true;
      this.status = BudgetStatus.WARNING;
      this.addAlert('WARNING', `Budget at ${this.percentageUsed.toFixed(1)}% (warning threshold: ${this.warningThresholdPercent}%)`);
    }

    // Critical threshold
    if (this.percentageUsed >= this.criticalThresholdPercent && !this.criticalTriggered) {
      this.criticalTriggered = true;
      this.status = BudgetStatus.WARNING; // Keep as WARNING until actually exceeded
      this.addAlert('CRITICAL', `Budget at ${this.percentageUsed.toFixed(1)}% (critical threshold: ${this.criticalThresholdPercent}%)`);
    }

    // Exceeded
    if (this.percentageUsed >= 100) {
      this.isExceeded = true;
      this.status = BudgetStatus.EXCEEDED;
      if (!this.exceededAt) {
        this.exceededAt = new Date();
        this.addAlert('EXCEEDED', `Budget exceeded at ${this.percentageUsed.toFixed(1)}%`);
      }
    }

    // Depleted (>110%)
    if (this.percentageUsed >= 110) {
      this.status = BudgetStatus.DEPLETED;
    }
  }

  /**
   * Add spending transaction
   */
  addSpend(hours: number, amount: number, overtimeLineId: string, employeeId: string): void {
    const balanceBefore = this.remainingAmount || this.capAmount || 0;

    this.spentHours += hours;
    this.spentAmount += amount;

    this.transactions.push({
      id: this.generateId(),
      type: 'SPEND',
      timestamp: new Date(),
      hours,
      amount,
      overtimeLineId,
      employeeId,
      balanceBefore,
      balanceAfter: balanceBefore - amount,
    });

    this.checkThresholds();
  }

  /**
   * Check if has capacity
   */
  hasCapacity(hours: number, amount: number): boolean {
    if (!this.isHardCap) return true; // Soft cap = warning only

    this.calculateRemaining();

    if (this.capHours && this.remainingHours < hours) return false;
    if (this.capAmount && this.remainingAmount < amount) return false;

    return true;
  }

  /**
   * Generate forecast
   */
  generateForecast(historicalData: { date: Date; amount: number }[]): void {
    // Simple linear projection
    if (historicalData.length < 2) return;

    const avgDailySpend = historicalData.reduce((sum, d) => sum + d.amount, 0) / historicalData.length;
    const daysRemaining = Math.ceil((this.periodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    this.forecastedSpend = this.spentAmount + (avgDailySpend * daysRemaining);
    
    if (this.capAmount) {
      this.forecastedOverrun = ((this.forecastedSpend - this.capAmount) / this.capAmount) * 100;
    }

    this.lastForecastAt = new Date();
  }

  /**
   * Add alert
   */
  private addAlert(type: string, message: string): void {
    this.alerts.push({
      type: type as any,
      message,
      triggeredAt: new Date(),
      percentageAtTrigger: this.percentageUsed,
      notifiedTo: this.reportRecipients,
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
