import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { Budget } from '../entities/budget.entity';
import { ExpenseStatus } from '../enums/expense-status.enum';

export interface ForecastResult {
  period: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}

export interface BudgetHealthCheck {
  budgetId: string;
  budgetName: string;
  period: string;
  allocated: number;
  spent: number;
  committed: number; // Pending approvals
  forecasted: number;
  remaining: number;
  utilizationPercentage: number;
  projectedUtilization: number;
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
  daysRemaining: number;
  burnRate: number; // Average daily spend
  recommendedDailySpend: number;
  alerts: string[];
}

export interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  seasonality: boolean;
  peakMonth?: string;
}

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  constructor(
    @InjectRepository(ExpenseClaim)
    private claimRepository: Repository<ExpenseClaim>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  /**
   * Forecast expenses for next N months using historical data
   */
  async forecastExpenses(
    months: number = 3,
    departmentId?: string,
    categoryId?: string,
  ): Promise<ForecastResult[]> {
    // Get historical data (last 12 months)
    const historicalMonths = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historicalMonths);

    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .select('DATE_TRUNC(\'month\', claim.submittedAt)', 'month')
      .addSelect('SUM(claim.totalAmount)', 'total')
      .where('claim.submittedAt >= :startDate', { startDate })
      .andWhere('claim.status IN (:...statuses)', {
        statuses: [ExpenseStatus.APPROVED, ExpenseStatus.PAID],
      })
      .groupBy('DATE_TRUNC(\'month\', claim.submittedAt)')
      .orderBy('month', 'ASC');

    if (departmentId) {
      queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
    }

    const historicalData = await queryBuilder.getRawMany();

    if (historicalData.length < 3) {
      this.logger.warn('Insufficient historical data for forecasting');
      return this.generateSimpleForecast(months);
    }

    // Calculate forecasts using multiple methods
    const forecasts = [];
    const currentDate = new Date();

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      const forecast = this.calculateForecast(historicalData, i);

      forecasts.push({
        period: this.formatPeriod(forecastDate),
        predictedAmount: forecast.amount,
        confidence: forecast.confidence,
        trend: forecast.trend,
        trendPercentage: forecast.trendPercentage,
      });
    }

    return forecasts;
  }

  /**
   * Calculate forecast using multiple algorithms
   */
  private calculateForecast(
    historicalData: any[],
    monthsAhead: number,
  ): {
    amount: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercentage: number;
  } {
    const amounts = historicalData.map(d => Number(d.total));

    // Method 1: Simple Moving Average
    const sma = this.simpleMovingAverage(amounts, 3);

    // Method 2: Weighted Moving Average (recent data has more weight)
    const wma = this.weightedMovingAverage(amounts, 3);

    // Method 3: Exponential Smoothing
    const ema = this.exponentialSmoothing(amounts, 0.3);

    // Method 4: Linear Regression (trend-based)
    const lr = this.linearRegression(amounts, monthsAhead);

    // Combine methods with weights
    const combinedForecast =
      sma * 0.25 + wma * 0.25 + ema * 0.3 + lr.predicted * 0.2;

    // Calculate confidence based on data variance
    const variance = this.calculateVariance(amounts);
    const confidence = Math.max(0, Math.min(100, 100 - variance / 100));

    // Determine trend
    const recentTrend = this.calculateTrend(amounts.slice(-6));

    return {
      amount: Math.round(combinedForecast * 100) / 100,
      confidence: Math.round(confidence),
      trend: recentTrend.direction,
      trendPercentage: recentTrend.percentage,
    };
  }

  /**
   * Simple Moving Average
   */
  private simpleMovingAverage(data: number[], window: number): number {
    const recentData = data.slice(-window);
    const sum = recentData.reduce((acc, val) => acc + val, 0);
    return sum / recentData.length;
  }

  /**
   * Weighted Moving Average (more weight to recent data)
   */
  private weightedMovingAverage(data: number[], window: number): number {
    const recentData = data.slice(-window);
    let weightedSum = 0;
    let weightSum = 0;

    recentData.forEach((value, index) => {
      const weight = index + 1; // More recent = higher weight
      weightedSum += value * weight;
      weightSum += weight;
    });

    return weightedSum / weightSum;
  }

  /**
   * Exponential Smoothing
   */
  private exponentialSmoothing(data: number[], alpha: number): number {
    let smoothed = data[0];

    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }

    return smoothed;
  }

  /**
   * Linear Regression for trend prediction
   */
  private linearRegression(
    data: number[],
    forecastPeriods: number,
  ): { predicted: number; slope: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predicted = slope * (n + forecastPeriods - 1) + intercept;

    return {
      predicted: Math.max(0, predicted),
      slope,
    };
  }

  /**
   * Calculate variance for confidence scoring
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
    return Math.sqrt(variance); // Standard deviation
  }

  /**
   * Calculate trend direction and percentage
   */
  private calculateTrend(data: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
  } {
    if (data.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(percentageChange) < 5) {
      direction = 'stable';
    } else if (percentageChange > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      direction,
      percentage: Math.round(Math.abs(percentageChange) * 10) / 10,
    };
  }

  /**
   * Generate simple forecast when insufficient data
   */
  private generateSimpleForecast(months: number): ForecastResult[] {
    const forecasts: ForecastResult[] = [];
    const currentDate = new Date();

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      forecasts.push({
        period: this.formatPeriod(forecastDate),
        predictedAmount: 0,
        confidence: 0,
        trend: 'stable',
        trendPercentage: 0,
      });
    }

    return forecasts;
  }

  /**
   * Check budget health and provide alerts
   */
  async checkBudgetHealth(budgetId?: string): Promise<BudgetHealthCheck[]> {
    const queryBuilder = this.budgetRepository.createQueryBuilder('budget');

    if (budgetId) {
      queryBuilder.where('budget.id = :budgetId', { budgetId });
    } else {
      queryBuilder.where('budget.isActive = :isActive', { isActive: true });
    }

    const budgets = await queryBuilder.getMany();

    const healthChecks: BudgetHealthCheck[] = [];

    for (const budget of budgets) {
      const health = await this.analyzeBudgetHealth(budget);
      healthChecks.push(health);
    }

    return healthChecks;
  }

  /**
   * Analyze individual budget health
   */
  private async analyzeBudgetHealth(budget: Budget): Promise<BudgetHealthCheck> {
    const now = new Date();
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    // Calculate spent amount (approved + paid)
    const spentResult = await this.claimRepository
      .createQueryBuilder('claim')
      .select('SUM(claim.totalAmount)', 'total')
      .where('claim.departmentId = :departmentId', { departmentId: budget.departmentId })
      .andWhere('claim.submittedAt BETWEEN :startDate AND :endDate', {
        startDate: budget.startDate,
        endDate: budget.endDate,
      })
      .andWhere('claim.status IN (:...statuses)', {
        statuses: [ExpenseStatus.APPROVED, ExpenseStatus.PAID],
      })
      .getRawOne();

    const spent = Number(spentResult?.total || 0);

    // Calculate committed amount (pending approval)
    const committedResult = await this.claimRepository
      .createQueryBuilder('claim')
      .select('SUM(claim.totalAmount)', 'total')
      .where('claim.departmentId = :departmentId', { departmentId: budget.departmentId })
      .andWhere('claim.submittedAt BETWEEN :startDate AND :endDate', {
        startDate: budget.startDate,
        endDate: budget.endDate,
      })
      .andWhere('claim.status IN (:...statuses)', {
        statuses: [ExpenseStatus.SUBMITTED, ExpenseStatus.PENDING_APPROVAL],
      })
      .getRawOne();

    const committed = Number(committedResult?.total || 0);

    // Calculate days remaining
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    // Calculate days elapsed
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDays - daysRemaining;

    // Calculate burn rate (average daily spend)
    const burnRate = daysElapsed > 0 ? spent / daysElapsed : 0;

    // Forecast remaining spend
    const forecasted = burnRate * daysRemaining;

    // Calculate metrics
    const allocated = Number(budget.amount);
    const remaining = allocated - spent - committed;
    const utilizationPercentage = (spent / allocated) * 100;
    const projectedUtilization = ((spent + committed + forecasted) / allocated) * 100;
    const recommendedDailySpend = daysRemaining > 0 ? remaining / daysRemaining : 0;

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' | 'exceeded';
    if (utilizationPercentage >= 100) {
      status = 'exceeded';
    } else if (projectedUtilization >= 100) {
      status = 'critical';
    } else if (utilizationPercentage >= 75) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    // Generate alerts
    const alerts: string[] = [];

    if (status === 'exceeded') {
      alerts.push(`Budget exceeded by ${((spent - allocated) / allocated * 100).toFixed(1)}%`);
    }

    if (projectedUtilization >= 100 && status !== 'exceeded') {
      alerts.push(`Projected to exceed budget by ${(projectedUtilization - 100).toFixed(1)}%`);
    }

    if (utilizationPercentage >= 90) {
      alerts.push(`Budget ${utilizationPercentage.toFixed(1)}% utilized`);
    }

    if (committed > remaining * 0.5) {
      alerts.push(`High pending commitments: ${committed.toFixed(2)}`);
    }

    if (burnRate > recommendedDailySpend * 1.5 && daysRemaining > 7) {
      alerts.push(`Spending ${((burnRate / recommendedDailySpend - 1) * 100).toFixed(0)}% faster than recommended`);
    }

    return {
      budgetId: budget.id,
      budgetName: budget.name || `Budget ${budget.id}`,
      period: `${this.formatPeriod(startDate)} - ${this.formatPeriod(endDate)}`,
      allocated,
      spent,
      committed,
      forecasted: Math.round(forecasted * 100) / 100,
      remaining,
      utilizationPercentage: Math.round(utilizationPercentage * 10) / 10,
      projectedUtilization: Math.round(projectedUtilization * 10) / 10,
      status,
      daysRemaining,
      burnRate: Math.round(burnRate * 100) / 100,
      recommendedDailySpend: Math.round(recommendedDailySpend * 100) / 100,
      alerts,
    };
  }

  /**
   * Analyze spending patterns by category
   */
  async analyzeSpendingPatterns(
    departmentId?: string,
    months: number = 12,
  ): Promise<SpendingPattern[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const queryBuilder = this.claimRepository
      .createQueryBuilder('claim')
      .leftJoin('claim.items', 'item')
      .leftJoin('item.category', 'category')
      .select('category.name', 'category')
      .addSelect('AVG(item.amount)', 'averageAmount')
      .addSelect('COUNT(item.id)', 'frequency')
      .where('claim.submittedAt >= :startDate', { startDate })
      .andWhere('claim.status IN (:...statuses)', {
        statuses: [ExpenseStatus.APPROVED, ExpenseStatus.PAID],
      })
      .groupBy('category.name');

    if (departmentId) {
      queryBuilder.andWhere('claim.departmentId = :departmentId', { departmentId });
    }

    const patterns = await queryBuilder.getRawMany();

    return patterns.map(pattern => ({
      category: pattern.category || 'Uncategorized',
      averageAmount: Math.round(Number(pattern.averageAmount) * 100) / 100,
      frequency: Number(pattern.frequency),
      trend: 'stable' as const, // Would require more complex analysis
      seasonality: false, // Would require year-over-year comparison
    }));
  }

  /**
   * Format date as period string
   */
  private formatPeriod(date: Date): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}
