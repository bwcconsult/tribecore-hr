import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SeparationCase } from './separation-case.entity';

@Entity('severance_calculations')
export class SeveranceCalculation extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => SeparationCase)
  @JoinColumn({ name: 'caseId' })
  case: SeparationCase;

  @Column()
  organizationId: string;

  @Column()
  country: string;

  // Base calculation inputs
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  basePay: number; // Annual or monthly base

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tenureYears: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  multiplier: number; // e.g., 1.5x for senior roles

  // Statutory severance (by law)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  statutoryAmount: number;

  // Ex-gratia (company discretionary)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  exGratiaAmount: number;

  // Holiday payout
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  holidayPayoutHours: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  holidayPayoutAmount: number;

  // TOIL payout
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  toilPayoutHours: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  toilPayoutAmount: number;

  // Other earnings
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonusAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overtimeAmount: number;

  // Deductions
  @Column({ type: 'jsonb', default: [] })
  deductions: Array<{
    type: string;
    description: string;
    amount: number;
  }>;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  // Totals before tax
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number;

  // Tax & NIC
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  nicAmount: number; // National Insurance (UK) or social security

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxFreeAllowance: number; // e.g., UK £30k severance tax-free

  // Net amount
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  // Calculation metadata
  @Column({ type: 'jsonb', nullable: true })
  calculationDetails: {
    formula?: string;
    cap?: number;
    taxTreatment?: string;
    paymentSchedule?: string[];
    notes?: string;
    [key: string]: any;
  };

  // Approval
  @Column({ default: false })
  approved: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  /**
   * Calculate statutory redundancy pay (UK example)
   */
  static calculateUKStatutoryRedundancy(
    weeklyPay: number,
    tenureYears: number,
    age: number,
  ): number {
    const CAP = 643; // UK weekly pay cap (2024)
    const cappedWeeklyPay = Math.min(weeklyPay, CAP);

    let weeks = 0;

    for (let year = 0; year < Math.min(tenureYears, 20); year++) {
      const ageAtYear = age - (tenureYears - year - 1);
      if (ageAtYear < 22) weeks += 0.5;
      else if (ageAtYear < 41) weeks += 1;
      else weeks += 1.5;
    }

    return cappedWeeklyPay * weeks;
  }

  /**
   * Calculate total gross amount
   */
  calculate(): void {
    this.totalDeductions = this.deductions.reduce((sum, d) => sum + d.amount, 0);

    this.grossAmount =
      this.statutoryAmount +
      this.exGratiaAmount +
      this.holidayPayoutAmount +
      this.toilPayoutAmount +
      this.bonusAmount +
      this.commissionAmount +
      this.overtimeAmount -
      this.totalDeductions;

    // Simple tax calculation (actual would be more complex)
    const taxableAmount = Math.max(0, this.grossAmount - this.taxFreeAllowance);
    this.taxAmount = taxableAmount * 0.2; // Simplified 20% rate
    this.nicAmount = taxableAmount * 0.12; // Simplified 12% NIC

    this.netAmount = this.grossAmount - this.taxAmount - this.nicAmount;
  }

  /**
   * Get payment breakdown
   */
  getBreakdown(): any {
    return {
      earnings: {
        statutory: this.statutoryAmount,
        exGratia: this.exGratiaAmount,
        holiday: this.holidayPayoutAmount,
        toil: this.toilPayoutAmount,
        bonus: this.bonusAmount,
        commission: this.commissionAmount,
        overtime: this.overtimeAmount,
      },
      deductions: {
        items: this.deductions,
        total: this.totalDeductions,
      },
      gross: this.grossAmount,
      tax: {
        tax: this.taxAmount,
        nic: this.nicAmount,
        taxFreeUsed: Math.min(this.taxFreeAllowance, this.grossAmount),
      },
      net: this.netAmount,
    };
  }
}
