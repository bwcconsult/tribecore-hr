import { Injectable } from '@nestjs/common';
import { PayrollFrequency } from '../../../common/enums';
import { TaxCalculation } from './tax-calculator.service';

@Injectable()
export class NigeriaTaxService {
  // Nigeria PAYE Tax Rates 2024
  private readonly TAX_BRACKETS = [
    { limit: 300000, rate: 0.07 },      // 7%
    { limit: 300000, rate: 0.11 },      // 11%
    { limit: 500000, rate: 0.15 },      // 15%
    { limit: 500000, rate: 0.19 },      // 19%
    { limit: 1600000, rate: 0.21 },     // 21%
    { limit: Infinity, rate: 0.24 },    // 24%
  ];

  // Consolidated Relief Allowance
  private readonly CRA_PERCENTAGE = 0.01; // 1% of gross income
  private readonly CRA_FIXED = 200000; // Higher of 1% or NGN 200,000

  // Pension Contribution
  private readonly PENSION_RATE = 0.08; // 8% employee contribution

  // NHF (National Housing Fund)
  private readonly NHF_RATE = 0.025; // 2.5%

  calculateTax(grossPay: number, frequency: PayrollFrequency): TaxCalculation {
    // Convert to annual for calculation
    const annualGross = this.convertToAnnual(grossPay, frequency);

    // Calculate CRA (Consolidated Relief Allowance)
    const cra = Math.max(annualGross * this.CRA_PERCENTAGE, this.CRA_FIXED);

    // Calculate Pension
    const pensionContribution = annualGross * this.PENSION_RATE;

    // Taxable income = Gross - CRA - Pension
    const taxableIncome = annualGross - cra - pensionContribution;

    // Calculate PAYE (Income Tax)
    const incomeTax = this.calculatePAYE(taxableIncome);
    
    // Calculate NHF
    const nhf = annualGross * this.NHF_RATE;

    // Convert back to payment period
    const periodIncomeTax = this.convertToPeriod(incomeTax, frequency);
    const periodPension = this.convertToPeriod(pensionContribution, frequency);
    const periodNHF = this.convertToPeriod(nhf, frequency);

    const totalDeductions = periodIncomeTax + periodPension + periodNHF;

    return {
      incomeTax: Number(periodIncomeTax.toFixed(2)),
      nationalInsurance: Number(periodNHF.toFixed(2)), // Using NI field for NHF
      pensionContribution: Number(periodPension.toFixed(2)),
      totalDeductions: Number(totalDeductions.toFixed(2)),
      breakdown: {
        taxableIncome,
        cra,
        taxBands: this.getTaxBands(taxableIncome),
      },
    };
  }

  private calculatePAYE(taxableIncome: number): number {
    if (taxableIncome <= 0) {
      return 0;
    }

    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of this.TAX_BRACKETS) {
      if (remainingIncome <= 0) break;

      const taxableInThisBracket = Math.min(remainingIncome, bracket.limit);
      tax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }

    return tax;
  }

  private getTaxBands(taxableIncome: number) {
    const bands = [];
    let remainingIncome = taxableIncome;

    for (const bracket of this.TAX_BRACKETS) {
      if (remainingIncome <= 0) break;

      const taxableInThisBracket = Math.min(remainingIncome, bracket.limit);
      bands.push({
        band: `${(bracket.rate * 100).toFixed(0)}%`,
        rate: bracket.rate,
        amount: taxableInThisBracket * bracket.rate,
      });
      remainingIncome -= taxableInThisBracket;
    }

    return bands;
  }

  private convertToAnnual(amount: number, frequency: PayrollFrequency): number {
    switch (frequency) {
      case PayrollFrequency.WEEKLY:
        return amount * 52;
      case PayrollFrequency.BIWEEKLY:
        return amount * 26;
      case PayrollFrequency.MONTHLY:
        return amount * 12;
      case PayrollFrequency.ANNUAL:
        return amount;
      default:
        return amount * 12;
    }
  }

  private convertToPeriod(annualAmount: number, frequency: PayrollFrequency): number {
    switch (frequency) {
      case PayrollFrequency.WEEKLY:
        return annualAmount / 52;
      case PayrollFrequency.BIWEEKLY:
        return annualAmount / 26;
      case PayrollFrequency.MONTHLY:
        return annualAmount / 12;
      case PayrollFrequency.ANNUAL:
        return annualAmount;
      default:
        return annualAmount / 12;
    }
  }
}
