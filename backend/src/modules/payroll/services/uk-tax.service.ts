import { Injectable } from '@nestjs/common';
import { PayrollFrequency } from '../../../common/enums';
import { TaxCalculation } from './tax-calculator.service';

@Injectable()
export class UKTaxService {
  // UK Tax Rates 2024/2025
  private readonly TAX_FREE_ALLOWANCE = 12570;
  private readonly BASIC_RATE = 0.2; // 20%
  private readonly HIGHER_RATE = 0.4; // 40%
  private readonly ADDITIONAL_RATE = 0.45; // 45%
  
  private readonly BASIC_RATE_THRESHOLD = 50270;
  private readonly HIGHER_RATE_THRESHOLD = 125140;

  // National Insurance (NI) Rates
  private readonly NI_THRESHOLD = 12570;
  private readonly NI_RATE = 0.12; // 12%
  private readonly NI_HIGHER_RATE = 0.02; // 2%
  private readonly NI_HIGHER_THRESHOLD = 50270;

  // Pension
  private readonly PENSION_RATE = 0.05; // 5% employee contribution

  calculateTax(grossPay: number, frequency: PayrollFrequency): TaxCalculation {
    // Convert to annual for calculation
    const annualGross = this.convertToAnnual(grossPay, frequency);

    // Calculate Income Tax
    const incomeTax = this.calculateIncomeTax(annualGross);
    
    // Calculate National Insurance
    const nationalInsurance = this.calculateNationalInsurance(annualGross);
    
    // Calculate Pension Contribution
    const pensionContribution = annualGross * this.PENSION_RATE;

    // Convert back to payment period
    const periodIncomeTax = this.convertToPeriod(incomeTax, frequency);
    const periodNI = this.convertToPeriod(nationalInsurance, frequency);
    const periodPension = this.convertToPeriod(pensionContribution, frequency);

    const totalDeductions = periodIncomeTax + periodNI + periodPension;

    return {
      incomeTax: Number(periodIncomeTax.toFixed(2)),
      nationalInsurance: Number(periodNI.toFixed(2)),
      pensionContribution: Number(periodPension.toFixed(2)),
      totalDeductions: Number(totalDeductions.toFixed(2)),
      breakdown: {
        taxableIncome: annualGross - this.TAX_FREE_ALLOWANCE,
        taxBands: this.getTaxBands(annualGross),
      },
    };
  }

  private calculateIncomeTax(annualGross: number): number {
    if (annualGross <= this.TAX_FREE_ALLOWANCE) {
      return 0;
    }

    let tax = 0;
    const taxableIncome = annualGross - this.TAX_FREE_ALLOWANCE;

    // Basic rate
    if (taxableIncome <= this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE) {
      tax = taxableIncome * this.BASIC_RATE;
    }
    // Higher rate
    else if (taxableIncome <= this.HIGHER_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE) {
      tax = (this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE) * this.BASIC_RATE;
      tax += (taxableIncome - (this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE)) * this.HIGHER_RATE;
    }
    // Additional rate
    else {
      tax = (this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE) * this.BASIC_RATE;
      tax += (this.HIGHER_RATE_THRESHOLD - this.BASIC_RATE_THRESHOLD) * this.HIGHER_RATE;
      tax += (taxableIncome - (this.HIGHER_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE)) * this.ADDITIONAL_RATE;
    }

    return tax;
  }

  private calculateNationalInsurance(annualGross: number): number {
    if (annualGross <= this.NI_THRESHOLD) {
      return 0;
    }

    let ni = 0;
    
    if (annualGross <= this.NI_HIGHER_THRESHOLD) {
      ni = (annualGross - this.NI_THRESHOLD) * this.NI_RATE;
    } else {
      ni = (this.NI_HIGHER_THRESHOLD - this.NI_THRESHOLD) * this.NI_RATE;
      ni += (annualGross - this.NI_HIGHER_THRESHOLD) * this.NI_HIGHER_RATE;
    }

    return ni;
  }

  private getTaxBands(annualGross: number) {
    const bands = [];
    const taxableIncome = annualGross - this.TAX_FREE_ALLOWANCE;

    if (taxableIncome > 0) {
      bands.push({
        band: 'Basic Rate',
        rate: this.BASIC_RATE,
        amount: Math.min(taxableIncome, this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE) * this.BASIC_RATE,
      });
    }

    if (taxableIncome > this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE) {
      bands.push({
        band: 'Higher Rate',
        rate: this.HIGHER_RATE,
        amount: Math.min(
          taxableIncome - (this.BASIC_RATE_THRESHOLD - this.TAX_FREE_ALLOWANCE),
          this.HIGHER_RATE_THRESHOLD - this.BASIC_RATE_THRESHOLD,
        ) * this.HIGHER_RATE,
      });
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
