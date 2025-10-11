import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { ForecastService } from '../services/forecast.service';

@ApiTags('Budget Forecasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses/forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  @Get('expenses')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Forecast future expenses using ML algorithms' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months to forecast (default: 3)' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Expense forecasts with confidence scores' })
  async forecastExpenses(
    @Query('months') months?: string,
    @Query('departmentId') departmentId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const monthsToForecast = months ? parseInt(months, 10) : 3;

    const forecasts = await this.forecastService.forecastExpenses(
      monthsToForecast,
      departmentId,
      categoryId,
    );

    return {
      forecasts,
      metadata: {
        forecastPeriods: monthsToForecast,
        generatedAt: new Date(),
        algorithms: ['SMA', 'WMA', 'Exponential Smoothing', 'Linear Regression'],
        departmentId: departmentId || 'all',
      },
    };
  }

  @Get('budget-health')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Check budget health and get alerts' })
  @ApiQuery({ name: 'budgetId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Budget health analysis with alerts' })
  async checkBudgetHealth(@Query('budgetId') budgetId?: string) {
    const healthChecks = await this.forecastService.checkBudgetHealth(budgetId);

    // Aggregate statistics
    const summary = {
      totalBudgets: healthChecks.length,
      healthy: healthChecks.filter(h => h.status === 'healthy').length,
      warning: healthChecks.filter(h => h.status === 'warning').length,
      critical: healthChecks.filter(h => h.status === 'critical').length,
      exceeded: healthChecks.filter(h => h.status === 'exceeded').length,
      totalAlerts: healthChecks.reduce((sum, h) => sum + h.alerts.length, 0),
    };

    return {
      summary,
      budgets: healthChecks,
      generatedAt: new Date(),
    };
  }

  @Get('spending-patterns')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Analyze spending patterns by category' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Historical months to analyze (default: 12)' })
  @ApiResponse({ status: 200, description: 'Spending pattern analysis' })
  async analyzeSpendingPatterns(
    @Query('departmentId') departmentId?: string,
    @Query('months') months?: string,
  ) {
    const analysisMonths = months ? parseInt(months, 10) : 12;

    const patterns = await this.forecastService.analyzeSpendingPatterns(
      departmentId,
      analysisMonths,
    );

    // Sort by frequency and amount
    const sortedPatterns = patterns.sort((a, b) => {
      const aScore = a.frequency * a.averageAmount;
      const bScore = b.frequency * b.averageAmount;
      return bScore - aScore;
    });

    return {
      patterns: sortedPatterns,
      metadata: {
        analysisMonths,
        totalCategories: patterns.length,
        generatedAt: new Date(),
      },
    };
  }

  @Get('recommendations')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get AI-powered spending recommendations' })
  @ApiResponse({ status: 200, description: 'Spending recommendations' })
  async getRecommendations() {
    const healthChecks = await this.forecastService.checkBudgetHealth();
    const patterns = await this.forecastService.analyzeSpendingPatterns();

    // Generate recommendations based on analysis
    const recommendations = [];

    // Budget recommendations
    healthChecks.forEach(budget => {
      if (budget.status === 'critical' || budget.status === 'exceeded') {
        recommendations.push({
          type: 'budget_alert',
          severity: 'high',
          budgetId: budget.budgetId,
          message: `${budget.budgetName}: Budget at ${budget.utilizationPercentage}% utilization`,
          action: budget.status === 'exceeded' 
            ? 'Immediate action required - budget exceeded'
            : 'Reduce spending or request budget increase',
          details: {
            allocated: budget.allocated,
            spent: budget.spent,
            remaining: budget.remaining,
          },
        });
      }

      if (budget.burnRate > budget.recommendedDailySpend * 1.5) {
        recommendations.push({
          type: 'spending_rate',
          severity: 'medium',
          budgetId: budget.budgetId,
          message: `${budget.budgetName}: Spending too fast`,
          action: `Reduce daily spending to ${budget.recommendedDailySpend.toFixed(2)} or below`,
          details: {
            currentBurnRate: budget.burnRate,
            recommendedRate: budget.recommendedDailySpend,
            daysRemaining: budget.daysRemaining,
          },
        });
      }
    });

    // Category recommendations
    const topCategories = patterns
      .sort((a, b) => b.averageAmount * b.frequency - a.averageAmount * a.frequency)
      .slice(0, 3);

    topCategories.forEach(category => {
      if (category.averageAmount > 500) {
        recommendations.push({
          type: 'category_optimization',
          severity: 'low',
          category: category.category,
          message: `High spending in ${category.category}`,
          action: 'Review and optimize expenses in this category',
          details: {
            averageAmount: category.averageAmount,
            frequency: category.frequency,
            totalImpact: category.averageAmount * category.frequency,
          },
        });
      }
    });

    return {
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      summary: {
        total: recommendations.length,
        high: recommendations.filter(r => r.severity === 'high').length,
        medium: recommendations.filter(r => r.severity === 'medium').length,
        low: recommendations.filter(r => r.severity === 'low').length,
      },
      generatedAt: new Date(),
    };
  }

  @Get('trends')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get expense trends with predictions' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Expense trends and predictions' })
  async getExpenseTrends(@Query('months') months?: string) {
    const forecastMonths = months ? parseInt(months, 10) : 6;

    const forecasts = await this.forecastService.forecastExpenses(forecastMonths);

    // Analyze overall trend
    const avgConfidence =
      forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;

    const trendDirection = forecasts[forecasts.length - 1]?.trend || 'stable';

    return {
      forecasts,
      analysis: {
        averageConfidence: Math.round(avgConfidence),
        overallTrend: trendDirection,
        totalPredictedSpend: forecasts.reduce((sum, f) => sum + f.predictedAmount, 0),
        reliability:
          avgConfidence >= 80
            ? 'high'
            : avgConfidence >= 60
            ? 'medium'
            : 'low',
      },
      generatedAt: new Date(),
    };
  }
}
