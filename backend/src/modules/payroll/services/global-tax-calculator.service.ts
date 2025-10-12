import { Injectable } from '@nestjs/common';
import { UKTaxService } from './uk-tax.service';
import { USATaxService } from './usa-tax.service';
import { NigeriaTaxService } from './nigeria-tax.service';

export interface TaxCalculationResult {
  grossPay: number;
  taxableIncome: number;
  incomeTax: number;
  socialSecurity: number;
  pensionEmployee: number;
  pensionEmployer: number;
  healthInsurance: number;
  otherDeductions: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  netPay: number;
  breakdown: {
    taxBands?: Array<{ band: string; rate: number; amount: number }>;
    allowances?: Record<string, number>;
    exemptions?: Record<string, number>;
    credits?: Record<string, number>;
  };
  country: string;
  currency: string;
}

export interface EmployeePayrollInput {
  grossPay: number;
  country: string;
  state?: string;
  currency: string;
  payFrequency: string;
  taxCode?: string;
  allowances?: Record<string, number>;
  deductions?: Record<string, number>;
  pensionEmployeePercent?: number;
  pensionEmployerPercent?: number;
  healthInsurancePremium?: number;
  taxExempt?: boolean;
  dependents?: number;
  maritalStatus?: string;
}

@Injectable()
export class GlobalTaxCalculatorService {
  constructor(
    private ukTaxService: UKTaxService,
    private usaTaxService: USATaxService,
    private nigeriaTaxService: NigeriaTaxService,
  ) {}

  async calculateTax(input: EmployeePayrollInput): Promise<TaxCalculationResult> {
    const country = input.country.toUpperCase();

    switch (country) {
      case 'UK':
      case 'GB':
        return this.calculateUKTax(input);
      
      case 'US':
      case 'USA':
        return this.calculateUSATax(input);
      
      case 'NG':
      case 'NIGERIA':
        return this.calculateNigeriaTax(input);
      
      case 'ZA':
      case 'SOUTH_AFRICA':
        return this.calculateSouthAfricaTax(input);
      
      default:
        return this.calculateGenericTax(input);
    }
  }

  private async calculateUKTax(input: EmployeePayrollInput): Promise<TaxCalculationResult> {
    const { grossPay, payFrequency } = input;
    const taxCalc = this.ukTaxService.calculateTax(grossPay, payFrequency as any);
    
    return {
      grossPay,
      taxableIncome: taxCalc.taxableIncome,
      incomeTax: taxCalc.incomeTax,
      socialSecurity: taxCalc.nationalInsurance,
      pensionEmployee: taxCalc.pensionEmployee,
      pensionEmployer: taxCalc.pensionEmployer,
      healthInsurance: 0,
      otherDeductions: 0,
      totalEmployeeDeductions: taxCalc.totalDeductions,
      totalEmployerContributions: taxCalc.pensionEmployer + (taxCalc.nationalInsurance * 1.138),
      netPay: taxCalc.netPay,
      breakdown: taxCalc.breakdown,
      country: 'UK',
      currency: 'GBP',
    };
  }

  private async calculateUSATax(input: EmployeePayrollInput): Promise<TaxCalculationResult> {
    const { grossPay, payFrequency } = input;
    const taxCalc = this.usaTaxService.calculateTax(grossPay, payFrequency as any);
    
    return {
      grossPay,
      taxableIncome: taxCalc.taxableIncome,
      incomeTax: taxCalc.incomeTax,
      socialSecurity: taxCalc.socialSecurity,
      pensionEmployee: taxCalc.pensionEmployee,
      pensionEmployer: taxCalc.pensionEmployer,
      healthInsurance: 0,
      otherDeductions: 0,
      totalEmployeeDeductions: taxCalc.totalDeductions,
      totalEmployerContributions: taxCalc.socialSecurity + taxCalc.pensionEmployer,
      netPay: taxCalc.netPay,
      breakdown: taxCalc.breakdown,
      country: 'USA',
      currency: 'USD',
    };
  }

  private async calculateNigeriaTax(input: EmployeePayrollInput): Promise<TaxCalculationResult> {
    const { grossPay, payFrequency } = input;
    const taxCalc = this.nigeriaTaxService.calculateTax(grossPay, payFrequency as any);
    
    return {
      grossPay,
      taxableIncome: taxCalc.taxableIncome,
      incomeTax: taxCalc.incomeTax,
      socialSecurity: taxCalc.pension,
      pensionEmployee: taxCalc.pensionEmployee,
      pensionEmployer: taxCalc.pensionEmployer,
      healthInsurance: 0,
      otherDeductions: 0,
      totalEmployeeDeductions: taxCalc.totalDeductions,
      totalEmployerContributions: taxCalc.pensionEmployer + (grossPay * 0.035), // NHF + NSITF + ITF
      netPay: taxCalc.netPay,
      breakdown: taxCalc.breakdown,
      country: 'Nigeria',
      currency: 'NGN',
    };
  }

  private async calculateSouthAfricaTax(input: EmployeePayrollInput): Promise<TaxCalculationResult> {
    const { grossPay, pensionEmployeePercent = 0, pensionEmployerPercent = 0 } = input;

    // South Africa Tax Brackets 2024/25
    let incomeTax = 0;
    const annualGross = grossPay * 12;

    if (annualGross <= 237100) {
      incomeTax = annualGross * 0.18;
    } else if (annualGross <= 370500) {
      incomeTax = 42678 + (annualGross - 237100) * 0.26;
    } else if (annualGross <= 512800) {
      incomeTax = 77362 + (annualGross - 370500) * 0.31;
    } else if (annualGross <= 673000) {
      incomeTax = 121475 + (annualGross - 512800) * 0.36;
    } else if (annualGross <= 857900) {
      incomeTax = 179147 + (annualGross - 673000) * 0.39;
    } else if (annualGross <= 1817000) {
      incomeTax = 251258 + (annualGross - 857900) * 0.41;
    } else {
      incomeTax = 644489 + (annualGross - 1817000) * 0.45;
    }

    const monthlyTax = incomeTax / 12;

    // UIF: 1% employee + 1% employer (max R177.12 per month)
    const uifEmployee = Math.min(grossPay * 0.01, 177.12);
    const uifEmployer = Math.min(grossPay * 0.01, 177.12);

    // Skills Development Levy: 1% employer
    const sdl = grossPay * 0.01;

    // Pension
    const pensionEmployee = grossPay * (pensionEmployeePercent / 100);
    const pensionEmployer = grossPay * (pensionEmployerPercent / 100);

    const totalEmployeeDeductions = monthlyTax + uifEmployee + pensionEmployee;
    const totalEmployerContributions = uifEmployer + sdl + pensionEmployer;
    const netPay = grossPay - totalEmployeeDeductions;

    return {
      grossPay,
      taxableIncome: grossPay,
      incomeTax: monthlyTax,
      socialSecurity: uifEmployee,
      pensionEmployee,
      pensionEmployer,
      healthInsurance: 0,
      otherDeductions: 0,
      totalEmployeeDeductions,
      totalEmployerContributions,
      netPay,
      breakdown: {
        taxBands: [{ band: 'PAYE', rate: (monthlyTax / grossPay) * 100, amount: monthlyTax }],
      },
      country: 'ZA',
      currency: 'ZAR',
    };
  }

  private async calculateGenericTax(input: EmployeePayrollInput): Promise<TaxCalculationResult> {
    const { grossPay, pensionEmployeePercent = 0, pensionEmployerPercent = 0 } = input;

    // Generic 20% flat tax for unknown countries
    const incomeTax = grossPay * 0.20;
    const socialSecurity = grossPay * 0.05;
    const pensionEmployee = grossPay * (pensionEmployeePercent / 100);
    const pensionEmployer = grossPay * (pensionEmployerPercent / 100);

    const totalEmployeeDeductions = incomeTax + socialSecurity + pensionEmployee;
    const totalEmployerContributions = pensionEmployer;
    const netPay = grossPay - totalEmployeeDeductions;

    return {
      grossPay,
      taxableIncome: grossPay,
      incomeTax,
      socialSecurity,
      pensionEmployee,
      pensionEmployer,
      healthInsurance: 0,
      otherDeductions: 0,
      totalEmployeeDeductions,
      totalEmployerContributions,
      netPay,
      breakdown: {},
      country: input.country,
      currency: input.currency,
    };
  }

  // Batch calculation for payroll run
  async calculateBatch(inputs: EmployeePayrollInput[]): Promise<TaxCalculationResult[]> {
    return Promise.all(inputs.map(input => this.calculateTax(input)));
  }

  // Get tax summary for a country
  async getTaxSummary(country: string, year: string) {
    const countryUpper = country.toUpperCase();

    switch (countryUpper) {
      case 'UK':
      case 'GB':
        return {
          country: 'UK',
          year,
          taxBrackets: [
            { limit: 12570, rate: 0, name: 'Personal Allowance' },
            { limit: 50270, rate: 20, name: 'Basic Rate' },
            { limit: 125140, rate: 40, name: 'Higher Rate' },
            { limit: Infinity, rate: 45, name: 'Additional Rate' },
          ],
          nationalInsurance: [
            { limit: 12570, rate: 0, name: 'Primary Threshold' },
            { limit: 50270, rate: 12, name: 'Standard Rate' },
            { limit: Infinity, rate: 2, name: 'Upper Earnings' },
          ],
          employerNI: 13.8,
          pensionAutoEnrollment: true,
        };
      
      case 'NG':
        return {
          country: 'Nigeria',
          year,
          taxBrackets: [
            { limit: 300000, rate: 7, name: 'Band 1' },
            { limit: 600000, rate: 11, name: 'Band 2' },
            { limit: 1100000, rate: 15, name: 'Band 3' },
            { limit: 1600000, rate: 19, name: 'Band 4' },
            { limit: 3200000, rate: 21, name: 'Band 5' },
            { limit: Infinity, rate: 24, name: 'Band 6' },
          ],
          pension: { employee: 8, employer: 10 },
          nhf: 2.5,
          nsitf: 1,
          itf: 1,
        };
      
      default:
        return {
          country,
          year,
          message: 'Tax data not available for this country',
        };
    }
  }
}
