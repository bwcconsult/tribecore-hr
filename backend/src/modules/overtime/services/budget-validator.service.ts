import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OvertimeBudget, BudgetPeriod, BudgetStatus } from '../entities/overtime-budget.entity';
import { OvertimeLine } from '../entities/overtime-line.entity';

export interface BudgetCheckResult {
  hasCapacity: boolean;
  budgetId: string;
  remaining: { hours?: number; amount?: number };
  percentUsed: number;
  status: BudgetStatus;
  warnings: string[];
  requiresApproval: boolean;
}

export interface BudgetForecast {
  budgetId: string;
  currentSpend: number;
  projectedSpend: number;
  projectedOverrun: number;
  daysRemaining: number;
  averageDailySpend: number;
  recommendations: string[];
}

/**
 * BudgetValidator
 * Validates overtime against budget caps
 * Provides forecasting and alerts
 */
@Injectable()
export class BudgetValidatorService {
  private readonly logger = new Logger(BudgetValidatorService.name);

  constructor(
    @InjectRepository(OvertimeBudget)
    private budgetRepository: Repository<OvertimeBudget>,
    @InjectRepository(OvertimeLine)
    private overtimeLineRepository: Repository<OvertimeLine>,
  ) {}

  /**
   * Check if overtime is within budget
   */
  async checkBudgetCapacity(
    costCenter: string,
    project: string,
    hours: number,
    amount: number,
    date: Date = new Date(),
  ): Promise<BudgetCheckResult> {
    // Find applicable budget
    const budget = await this.findApplicableBudget(costCenter, project, date);

    if (!budget) {
      this.logger.warn(`No budget found for ${costCenter}/${project}`);
      return {
        hasCapacity: true, // No budget = no restriction
        budgetId: null,
        remaining: { hours: null, amount: null },
        percentUsed: 0,
        status: BudgetStatus.ACTIVE,
        warnings: ['No budget configured for this cost center/project'],
        requiresApproval: false,
      };
    }

    // Update budget calculations
    budget.calculateRemaining();
    budget.checkThresholds();

    // Check capacity
    const hasCapacity = budget.hasCapacity(hours, amount);
    const warnings: string[] = [];
    let requiresApproval = false;

    // Generate warnings based on status
    if (budget.status === BudgetStatus.WARNING) {
      warnings.push(`Budget at ${budget.percentageUsed.toFixed(1)}% capacity`);
    }

    if (budget.status === BudgetStatus.EXCEEDED) {
      warnings.push('Budget exceeded - requires senior approval');
      requiresApproval = true;
    }

    if (budget.isHardCap && !hasCapacity) {
      warnings.push('Hard cap reached - overtime cannot be approved');
    } else if (!hasCapacity) {
      warnings.push('Soft cap reached - approval required to proceed');
      requiresApproval = true;
    }

    // Check for near expiry hours (comp-time related)
    if (budget.remainingHours && budget.remainingHours < 10) {
      warnings.push(`Only ${budget.remainingHours}h remaining in budget`);
    }

    return {
      hasCapacity: hasCapacity || !budget.isHardCap,
      budgetId: budget.id,
      remaining: {
        hours: budget.remainingHours,
        amount: budget.remainingAmount,
      },
      percentUsed: budget.percentageUsed,
      status: budget.status,
      warnings,
      requiresApproval: requiresApproval || budget.requireApprovalForOverBudget,
    };
  }

  /**
   * Find applicable budget for cost center/project/date
   */
  private async findApplicableBudget(
    costCenter: string,
    project: string,
    date: Date,
  ): Promise<OvertimeBudget | null> {
    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.periodStart <= :date', { date })
      .andWhere('budget.periodEnd >= :date', { date })
      .andWhere('budget.status != :status', { status: BudgetStatus.EXPIRED });

    // Try to find project-specific budget first
    if (project) {
      queryBuilder.andWhere('budget.project = :project', { project });
      const projectBudget = await queryBuilder.getOne();
      if (projectBudget) return projectBudget;
    }

    // Fall back to cost center budget
    if (costCenter) {
      const ccQuery = this.budgetRepository
        .createQueryBuilder('budget')
        .where('budget.periodStart <= :date', { date })
        .andWhere('budget.periodEnd >= :date', { date })
        .andWhere('budget.costCenter = :costCenter', { costCenter })
        .andWhere('budget.status != :status', { status: BudgetStatus.EXPIRED });

      return ccQuery.getOne();
    }

    return null;
  }

  /**
   * Record overtime spending against budget
   */
  async recordSpending(
    budgetId: string,
    overtimeLineId: string,
    hours: number,
    amount: number,
    employeeId: string,
  ): Promise<void> {
    const budget = await this.budgetRepository.findOne({ where: { id: budgetId } });
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    budget.addSpend(hours, amount, overtimeLineId, employeeId);
    await this.budgetRepository.save(budget);

    this.logger.log(`Recorded ${hours}h / $${amount} against budget ${budgetId}`);
  }

  /**
   * Generate forecast for budget
   */
  async generateForecast(budgetId: string): Promise<BudgetForecast> {
    const budget = await this.budgetRepository.findOne({ where: { id: budgetId } });
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    // Get historical spending data
    const historicalData = budget.transactions
      .filter(t => t.type === 'SPEND')
      .map(t => ({
        date: new Date(t.timestamp),
        amount: t.amount,
      }));

    // Generate forecast
    budget.generateForecast(historicalData);

    const daysRemaining = Math.ceil(
      (budget.periodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    const averageDailySpend = historicalData.length > 0
      ? historicalData.reduce((sum, d) => sum + d.amount, 0) / historicalData.length
      : 0;

    // Generate recommendations
    const recommendations: string[] = [];

    if (budget.forecastedOverrun > 20) {
      recommendations.push(`Projected to exceed budget by ${budget.forecastedOverrun.toFixed(1)}%`);
      recommendations.push('Consider limiting overtime approvals');
      recommendations.push('Review staffing levels and scheduling');
    } else if (budget.forecastedOverrun > 10) {
      recommendations.push(`Projected to exceed budget by ${budget.forecastedOverrun.toFixed(1)}%`);
      recommendations.push('Monitor closely and limit non-essential overtime');
    } else if (budget.forecastedOverrun > 0) {
      recommendations.push('On track to slightly exceed budget');
      recommendations.push('Consider reallocating from underspent budgets');
    } else {
      recommendations.push('Budget tracking within acceptable range');
    }

    if (averageDailySpend > (budget.capAmount / 30)) {
      recommendations.push('Daily spend rate higher than average - review patterns');
    }

    return {
      budgetId: budget.id,
      currentSpend: budget.spentAmount,
      projectedSpend: budget.forecastedSpend,
      projectedOverrun: budget.forecastedOverrun,
      daysRemaining,
      averageDailySpend,
      recommendations,
    };
  }

  /**
   * Get budget burn rate (% per day)
   */
  async getBurnRate(budgetId: string): Promise<{
    dailyBurnRate: number;
    weeklyBurnRate: number;
    projectedDepletionDate: Date | null;
  }> {
    const budget = await this.budgetRepository.findOne({ where: { id: budgetId } });
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    const daysSinceStart = Math.ceil(
      (new Date().getTime() - budget.periodStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    const dailyBurnRate = daysSinceStart > 0
      ? (budget.spentAmount / budget.capAmount) * 100 / daysSinceStart
      : 0;

    const weeklyBurnRate = dailyBurnRate * 7;

    // Project depletion date
    let projectedDepletionDate: Date | null = null;
    if (dailyBurnRate > 0 && budget.remainingAmount > 0) {
      const daysToDepletion = budget.remainingAmount / (budget.spentAmount / daysSinceStart);
      projectedDepletionDate = new Date();
      projectedDepletionDate.setDate(projectedDepletionDate.getDate() + daysToDepletion);
    }

    return {
      dailyBurnRate,
      weeklyBurnRate,
      projectedDepletionDate,
    };
  }

  /**
   * Compare budgets (for reporting)
   */
  async compareBudgets(
    period: BudgetPeriod,
    startDate: Date,
  ): Promise<Array<{
    budgetId: string;
    name: string;
    costCenter: string;
    percentUsed: number;
    status: BudgetStatus;
    variance: number; // Over/under budget
  }>> {
    const budgets = await this.budgetRepository.find({
      where: {
        period,
        periodStart: startDate,
      },
    });

    return budgets.map(budget => {
      budget.calculateRemaining();
      const variance = budget.capAmount
        ? ((budget.spentAmount - budget.capAmount) / budget.capAmount) * 100
        : 0;

      return {
        budgetId: budget.id,
        name: budget.name,
        costCenter: budget.costCenter,
        percentUsed: budget.percentageUsed,
        status: budget.status,
        variance,
      };
    });
  }

  /**
   * Get budgets needing attention (warnings/exceeded)
   */
  async getBudgetsNeedingAttention(): Promise<OvertimeBudget[]> {
    return this.budgetRepository.find({
      where: [
        { status: BudgetStatus.WARNING },
        { status: BudgetStatus.EXCEEDED },
        { status: BudgetStatus.DEPLETED },
      ],
      order: { percentageUsed: 'DESC' },
    });
  }

  /**
   * Reallocate budget between cost centers
   */
  async reallocateBudget(
    fromBudgetId: string,
    toBudgetId: string,
    amount: number,
    approvedBy: string,
    reason: string,
  ): Promise<void> {
    const fromBudget = await this.budgetRepository.findOne({ where: { id: fromBudgetId } });
    const toBudget = await this.budgetRepository.findOne({ where: { id: toBudgetId } });

    if (!fromBudget || !toBudget) {
      throw new Error('Budget not found');
    }

    if (!fromBudget.allowReallocation || !toBudget.allowReallocation) {
      throw new Error('Budget does not allow reallocation');
    }

    if (fromBudget.remainingAmount < amount) {
      throw new Error('Insufficient budget to reallocate');
    }

    // Record reallocation
    const reallocation = {
      fromBudgetId,
      toBudgetId,
      amount,
      date: new Date(),
      approvedBy,
      reason,
    };

    fromBudget.reallocations = fromBudget.reallocations || [];
    fromBudget.reallocations.push(reallocation);
    fromBudget.capAmount -= amount;

    toBudget.reallocations = toBudget.reallocations || [];
    toBudget.reallocations.push(reallocation);
    toBudget.capAmount += amount;

    await this.budgetRepository.save([fromBudget, toBudget]);

    this.logger.log(`Reallocated $${amount} from ${fromBudgetId} to ${toBudgetId}`);
  }

  /**
   * Create budget alerts
   */
  async processAlerts(): Promise<void> {
    const budgets = await this.budgetRepository.find({
      where: { status: BudgetStatus.ACTIVE },
    });

    for (const budget of budgets) {
      budget.checkThresholds();
      
      // Check for new alerts
      const unacknowledgedAlerts = budget.alerts?.filter(a => !a.acknowledged) || [];
      
      if (unacknowledgedAlerts.length > 0) {
        this.logger.warn(
          `Budget ${budget.id} (${budget.name}) has ${unacknowledgedAlerts.length} unacknowledged alerts`,
        );
        
        // Here you would trigger notifications (email, SMS, etc.)
        // For now, just log
        for (const alert of unacknowledgedAlerts) {
          this.logger.warn(`  - ${alert.type}: ${alert.message}`);
        }
      }

      await this.budgetRepository.save(budget);
    }
  }

  /**
   * Expire old budgets
   */
  async expireBudgets(): Promise<number> {
    const now = new Date();
    
    const expiredBudgets = await this.budgetRepository
      .createQueryBuilder()
      .update(OvertimeBudget)
      .set({ status: BudgetStatus.EXPIRED })
      .where('periodEnd < :now', { now })
      .andWhere('status != :status', { status: BudgetStatus.EXPIRED })
      .execute();

    this.logger.log(`Expired ${expiredBudgets.affected} budgets`);
    return expiredBudgets.affected;
  }
}
