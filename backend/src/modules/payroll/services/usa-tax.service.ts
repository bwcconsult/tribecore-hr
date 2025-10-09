import { Injectable } from '@nestjs/common';
import { PayrollFrequency } from '../../../common/enums';
import { TaxCalculation } from './tax-calculator.service';

@Injectable()
export class USATaxService {
  // Federal Tax Brackets 2024 (Single Filer)
  private readonly FEDERAL_TAX_BRACKETS = [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  // FICA (Social Security + Medicare)
  private readonly SOCIAL_SECURITY_RATE = 0.062; // 6.2%
  private readonly SOCIAL_SECURITY_LIMIT = 168600;
  private readonly MEDICARE_RATE = 0.0145; // 1.45%
  private readonly MEDICARE_ADDITIONAL_RATE = 0.009; // 0.9% for high earners
  private readonly MEDICARE_ADDITIONAL_THRESHOLD = 200000;

  // 401(k) contribution (example)
  private readonly RETIREMENT_CONTRIBUTION_RATE = 0.06; // 6%

  calculateTax(grossPay: number, frequency: PayrollFrequency): TaxCalculation {
    // Convert to annual for calculation
    const annualGross = this.convertToAnnual(grossPay, frequency);

    // Calculate Federal Income Tax
    const incomeTax = this.calculateFederalIncomeTax(annualGross);
    
    // Calculate FICA (Social Security + Medicare)
    const fica = this.calculateFICA(annualGross);
    
    // Calculate Retirement Contribution
    const retirementContribution = annualGross * this.RETIREMENT_CONTRIBUTION_RATE;

    // Convert back to payment period
    const periodIncomeTax = this.convertToPeriod(incomeTax, frequency);
    const periodFICA = this.convertToPeriod(fica.total, frequency);
    const periodRetirement = this.convertToPeriod(retirementContribution, frequency);

    const totalDeductions = periodIncomeTax + periodFICA + periodRetirement;

    return {
      incomeTax: Number(periodIncomeTax.toFixed(2)),
      nationalInsurance: Number(periodFICA.toFixed(2)), // Using NI field for FICA
      pensionContribution: Number(periodRetirement.toFixed(2)),
      totalDeductions: Number(totalDeductions.toFixed(2)),
      breakdown: {
        taxableIncome: annualGross,
        socialSecurity: fica.socialSecurity,
        medicare: fica.medicare,
        taxBands: this.getTaxBands(annualGross),
      },
    };
  }

  private calculateFederalIncomeTax(annualGross: number): number {
    let tax = 0;
    let previousLimit = 0;

    for (const bracket of this.FEDERAL_TAX_BRACKETS) {
      if (annualGross > previousLimit) {
        const taxableInThisBracket = Math.min(annualGross, bracket.limit) - previousLimit;
        tax += taxableInThisBracket * bracket.rate;
        previousLimit = bracket.limit;
      } else {
        break;
      }
    }

    return tax;
  }

  private calculateFICA(annualGross: number) {
    // Social Security (capped)
    const socialSecurity = Math.min(annualGross, this.SOCIAL_SECURITY_LIMIT) * this.SOCIAL_SECURITY_RATE;
    
    // Medicare
    let medicare = annualGross * this.MEDICARE_RATE;
    
    // Additional Medicare tax for high earners
    if (annualGross > this.MEDICARE_ADDITIONAL_THRESHOLD) {
      medicare += (annualGross - this.MEDICARE_ADDITIONAL_THRESHOLD) * this.MEDICARE_ADDITIONAL_RATE;
    }

    return {
      socialSecurity,
      medicare,
      total: socialSecurity + medicare,
    };
  }

  private getTaxBands(annualGross: number) {
    const bands = [];
    let previousLimit = 0;

    for (const bracket of this.FEDERAL_TAX_BRACKETS) {
      if (annualGross > previousLimit) {
        const taxableInThisBracket = Math.min(annualGross, bracket.limit) - previousLimit;
        bands.push({
          band: `${(bracket.rate * 100).toFixed(0)}%`,
          rate: bracket.rate,
          amount: taxableInThisBracket * bracket.rate,
        });
        previousLimit = bracket.limit;
      } else {
        break;
      }
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
