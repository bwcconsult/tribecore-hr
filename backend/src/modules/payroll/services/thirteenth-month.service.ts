import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Payroll } from '../entities/payroll.entity';

export interface ThirteenthMonthConfig {
  country: string;
  enabled: boolean;
  paymentMonth: number; // 1-12
  calculationMethod: 'FULL_SALARY' | 'PRORATED' | 'AVERAGE_12_MONTHS';
  minimumServiceMonths: number;
  taxable: boolean;
  includesBonuses: boolean;
}

export interface ThirteenthMonthCalculation {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  serviceMonths: number;
  calculation: {
    fullAmount: number;
    proratedAmount: number;
    taxableAmount: number;
    tax: number;
    netAmount: number;
  };
  eligible: boolean;
  reason?: string;
}

const COUNTRY_CONFIGS: Record<string, ThirteenthMonthConfig> = {
  PH: { // Philippines
    country: 'Philippines',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'PRORATED',
    minimumServiceMonths: 1,
    taxable: false,
    includesBonuses: false,
  },
  MX: { // Mexico
    country: 'Mexico',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'FULL_SALARY',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
  BR: { // Brazil
    country: 'Brazil',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'AVERAGE_12_MONTHS',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: true,
  },
  AR: { // Argentina
    country: 'Argentina',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'FULL_SALARY',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
  CL: { // Chile
    country: 'Chile',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'PRORATED',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
  PE: { // Peru
    country: 'Peru',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'PRORATED',
    minimumServiceMonths: 1,
    taxable: true,
    includesBonuses: false,
  },
  IT: { // Italy (14th month also)
    country: 'Italy',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'FULL_SALARY',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
  ES: { // Spain
    country: 'Spain',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'FULL_SALARY',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
  PT: { // Portugal
    country: 'Portugal',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'FULL_SALARY',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
  GR: { // Greece (14th month also)
    country: 'Greece',
    enabled: true,
    paymentMonth: 12,
    calculationMethod: 'FULL_SALARY',
    minimumServiceMonths: 0,
    taxable: true,
    includesBonuses: false,
  },
};

@Injectable()
export class ThirteenthMonthService {
  private readonly logger = new Logger(ThirteenthMonthService.name);

  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async calculateThirteenthMonth(
    organizationId: string,
    year: number,
  ): Promise<ThirteenthMonthCalculation[]> {
    this.logger.log(`Calculating 13th month salary for organization ${organizationId}, year ${year}`);

    const employees = await this.employeeRepository.find({
      where: { organizationId },
    });

    const calculations: ThirteenthMonthCalculation[] = [];

    for (const employee of employees) {
      const calculation = await this.calculateForEmployee(employee, year);
      calculations.push(calculation);
    }

    return calculations;
  }

  async calculateForEmployee(
    employee: Employee,
    year: number,
  ): Promise<ThirteenthMonthCalculation> {
    const countryCode = this.extractCountryCode(employee.country);
    const config = COUNTRY_CONFIGS[countryCode];

    if (!config || !config.enabled) {
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        baseSalary: Number(employee.salary) || 0,
        serviceMonths: 0,
        calculation: {
          fullAmount: 0,
          proratedAmount: 0,
          taxableAmount: 0,
          tax: 0,
          netAmount: 0,
        },
        eligible: false,
        reason: `13th month salary not applicable in ${employee.country}`,
      };
    }

    // Calculate service months in the year
    const serviceMonths = await this.calculateServiceMonths(employee, year);

    if (serviceMonths < config.minimumServiceMonths) {
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        baseSalary: Number(employee.salary) || 0,
        serviceMonths,
        calculation: {
          fullAmount: 0,
          proratedAmount: 0,
          taxableAmount: 0,
          tax: 0,
          netAmount: 0,
        },
        eligible: false,
        reason: `Minimum service requirement not met (${config.minimumServiceMonths} months required)`,
      };
    }

    // Calculate amounts based on method
    let fullAmount = 0;
    let proratedAmount = 0;

    switch (config.calculationMethod) {
      case 'FULL_SALARY':
        fullAmount = Number(employee.salary) || 0;
        proratedAmount = fullAmount;
        break;

      case 'PRORATED':
        fullAmount = Number(employee.salary) || 0;
        proratedAmount = (fullAmount / 12) * serviceMonths;
        break;

      case 'AVERAGE_12_MONTHS':
        fullAmount = await this.calculate12MonthAverage(employee.id, year);
        proratedAmount = (fullAmount / 12) * serviceMonths;
        break;
    }

    // Calculate tax
    const taxableAmount = config.taxable ? proratedAmount : 0;
    const tax = this.calculateTax(taxableAmount, employee.taxCode);
    const netAmount = proratedAmount - tax;

    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      baseSalary: Number(employee.salary) || 0,
      serviceMonths,
      calculation: {
        fullAmount,
        proratedAmount,
        taxableAmount,
        tax,
        netAmount,
      },
      eligible: true,
    };
  }

  async calculateFourteenthMonth(
    organizationId: string,
    year: number,
  ): Promise<ThirteenthMonthCalculation[]> {
    this.logger.log(`Calculating 14th month salary for organization ${organizationId}, year ${year}`);

    const employees = await this.employeeRepository.find({
      where: { organizationId },
    });

    const calculations: ThirteenthMonthCalculation[] = [];

    for (const employee of employees) {
      const countryCode = this.extractCountryCode(employee.country);

      // Only Italy and Greece have 14th month
      if (!['IT', 'GR'].includes(countryCode)) {
        continue;
      }

      const calculation = await this.calculateForEmployee(employee, year);
      // 14th month typically paid in June/July
      calculations.push({
        ...calculation,
        calculation: {
          ...calculation.calculation,
          // 14th month is usually same as 13th month
        },
      });
    }

    return calculations;
  }

  private async calculateServiceMonths(employee: Employee, year: number): Promise<number> {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    let startDate = employee.hireDate || yearStart;
    if (startDate < yearStart) {
      startDate = yearStart;
    }

    let endDate = employee.terminationDate || yearEnd;
    if (endDate > yearEnd) {
      endDate = yearEnd;
    }

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth() +
      1;

    return Math.max(0, months);
  }

  private async calculate12MonthAverage(employeeId: string, year: number): Promise<number> {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const payrolls = await this.payrollRepository
      .createQueryBuilder('payroll')
      .where('payroll.employeeId = :employeeId', { employeeId })
      .andWhere('payroll.payDate >= :startDate', { startDate: yearStart })
      .andWhere('payroll.payDate <= :endDate', { endDate: yearEnd })
      .getMany();

    if (payrolls.length === 0) {
      const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
      return Number(employee?.salary) || 0;
    }

    const totalGross = payrolls.reduce((sum, p) => sum + Number(p.grossPay), 0);
    return totalGross / payrolls.length;
  }

  private extractCountryCode(country?: string): string {
    if (!country) return 'XX';
    // Extract country code (e.g., "Philippines" -> "PH", "Nigeria" -> "NG")
    const countryMap: Record<string, string> = {
      philippines: 'PH',
      mexico: 'MX',
      brazil: 'BR',
      argentina: 'AR',
      chile: 'CL',
      peru: 'PE',
      italy: 'IT',
      spain: 'ES',
      portugal: 'PT',
      greece: 'GR',
    };

    return countryMap[country.toLowerCase()] || country.substring(0, 2).toUpperCase();
  }

  private calculateTax(amount: number, taxCode?: string): number {
    // Simplified tax calculation - use actual tax engine
    if (amount <= 1000) return 0;
    if (amount <= 5000) return amount * 0.15;
    if (amount <= 10000) return amount * 0.20;
    return amount * 0.25;
  }

  getCountryConfig(countryCode: string): ThirteenthMonthConfig | null {
    return COUNTRY_CONFIGS[countryCode] || null;
  }

  getAllSupportedCountries(): ThirteenthMonthConfig[] {
    return Object.values(COUNTRY_CONFIGS);
  }
}
