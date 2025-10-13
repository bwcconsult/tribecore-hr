import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payslip, PayslipStatus } from '../entities/payslip.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { PayrollRun } from '../entities/payroll-run.entity';
import { UKTaxService } from './uk-tax.service';
import { USATaxService } from './usa-tax.service';
import { NigeriaTaxService } from './nigeria-tax.service';
import * as crypto from 'crypto';

export interface PayslipCalculationInput {
  employeeId: string;
  payRunId?: string;
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  country: string;
  currency: string;
  baseSalary: number;
  payFrequency: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';
  hours?: number;
  overtimeHours?: number;
  allowances?: Array<{ code: string; label: string; amount: number; taxable: boolean }>;
  bonuses?: Array<{ code: string; label: string; amount: number }>;
  deductions?: Array<{ code: string; label: string; amount: number; isPreTax: boolean }>;
  priorYTD?: any;
  taxInfo?: any; // W-4, P45, tax codes, etc.
  leaveData?: any;
}

@Injectable()
export class PayslipCalculationEngineService {
  private readonly logger = new Logger(PayslipCalculationEngineService.name);

  constructor(
    @InjectRepository(Payslip)
    private payslipRepository: Repository<Payslip>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(PayrollRun)
    private payrollRunRepository: Repository<PayrollRun>,
    private ukTaxService: UKTaxService,
    private usaTaxService: USATaxService,
    private nigeriaTaxService: NigeriaTaxService,
  ) {}

  async calculatePayslip(input: PayslipCalculationInput): Promise<Payslip> {
    this.logger.log(`Calculating payslip for employee ${input.employeeId}, period ${input.periodStart} to ${input.periodEnd}`);

    const payslip = new Payslip();
    payslip.employeeId = input.employeeId;
    payslip.payRunId = input.payRunId;
    payslip.periodStart = input.periodStart;
    payslip.periodEnd = input.periodEnd;
    payslip.payDate = input.payDate;
    payslip.country = input.country;
    payslip.currency = input.currency;
    payslip.status = PayslipStatus.DRAFT;

    // Step 1: Calculate Gross Earnings
    const earnings = await this.calculateEarnings(input);
    const grossFromEarnings = earnings.reduce((sum, e) => sum + Number(e.periodAmount), 0);

    // Step 2: Add Allowances (may be taxable)
    const allowances = input.allowances || [];
    const grossFromAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);

    const totalGross = grossFromEarnings + grossFromAllowances;

    // Step 3: Calculate Pre-Tax Deductions
    const preTaxDeductions = (input.deductions || []).filter(d => d.isPreTax);
    const preTaxTotal = preTaxDeductions.reduce((sum, d) => sum + d.amount, 0);

    // Step 4: Calculate Taxable Base
    const taxableEarnings = earnings.filter(e => e.taxable);
    const taxableAllowances = allowances.filter(a => a.taxable);
    const taxableBase = 
      taxableEarnings.reduce((sum, e) => sum + Number(e.periodAmount), 0) +
      taxableAllowances.reduce((sum, a) => sum + a.amount, 0) -
      preTaxTotal;

    // Step 5: Calculate Taxes (country-specific)
    const taxes = await this.calculateTaxes(input, taxableBase);
    const totalTax = taxes.reduce((sum, t) => sum + Number(t.amount), 0);

    // Step 6: Calculate Post-Tax Deductions
    const postTaxDeductions = (input.deductions || []).filter(d => !d.isPreTax);
    const postTaxTotal = postTaxDeductions.reduce((sum, d) => sum + d.amount, 0);

    // Step 7: Calculate Employer Contributions
    const employerContribs = await this.calculateEmployerContributions(input, taxableBase);
    const totalEmployerContribs = employerContribs.reduce((sum, c) => sum + Number(c.amount), 0);

    // Step 8: Calculate Net Pay
    const netPay = totalGross - preTaxTotal - totalTax - postTaxTotal;

    // Validation: Negative net guard
    if (netPay < 0) {
      this.logger.warn(`Negative net pay detected for employee ${input.employeeId}: ${netPay}`);
      // In production, this would require override + reason
    }

    // Assign to payslip
    payslip.grossPay = totalGross;
    payslip.totalDeductions = preTaxTotal + totalTax + postTaxTotal;
    payslip.totalEmployerContributions = totalEmployerContribs;
    payslip.netPay = netPay;

    // Step 9: Generate hash for tamper-proofing
    payslip.signedBy = this.generateSignature(payslip, earnings, taxes);

    // Step 10: Update YTD
    payslip.ytdSnapshot = this.calculateYTD(input.priorYTD, {
      gross: totalGross,
      tax: totalTax,
      preTax: preTaxTotal,
      postTax: postTaxTotal,
    });

    payslip.generatedAt = new Date();
    payslip.calculationTrace = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      country: input.country,
      steps: [
        { step: 'gross_calc', result: totalGross },
        { step: 'pretax_deductions', result: preTaxTotal },
        { step: 'taxable_base', result: taxableBase },
        { step: 'taxes', result: totalTax },
        { step: 'posttax_deductions', result: postTaxTotal },
        { step: 'net_pay', result: netPay },
      ],
    };

    return payslip;
  }

  private async calculateEarnings(input: PayslipCalculationInput): Promise<any[]> {
    const earnings = [];

    // Base Salary
    const payFrequencyFactor = this.getPayFrequencyFactor(input.payFrequency);
    const basePeriodSalary = input.baseSalary / payFrequencyFactor;

    earnings.push({
      code: 'BASE',
      label: 'Base Salary',
      qty: 1,
      rate: basePeriodSalary,
      units: 'period',
      periodAmount: basePeriodSalary,
      taxable: true,
      niable: true,
      pensionable: true,
      calcTrace: {
        formula: 'annual / payFrequencyFactor',
        inputs: { annual: input.baseSalary, payFrequencyFactor },
        source: 'BASE_SALARY_ENGINE',
      },
    });

    // Overtime (if any)
    if (input.overtimeHours && input.overtimeHours > 0) {
      const hourlyRate = (input.baseSalary / payFrequencyFactor) / 160; // Assuming 160 hours/month
      const overtimeRate = hourlyRate * 1.5;
      const overtimeAmount = input.overtimeHours * overtimeRate;

      earnings.push({
        code: 'OT1',
        label: 'Overtime 1.5x',
        qty: input.overtimeHours,
        rate: overtimeRate,
        units: 'hour',
        periodAmount: overtimeAmount,
        taxable: true,
        niable: true,
        pensionable: false,
        overtimeClass: 'OT1',
        calcTrace: {
          formula: 'hours * (hourlyRate * 1.5)',
          inputs: { hours: input.overtimeHours, hourlyRate, multiplier: 1.5 },
          source: 'OVERTIME_ENGINE',
        },
      });
    }

    // Bonuses (if any)
    if (input.bonuses) {
      input.bonuses.forEach(bonus => {
        earnings.push({
          code: bonus.code,
          label: bonus.label,
          qty: 1,
          rate: bonus.amount,
          units: 'period',
          periodAmount: bonus.amount,
          taxable: true,
          niable: true,
          pensionable: false,
          bonusFlag: true,
          calcTrace: {
            formula: 'fixedAmount',
            inputs: { amount: bonus.amount },
            source: 'BONUS_ENGINE',
          },
        });
      });
    }

    return earnings;
  }

  private async calculateTaxes(input: PayslipCalculationInput, taxableBase: number): Promise<any[]> {
    const taxes = [];

    switch (input.country) {
      case 'UK':
        return await this.calculateUKTaxes(input, taxableBase);
      case 'US':
        return await this.calculateUSTaxes(input, taxableBase);
      case 'NG':
        return await this.calculateNigeriaTaxes(input, taxableBase);
      case 'ZA':
        return await this.calculateSouthAfricaTaxes(input, taxableBase);
      default:
        this.logger.warn(`No tax calculation implemented for country: ${input.country}`);
        return taxes;
    }
  }

  private async calculateUKTaxes(input: PayslipCalculationInput, taxableBase: number): Promise<any[]> {
    const taxes = [];

    // PAYE (using existing UKTaxService)
    const paye = this.ukTaxService.calculateIncomeTax({
      annualGross: taxableBase * 12,
      taxCode: input.taxInfo?.taxCode || '1257L',
      payPeriod: 'monthly',
    });

    const payeAmount = paye.incomeTax / 12; // Monthly

    taxes.push({
      jurisdiction: 'UK',
      taxCode: 'PAYE',
      basis: 'PAYE',
      taxableBase: taxableBase,
      rate: null,
      amount: payeAmount,
      calcTrace: {
        formula: 'UK PAYE progressive bands',
        inputs: { taxableBase, taxCode: input.taxInfo?.taxCode || '1257L' },
        source: 'UK-PAYE-2025',
        references: ['TaxCode:1257L cumulative'],
      },
    });

    // National Insurance
    const niCategory = input.taxInfo?.niCategory || 'A';
    const ni = this.ukTaxService.calculateNationalInsurance({
      annualGross: taxableBase * 12,
      category: niCategory,
    });

    const niAmount = ni.employeeNI / 12;

    taxes.push({
      jurisdiction: 'UK',
      taxCode: `EE_NI_${niCategory}`,
      basis: 'NI',
      taxableBase: taxableBase,
      rate: null,
      amount: niAmount,
      calcTrace: {
        formula: 'UK NI Category A bands',
        inputs: { taxableBase, category: niCategory },
        source: 'UK-NI-2025',
        references: [`NI:Cat${niCategory}`],
      },
    });

    // Student Loan (if applicable)
    if (input.taxInfo?.studentLoanPlan) {
      const slThreshold = input.taxInfo.studentLoanPlan === 'Plan2' ? 27295 : 22015;
      if (taxableBase * 12 > slThreshold) {
        const slAmount = ((taxableBase * 12) - slThreshold) * 0.09 / 12;
        taxes.push({
          jurisdiction: 'UK',
          taxCode: `StudentLoan${input.taxInfo.studentLoanPlan}`,
          basis: 'SL',
          taxableBase: taxableBase,
          rate: 0.09,
          amount: slAmount,
          calcTrace: {
            formula: '(taxableBase - threshold) * 0.09',
            inputs: { taxableBase: taxableBase * 12, threshold: slThreshold, rate: 0.09 },
            source: 'UK-SL-2025',
          },
        });
      }
    }

    return taxes;
  }

  private async calculateUSTaxes(input: PayslipCalculationInput, taxableBase: number): Promise<any[]> {
    const taxes = [];

    // Federal Income Tax (simplified - use W-4 info)
    const federalTax = this.usaTaxService.calculateFederalTax({
      annualGross: taxableBase * 26, // Assuming biweekly
      w4Info: input.taxInfo?.w4 || {},
    });

    taxes.push({
      jurisdiction: 'US-Federal',
      taxCode: 'FIT',
      basis: 'FIT',
      taxableBase: taxableBase,
      rate: null,
      amount: federalTax.federalWithholding / 26,
      calcTrace: {
        formula: 'US Federal W-4 2020+ method',
        inputs: { taxableBase, w4: input.taxInfo?.w4 },
        source: 'US-FIT-2025',
      },
    });

    // Social Security (6.2% up to cap)
    const ssCap = 168600; // 2025 cap
    const ssBase = Math.min(taxableBase * 26, ssCap);
    const ssAmount = (ssBase * 0.062) / 26;

    taxes.push({
      jurisdiction: 'US-Federal',
      taxCode: 'FICA_SS',
      basis: 'FICA',
      taxableBase: ssBase / 26,
      rate: 0.062,
      amount: ssAmount,
      calcTrace: {
        formula: 'taxableBase * 0.062 (capped)',
        inputs: { taxableBase: ssBase / 26, rate: 0.062, cap: ssCap },
        source: 'US-FICA-SS-2025',
      },
    });

    // Medicare (1.45% + 0.9% additional for high earners)
    const medBase = taxableBase;
    const medRate = taxableBase * 26 > 200000 ? 0.0235 : 0.0145;
    const medAmount = medBase * medRate;

    taxes.push({
      jurisdiction: 'US-Federal',
      taxCode: 'FICA_MED',
      basis: 'FICA',
      taxableBase: medBase,
      rate: medRate,
      amount: medAmount,
      calcTrace: {
        formula: 'taxableBase * rate (1.45% or 2.35%)',
        inputs: { taxableBase: medBase, rate: medRate },
        source: 'US-FICA-MED-2025',
      },
    });

    // State Tax (if applicable)
    if (input.taxInfo?.state) {
      // Simplified - would need state-specific calculation
      const stateRate = 0.05; // Example 5%
      const stateAmount = taxableBase * stateRate;
      taxes.push({
        jurisdiction: `US-${input.taxInfo.state}`,
        taxCode: 'SIT',
        basis: 'SIT',
        taxableBase: taxableBase,
        rate: stateRate,
        amount: stateAmount,
        calcTrace: {
          formula: 'taxableBase * stateRate',
          inputs: { taxableBase, stateRate },
          source: `US-${input.taxInfo.state}-2025`,
        },
      });
    }

    return taxes;
  }

  private async calculateNigeriaTaxes(input: PayslipCalculationInput, taxableBase: number): Promise<any[]> {
    const taxes = [];

    // PAYE (progressive bands)
    const paye = this.nigeriaTaxService.calculatePAYE(taxableBase * 12);
    taxes.push({
      jurisdiction: 'NG',
      taxCode: 'PAYE',
      basis: 'PAYE',
      taxableBase: taxableBase,
      rate: null,
      amount: paye / 12,
      calcTrace: {
        formula: 'Nigeria PAYE progressive bands',
        inputs: { annualBase: taxableBase * 12 },
        source: 'NG-PAYE-2025',
      },
    });

    // Pension (8% employee default)
    const pensionRate = 0.08;
    const pensionAmount = taxableBase * pensionRate;
    taxes.push({
      jurisdiction: 'NG',
      taxCode: 'PENSION_EE',
      basis: 'PENSION',
      taxableBase: taxableBase,
      rate: pensionRate,
      amount: pensionAmount,
      calcTrace: {
        formula: 'taxableBase * 0.08',
        inputs: { taxableBase, rate: pensionRate },
        source: 'NG-PENSION-2025',
      },
    });

    // NHF (2.5% if applicable)
    if (input.taxInfo?.nhfEnrolled) {
      const nhfAmount = taxableBase * 0.025;
      taxes.push({
        jurisdiction: 'NG',
        taxCode: 'NHF',
        basis: 'NHF',
        taxableBase: taxableBase,
        rate: 0.025,
        amount: nhfAmount,
        calcTrace: {
          formula: 'taxableBase * 0.025',
          inputs: { taxableBase, rate: 0.025 },
          source: 'NG-NHF-2025',
        },
      });
    }

    return taxes;
  }

  private async calculateSouthAfricaTaxes(input: PayslipCalculationInput, taxableBase: number): Promise<any[]> {
    const taxes = [];

    // PAYE (progressive)
    // Simplified bands for 2025 (example)
    const annualBase = taxableBase * 12;
    let paye = 0;
    if (annualBase > 237100) paye = 42678 + (annualBase - 237100) * 0.26;
    else if (annualBase > 370500) paye = 77362 + (annualBase - 370500) * 0.31;
    // ... more bands

    taxes.push({
      jurisdiction: 'ZA',
      taxCode: 'PAYE',
      basis: 'PAYE',
      taxableBase: taxableBase,
      rate: null,
      amount: paye / 12,
      calcTrace: {
        formula: 'South Africa PAYE bands',
        inputs: { annualBase },
        source: 'ZA-PAYE-2025',
      },
    });

    // UIF (1% employee, capped)
    const uifCap = 177.12; // Monthly cap 2025
    const uifAmount = Math.min(taxableBase * 0.01, uifCap);
    taxes.push({
      jurisdiction: 'ZA',
      taxCode: 'UIF_EE',
      basis: 'UIF',
      taxableBase: taxableBase,
      rate: 0.01,
      amount: uifAmount,
      calcTrace: {
        formula: 'min(taxableBase * 0.01, cap)',
        inputs: { taxableBase, rate: 0.01, cap: uifCap },
        source: 'ZA-UIF-2025',
      },
    });

    return taxes;
  }

  private async calculateEmployerContributions(input: PayslipCalculationInput, taxableBase: number): Promise<any[]> {
    const contribs = [];

    switch (input.country) {
      case 'UK':
        // Employer NI
        const niCategory = input.taxInfo?.niCategory || 'A';
        const ni = this.ukTaxService.calculateNationalInsurance({
          annualGross: taxableBase * 12,
          category: niCategory,
        });
        contribs.push({
          code: `ER_NI_${niCategory}`,
          label: 'Employer NI',
          amount: ni.employerNI / 12,
          calcTrace: {
            formula: 'UK Employer NI bands',
            inputs: { taxableBase, category: niCategory },
            source: 'UK-ER-NI-2025',
          },
        });

        // Pension Employer (example 3%)
        contribs.push({
          code: 'PEN_ER',
          label: 'Pension Employer',
          amount: taxableBase * 0.03,
          calcTrace: {
            formula: 'taxableBase * 0.03',
            inputs: { taxableBase, rate: 0.03 },
            source: 'UK-PENSION-ER',
          },
        });
        break;

      case 'US':
        // FUTA (0.6% on first $7,000)
        const futaBase = Math.min(taxableBase * 26, 7000);
        contribs.push({
          code: 'FUTA',
          label: 'Federal Unemployment Tax',
          amount: (futaBase * 0.006) / 26,
          calcTrace: {
            formula: '(min(annualBase, 7000) * 0.006) / periods',
            inputs: { taxableBase, cap: 7000, rate: 0.006 },
            source: 'US-FUTA-2025',
          },
        });

        // Employer SS & Medicare match
        const ssCap = 168600;
        const ssBase = Math.min(taxableBase * 26, ssCap);
        contribs.push({
          code: 'ER_FICA_SS',
          label: 'Employer Social Security',
          amount: (ssBase * 0.062) / 26,
        });
        contribs.push({
          code: 'ER_FICA_MED',
          label: 'Employer Medicare',
          amount: taxableBase * 0.0145,
        });
        break;

      case 'NG':
        // Employer Pension (10% default)
        contribs.push({
          code: 'PEN_ER',
          label: 'Pension Employer',
          amount: taxableBase * 0.10,
        });

        // ITF (1%)
        contribs.push({
          code: 'ITF',
          label: 'Industrial Training Fund',
          amount: taxableBase * 0.01,
        });

        // NSITF (1%)
        contribs.push({
          code: 'NSITF',
          label: 'Nigeria Social Insurance Trust Fund',
          amount: taxableBase * 0.01,
        });
        break;

      case 'ZA':
        // UIF Employer (1% match, capped)
        const uifCap = 177.12;
        contribs.push({
          code: 'UIF_ER',
          label: 'UIF Employer',
          amount: Math.min(taxableBase * 0.01, uifCap),
        });

        // SDL (1%)
        contribs.push({
          code: 'SDL',
          label: 'Skills Development Levy',
          amount: taxableBase * 0.01,
        });
        break;
    }

    return contribs;
  }

  private getPayFrequencyFactor(frequency: string): number {
    switch (frequency) {
      case 'MONTHLY': return 12;
      case 'BIWEEKLY': return 26;
      case 'WEEKLY': return 52;
      default: return 12;
    }
  }

  private generateSignature(payslip: Payslip, earnings: any[], taxes: any[]): string {
    const data = `${payslip.employeeId}|${payslip.periodStart}|${payslip.periodEnd}|${payslip.grossPay}|${payslip.netPay}|${JSON.stringify(earnings)}|${JSON.stringify(taxes)}`;
    return 'sha256:' + crypto.createHash('sha256').update(data).digest('hex');
  }

  private calculateYTD(priorYTD: any, currentPeriod: any): any {
    return {
      gross: (priorYTD?.gross || 0) + currentPeriod.gross,
      tax: (priorYTD?.tax || 0) + currentPeriod.tax,
      preTax: (priorYTD?.preTax || 0) + currentPeriod.preTax,
      postTax: (priorYTD?.postTax || 0) + currentPeriod.postTax,
    };
  }

  async regeneratePayslip(originalPayslipId: string, reason: string): Promise<Payslip> {
    const original = await this.payslipRepository.findOne({ where: { id: originalPayslipId } });
    if (!original) {
      throw new Error('Original payslip not found');
    }

    // Create new version
    const amended = { ...original };
    amended.id = undefined;
    amended.status = PayslipStatus.AMENDED;
    amended.version = original.version + 1;
    amended.supersedesPayslipId = originalPayslipId;
    amended.generatedAt = new Date();

    // Mark original as void
    original.status = PayslipStatus.VOID;
    await this.payslipRepository.save(original);

    return this.payslipRepository.save(amended);
  }
}
