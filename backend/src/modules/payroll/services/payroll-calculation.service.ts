import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';
import { SalaryStructure } from '../entities/salary-structure.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { GlobalTaxCalculatorService } from './global-tax-calculator.service';
import { FxConversionService } from './fx-conversion.service';

export interface PayrollCalculationInput {
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  overrideGrossPay?: number;
  additionalAllowances?: Record<string, number>;
  additionalDeductions?: Record<string, number>;
  bonuses?: number;
  overtime?: number;
  absenceDays?: number;
  unpaidLeaveDays?: number;
}

export interface PayrollCalculationResult {
  employee: Employee;
  salaryStructure: SalaryStructure;
  grossPay: number;
  taxableIncome: number;
  allowances: Record<string, number>;
  totalAllowances: number;
  deductions: {
    incomeTax: number;
    socialSecurity: number;
    pension: number;
    healthInsurance: number;
    loans: number;
    other: Record<string, number>;
  };
  totalDeductions: number;
  employerContributions: {
    pension: number;
    socialSecurity: number;
    healthInsurance: number;
    other: Record<string, number>;
  };
  totalEmployerContributions: number;
  netPay: number;
  currency: string;
  taxBreakdown: any;
  prorations: {
    unpaidLeaveDays: number;
    absenceDays: number;
    proratedAmount: number;
  };
}

@Injectable()
export class PayrollCalculationService {
  private readonly logger = new Logger(PayrollCalculationService.name);

  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(SalaryStructure)
    private salaryStructureRepository: Repository<SalaryStructure>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private globalTaxCalculator: GlobalTaxCalculatorService,
    private fxConversionService: FxConversionService,
  ) {}

  async calculatePayroll(input: PayrollCalculationInput): Promise<PayrollCalculationResult> {
    this.logger.log(`Calculating payroll for employee ${input.employeeId}`);

    // Get employee and salary structure
    const employee = await this.employeeRepository.findOne({
      where: { id: input.employeeId },
    });

    if (!employee) {
      throw new Error(`Employee ${input.employeeId} not found`);
    }

    const salaryStructure = await this.salaryStructureRepository.findOne({
      where: { employeeId: input.employeeId, active: true },
      order: { effectiveDate: 'DESC' },
    });

    if (!salaryStructure) {
      throw new Error(`No active salary structure found for employee ${input.employeeId}`);
    }

    // Calculate base gross pay
    let grossPay = input.overrideGrossPay || this.calculateBasePay(salaryStructure);

    // Add allowances
    const allowances = this.calculateAllowances(salaryStructure, input.additionalAllowances);
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
    grossPay += totalAllowances;

    // Add bonuses and overtime
    if (input.bonuses) grossPay += input.bonuses;
    if (input.overtime) grossPay += input.overtime;

    // Apply proration for unpaid leave/absences
    const prorations = this.calculateProrations(
      grossPay,
      input.unpaidLeaveDays || 0,
      input.absenceDays || 0,
      salaryStructure.payFrequency,
    );
    grossPay -= prorations.proratedAmount;

    // Calculate tax and statutory deductions
    const taxResult = await this.globalTaxCalculator.calculateTax({
      grossPay,
      country: salaryStructure.taxCountry,
      state: salaryStructure.taxState,
      currency: salaryStructure.currency,
      payFrequency: salaryStructure.payFrequency,
      taxCode: salaryStructure.taxCode,
      allowances,
      pensionEmployeePercent: salaryStructure.pensionEmployeePercent,
      pensionEmployerPercent: salaryStructure.pensionEmployerPercent,
      healthInsurancePremium: salaryStructure.healthInsurancePremium,
      taxExempt: salaryStructure.taxExempt,
    });

    // Calculate company deductions (loans, etc.)
    const companyDeductions = this.calculateCompanyDeductions(
      salaryStructure,
      input.additionalDeductions,
    );

    const deductions = {
      incomeTax: taxResult.incomeTax,
      socialSecurity: taxResult.socialSecurity,
      pension: taxResult.pensionEmployee,
      healthInsurance: taxResult.healthInsurance,
      loans: companyDeductions.loans || 0,
      other: companyDeductions.other,
    };

    const totalDeductions = Object.values(deductions).reduce((sum, val) => {
      if (typeof val === 'number') return sum + val;
      if (typeof val === 'object') {
        return sum + Object.values(val).reduce((s, v) => s + v, 0);
      }
      return sum;
    }, 0);

    const employerContributions = {
      pension: taxResult.pensionEmployer,
      socialSecurity: taxResult.totalEmployerContributions - taxResult.pensionEmployer,
      healthInsurance: salaryStructure.healthInsurancePremium || 0,
      other: {},
    };

    const totalEmployerContributions = Object.values(employerContributions).reduce((sum, val) => {
      if (typeof val === 'number') return sum + val;
      return sum;
    }, 0);

    const netPay = grossPay - totalDeductions;

    return {
      employee,
      salaryStructure,
      grossPay,
      taxableIncome: taxResult.taxableIncome,
      allowances,
      totalAllowances,
      deductions,
      totalDeductions,
      employerContributions,
      totalEmployerContributions,
      netPay,
      currency: salaryStructure.currency,
      taxBreakdown: taxResult.breakdown,
      prorations,
    };
  }

  private calculateBasePay(salaryStructure: SalaryStructure): number {
    const { basicSalary, payFrequency } = salaryStructure;

    switch (payFrequency.toUpperCase()) {
      case 'MONTHLY':
        return basicSalary;
      case 'BIWEEKLY':
        return basicSalary / 2;
      case 'WEEKLY':
        return basicSalary / 4;
      case 'DAILY':
        return basicSalary / 22; // Assuming 22 working days
      default:
        return basicSalary;
    }
  }

  private calculateAllowances(
    salaryStructure: SalaryStructure,
    additional?: Record<string, number>,
  ): Record<string, number> {
    const allowances: Record<string, number> = {};

    if (salaryStructure.allowances) {
      if (salaryStructure.allowances.housing) {
        allowances.housing = salaryStructure.allowances.housing.amount;
      }
      if (salaryStructure.allowances.transport) {
        allowances.transport = salaryStructure.allowances.transport.amount;
      }
      if (salaryStructure.allowances.meal) {
        allowances.meal = salaryStructure.allowances.meal.amount;
      }
      if (salaryStructure.allowances.education) {
        allowances.education = salaryStructure.allowances.education.amount;
      }
      if (salaryStructure.allowances.internet) {
        allowances.internet = salaryStructure.allowances.internet.amount;
      }
      if (salaryStructure.allowances.phone) {
        allowances.phone = salaryStructure.allowances.phone.amount;
      }
      if (salaryStructure.allowances.car) {
        allowances.car = salaryStructure.allowances.car.amount;
      }
      if (salaryStructure.allowances.other) {
        salaryStructure.allowances.other.forEach(item => {
          allowances[item.name] = item.amount;
        });
      }
    }

    // Add additional allowances
    if (additional) {
      Object.assign(allowances, additional);
    }

    return allowances;
  }

  private calculateCompanyDeductions(
    salaryStructure: SalaryStructure,
    additional?: Record<string, number>,
  ): { loans: number; other: Record<string, number> } {
    let loans = 0;
    const other: Record<string, number> = {};

    if (salaryStructure.deductions) {
      if (salaryStructure.deductions.loan) loans += salaryStructure.deductions.loan;
      if (salaryStructure.deductions.advance) loans += salaryStructure.deductions.advance;
      if (salaryStructure.deductions.fine) other.fine = salaryStructure.deductions.fine;
      if (salaryStructure.deductions.union) other.union = salaryStructure.deductions.union;
      if (salaryStructure.deductions.equipment) other.equipment = salaryStructure.deductions.equipment;
      
      if (salaryStructure.deductions.other) {
        salaryStructure.deductions.other.forEach(item => {
          other[item.name] = item.amount;
        });
      }
    }

    // Add additional deductions
    if (additional) {
      Object.assign(other, additional);
    }

    return { loans, other };
  }

  private calculateProrations(
    grossPay: number,
    unpaidLeaveDays: number,
    absenceDays: number,
    payFrequency: string,
  ): { unpaidLeaveDays: number; absenceDays: number; proratedAmount: number } {
    let workingDays = 22; // Default monthly working days

    switch (payFrequency.toUpperCase()) {
      case 'MONTHLY':
        workingDays = 22;
        break;
      case 'BIWEEKLY':
        workingDays = 10;
        break;
      case 'WEEKLY':
        workingDays = 5;
        break;
      case 'DAILY':
        workingDays = 1;
        break;
    }

    const dailyRate = grossPay / workingDays;
    const proratedAmount = (unpaidLeaveDays + absenceDays) * dailyRate;

    return {
      unpaidLeaveDays,
      absenceDays,
      proratedAmount,
    };
  }

  async batchCalculate(inputs: PayrollCalculationInput[]): Promise<PayrollCalculationResult[]> {
    this.logger.log(`Batch calculating ${inputs.length} payrolls`);
    
    const results: PayrollCalculationResult[] = [];
    
    for (const input of inputs) {
      try {
        const result = await this.calculatePayroll(input);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to calculate payroll for ${input.employeeId}:`, error.message);
        // Continue with other calculations
      }
    }

    return results;
  }

  async savePayroll(calculation: PayrollCalculationResult, payrollRunId?: string): Promise<Payroll> {
    const payroll = this.payrollRepository.create({
      employeeId: calculation.employee.id,
      organizationId: calculation.employee.organizationId,
      payPeriodStart: new Date(),
      payPeriodEnd: new Date(),
      payDate: new Date(),
      frequency: calculation.salaryStructure.payFrequency as any,
      basicSalary: calculation.salaryStructure.basicSalary,
      allowances: calculation.totalAllowances,
      bonuses: 0,
      overtime: 0,
      grossPay: calculation.grossPay,
      incomeTax: calculation.deductions.incomeTax,
      nationalInsurance: calculation.deductions.socialSecurity,
      pensionContribution: calculation.deductions.pension,
      studentLoan: 0,
      otherDeductions: calculation.deductions.loans,
      totalDeductions: calculation.totalDeductions,
      netPay: calculation.netPay,
      currency: calculation.currency,
      country: calculation.salaryStructure.taxCountry as any,
      taxBreakdown: calculation.taxBreakdown,
      allowancesBreakdown: calculation.allowances,
      deductionsBreakdown: calculation.deductions.other,
    });

    return this.payrollRepository.save(payroll);
  }
}
