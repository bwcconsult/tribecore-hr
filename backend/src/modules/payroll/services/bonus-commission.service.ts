import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum BonusType {
  PERFORMANCE = 'PERFORMANCE',
  YEAR_END = 'YEAR_END',
  SIGNING = 'SIGNING',
  RETENTION = 'RETENTION',
  REFERRAL = 'REFERRAL',
  PROJECT_COMPLETION = 'PROJECT_COMPLETION',
  SALES_COMMISSION = 'SALES_COMMISSION',
  DISCRETIONARY = 'DISCRETIONARY',
}

export enum CalculationMethod {
  PERCENTAGE_OF_SALARY = 'PERCENTAGE_OF_SALARY',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  TARGET_BASED = 'TARGET_BASED',
  TIERED_COMMISSION = 'TIERED_COMMISSION',
  PROFIT_SHARING = 'PROFIT_SHARING',
}

export interface BonusRule {
  type: BonusType;
  calculationMethod: CalculationMethod;
  value: number; // Percentage or fixed amount
  minServiceMonths?: number;
  targetAmount?: number; // For target-based bonuses
  achievedAmount?: number; // Actual achievement
  tiers?: Array<{
    from: number;
    to: number;
    rate: number; // Percentage
  }>;
  taxable: boolean;
  payableMonth?: number;
}

export interface BonusCalculation {
  employeeId: string;
  employeeName: string;
  bonusType: BonusType;
  baseSalary: number;
  calculation: {
    grossBonus: number;
    taxableAmount: number;
    tax: number;
    netBonus: number;
    breakdown: string;
  };
  eligible: boolean;
  reason?: string;
}

export interface CommissionCalculation {
  employeeId: string;
  employeeName: string;
  salesAmount: number;
  targetAmount: number;
  achievementRate: number;
  calculation: {
    baseCommission: number;
    bonusCommission: number; // For over-achievement
    totalCommission: number;
    tax: number;
    netCommission: number;
  };
  tier?: string;
}

@Injectable()
export class BonusCommissionService {
  private readonly logger = new Logger(BonusCommissionService.name);

  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async calculateBonus(
    employeeId: string,
    rule: BonusRule,
  ): Promise<BonusCalculation> {
    this.logger.log(`Calculating bonus for employee ${employeeId}, type: ${rule.type}`);

    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const baseSalary = Number(employee.salary) || 0;

    // Check service months if required
    if (rule.minServiceMonths) {
      const serviceMonths = this.calculateServiceMonths(employee);
      if (serviceMonths < rule.minServiceMonths) {
        return {
          employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          bonusType: rule.type,
          baseSalary,
          calculation: {
            grossBonus: 0,
            taxableAmount: 0,
            tax: 0,
            netBonus: 0,
            breakdown: 'Not eligible',
          },
          eligible: false,
          reason: `Minimum service requirement not met (${rule.minServiceMonths} months required, ${serviceMonths} completed)`,
        };
      }
    }

    let grossBonus = 0;
    let breakdown = '';

    switch (rule.calculationMethod) {
      case CalculationMethod.FIXED_AMOUNT:
        grossBonus = rule.value;
        breakdown = `Fixed amount: ${rule.value}`;
        break;

      case CalculationMethod.PERCENTAGE_OF_SALARY:
        grossBonus = baseSalary * (rule.value / 100);
        breakdown = `${rule.value}% of monthly salary (${baseSalary})`;
        break;

      case CalculationMethod.TARGET_BASED:
        if (!rule.targetAmount || !rule.achievedAmount) {
          throw new Error('Target amount and achieved amount required for target-based bonus');
        }
        const achievementRate = (rule.achievedAmount / rule.targetAmount) * 100;
        if (achievementRate >= 100) {
          grossBonus = baseSalary * (rule.value / 100);
          const overAchievement = achievementRate - 100;
          const bonusMultiplier = 1 + overAchievement / 100;
          grossBonus *= bonusMultiplier;
          breakdown = `Target achieved: ${achievementRate.toFixed(1)}%, Bonus: ${rule.value}% × ${bonusMultiplier.toFixed(2)}`;
        } else {
          grossBonus = (baseSalary * (rule.value / 100) * achievementRate) / 100;
          breakdown = `Target achieved: ${achievementRate.toFixed(1)}%, Prorated bonus`;
        }
        break;

      case CalculationMethod.TIERED_COMMISSION:
        if (!rule.tiers || !rule.achievedAmount) {
          throw new Error('Tiers and achieved amount required for tiered commission');
        }
        grossBonus = this.calculateTieredCommission(rule.achievedAmount, rule.tiers);
        breakdown = `Tiered commission on ${rule.achievedAmount}`;
        break;

      case CalculationMethod.PROFIT_SHARING:
        // Profit sharing based on company performance
        grossBonus = rule.value; // This would come from company profit calculation
        breakdown = `Profit sharing: ${rule.value}`;
        break;
    }

    const taxableAmount = rule.taxable ? grossBonus : 0;
    const tax = this.calculateBonusTax(taxableAmount);
    const netBonus = grossBonus - tax;

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      bonusType: rule.type,
      baseSalary,
      calculation: {
        grossBonus: Math.round(grossBonus * 100) / 100,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        netBonus: Math.round(netBonus * 100) / 100,
        breakdown,
      },
      eligible: true,
    };
  }

  async calculateCommission(
    employeeId: string,
    salesAmount: number,
    targetAmount: number,
    commissionRate: number,
    tiers?: Array<{ from: number; to: number; rate: number }>,
  ): Promise<CommissionCalculation> {
    this.logger.log(`Calculating commission for employee ${employeeId}`);

    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const achievementRate = (salesAmount / targetAmount) * 100;

    let baseCommission = 0;
    let bonusCommission = 0;
    let tier = 'Base';

    if (tiers && tiers.length > 0) {
      baseCommission = this.calculateTieredCommission(salesAmount, tiers);
      tier = this.determineTier(salesAmount, tiers);
    } else {
      baseCommission = salesAmount * (commissionRate / 100);
    }

    // Bonus commission for over-achievement
    if (achievementRate > 100) {
      const overAchievement = salesAmount - targetAmount;
      bonusCommission = overAchievement * (commissionRate / 100) * 1.5; // 1.5x for over-achievement
    }

    const totalCommission = baseCommission + bonusCommission;
    const tax = this.calculateBonusTax(totalCommission);
    const netCommission = totalCommission - tax;

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      salesAmount,
      targetAmount,
      achievementRate: Math.round(achievementRate * 100) / 100,
      calculation: {
        baseCommission: Math.round(baseCommission * 100) / 100,
        bonusCommission: Math.round(bonusCommission * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        netCommission: Math.round(netCommission * 100) / 100,
      },
      tier,
    };
  }

  async bulkCalculateBonuses(
    organizationId: string,
    rule: BonusRule,
    employeeIds?: string[],
  ): Promise<BonusCalculation[]> {
    this.logger.log(`Bulk calculating bonuses for organization ${organizationId}`);

    let employees: Employee[];

    if (employeeIds && employeeIds.length > 0) {
      employees = await this.employeeRepository.findByIds(employeeIds);
    } else {
      employees = await this.employeeRepository.find({
        where: { organizationId },
      });
    }

    const calculations: BonusCalculation[] = [];

    for (const employee of employees) {
      try {
        const calculation = await this.calculateBonus(employee.id, rule);
        calculations.push(calculation);
      } catch (error) {
        this.logger.error(`Error calculating bonus for employee ${employee.id}:`, error);
        calculations.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          bonusType: rule.type,
          baseSalary: Number(employee.salary) || 0,
          calculation: {
            grossBonus: 0,
            taxableAmount: 0,
            tax: 0,
            netBonus: 0,
            breakdown: 'Calculation error',
          },
          eligible: false,
          reason: error.message,
        });
      }
    }

    return calculations;
  }

  private calculateTieredCommission(
    amount: number,
    tiers: Array<{ from: number; to: number; rate: number }>,
  ): number {
    let commission = 0;

    for (const tier of tiers) {
      if (amount <= tier.from) break;

      const applicableAmount = Math.min(amount, tier.to) - tier.from;
      commission += applicableAmount * (tier.rate / 100);
    }

    return commission;
  }

  private determineTier(
    amount: number,
    tiers: Array<{ from: number; to: number; rate: number }>,
  ): string {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (amount >= tiers[i].from) {
        return `Tier ${i + 1} (${tiers[i].rate}%)`;
      }
    }
    return 'Base Tier';
  }

  private calculateServiceMonths(employee: Employee): number {
    if (!employee.hireDate) return 0;

    const hireDate = new Date(employee.hireDate);
    const now = new Date();

    const months =
      (now.getFullYear() - hireDate.getFullYear()) * 12 +
      now.getMonth() -
      hireDate.getMonth();

    return Math.max(0, months);
  }

  private calculateBonusTax(amount: number): number {
    // Bonus tax calculation (often higher rate)
    // Simplified - use actual tax engine
    if (amount <= 1000) return amount * 0.20;
    if (amount <= 5000) return amount * 0.25;
    if (amount <= 10000) return amount * 0.30;
    return amount * 0.35;
  }

  // Preset bonus rules
  getYearEndBonusRule(percentage: number = 100): BonusRule {
    return {
      type: BonusType.YEAR_END,
      calculationMethod: CalculationMethod.PERCENTAGE_OF_SALARY,
      value: percentage,
      minServiceMonths: 6,
      taxable: true,
      payableMonth: 12,
    };
  }

  getPerformanceBonusRule(
    targetAchievement: number,
    actualAchievement: number,
    bonusPercentage: number = 20,
  ): BonusRule {
    return {
      type: BonusType.PERFORMANCE,
      calculationMethod: CalculationMethod.TARGET_BASED,
      value: bonusPercentage,
      targetAmount: targetAchievement,
      achievedAmount: actualAchievement,
      taxable: true,
    };
  }

  getSalesCommissionRule(
    salesAmount: number,
  ): BonusRule {
    return {
      type: BonusType.SALES_COMMISSION,
      calculationMethod: CalculationMethod.TIERED_COMMISSION,
      value: 0,
      achievedAmount: salesAmount,
      tiers: [
        { from: 0, to: 50000, rate: 2 },
        { from: 50000, to: 100000, rate: 3 },
        { from: 100000, to: 250000, rate: 5 },
        { from: 250000, to: Infinity, rate: 7 },
      ],
      taxable: true,
    };
  }
}
