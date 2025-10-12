import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';

export interface ForecastResult {
  nextMonthPrediction: {
    grossPay: number;
    netPay: number;
    totalTax: number;
    totalDeductions: number;
    employerContributions: number;
    confidence: number;
  };
  quarterlyForecast: Array<{
    month: string;
    predictedCost: number;
    taxLiability: number;
    cashflowImpact: number;
  }>;
  trends: {
    growthRate: number;
    avgMonthlyIncrease: number;
    volatility: number;
  };
  recommendations: string[];
}

export interface AnomalyDetection {
  anomalies: Array<{
    employeeId: string;
    employeeName: string;
    type: 'SALARY_SPIKE' | 'MISSING_DEDUCTION' | 'UNUSUAL_HOURS' | 'TAX_ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    currentValue: number;
    expectedValue: number;
    deviation: number;
  }>;
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

@Injectable()
export class AiForecastingService {
  private readonly logger = new Logger(AiForecastingService.name);

  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async forecastPayroll(organizationId: string): Promise<ForecastResult> {
    this.logger.log(`Forecasting payroll for organization ${organizationId}`);

    // Get last 12 months of payroll data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const historicalData = await this.payrollRepository
      .createQueryBuilder('payroll')
      .where('payroll.organizationId = :organizationId', { organizationId })
      .andWhere('payroll.payDate >= :startDate', { startDate: twelveMonthsAgo })
      .orderBy('payroll.payDate', 'ASC')
      .getMany();

    if (historicalData.length < 3) {
      throw new Error('Insufficient historical data for forecasting (minimum 3 months required)');
    }

    // Calculate monthly aggregates
    const monthlyTotals = this.aggregateByMonth(historicalData);

    // Simple linear regression for prediction
    const prediction = this.linearRegression(monthlyTotals);

    // Calculate trends
    const trends = this.calculateTrends(monthlyTotals);

    // Generate quarterly forecast
    const quarterlyForecast = this.generateQuarterlyForecast(prediction, trends);

    // Generate recommendations
    const recommendations = this.generateRecommendations(trends, prediction);

    return {
      nextMonthPrediction: {
        grossPay: prediction.grossPay,
        netPay: prediction.netPay,
        totalTax: prediction.totalTax,
        totalDeductions: prediction.totalDeductions,
        employerContributions: prediction.employerContributions,
        confidence: prediction.confidence,
      },
      quarterlyForecast,
      trends,
      recommendations,
    };
  }

  async detectAnomalies(
    organizationId: string,
    payrollRunId?: string,
  ): Promise<AnomalyDetection> {
    this.logger.log(`Detecting anomalies for organization ${organizationId}`);

    let payrollData: Payroll[];

    if (payrollRunId) {
      // Get specific payroll run
      payrollData = await this.payrollRepository.find({
        where: { organizationId },
        relations: ['employee'],
      });
    } else {
      // Get last month's payroll
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      payrollData = await this.payrollRepository.find({
        where: {
          organizationId,
          payDate: Between(lastMonth, new Date()),
        },
        relations: ['employee'],
      });
    }

    const anomalies = [];

    for (const payroll of payrollData) {
      // Get employee's historical average
      const historicalAvg = await this.getEmployeeHistoricalAverage(payroll.employeeId);

      if (!historicalAvg) continue;

      // Check for salary spikes
      const salaryDeviation = this.calculateDeviation(
        Number(payroll.grossPay),
        historicalAvg.avgGrossPay,
      );

      if (salaryDeviation > 0.25) {
        // 25% deviation
        anomalies.push({
          employeeId: payroll.employeeId,
          employeeName: `${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`,
          type: 'SALARY_SPIKE' as const,
          severity: salaryDeviation > 0.5 ? 'CRITICAL' : salaryDeviation > 0.35 ? 'HIGH' : 'MEDIUM',
          description: `Gross pay increased by ${(salaryDeviation * 100).toFixed(1)}% from average`,
          currentValue: Number(payroll.grossPay),
          expectedValue: historicalAvg.avgGrossPay,
          deviation: salaryDeviation,
        });
      }

      // Check for missing deductions
      const deductionDeviation = this.calculateDeviation(
        Number(payroll.totalDeductions),
        historicalAvg.avgDeductions,
      );

      if (deductionDeviation < -0.2 && Number(payroll.totalDeductions) > 0) {
        // 20% less deductions
        anomalies.push({
          employeeId: payroll.employeeId,
          employeeName: `${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`,
          type: 'MISSING_DEDUCTION' as const,
          severity: deductionDeviation < -0.4 ? 'HIGH' : 'MEDIUM',
          description: `Deductions decreased by ${Math.abs(deductionDeviation * 100).toFixed(1)}% from average`,
          currentValue: Number(payroll.totalDeductions),
          expectedValue: historicalAvg.avgDeductions,
          deviation: Math.abs(deductionDeviation),
        });
      }

      // Check for tax anomalies
      const taxDeviation = this.calculateDeviation(
        Number(payroll.incomeTax),
        historicalAvg.avgTax,
      );

      if (Math.abs(taxDeviation) > 0.3) {
        anomalies.push({
          employeeId: payroll.employeeId,
          employeeName: `${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`,
          type: 'TAX_ANOMALY' as const,
          severity: Math.abs(taxDeviation) > 0.5 ? 'HIGH' : 'MEDIUM',
          description: `Tax ${taxDeviation > 0 ? 'increased' : 'decreased'} by ${Math.abs(taxDeviation * 100).toFixed(1)}%`,
          currentValue: Number(payroll.incomeTax),
          expectedValue: historicalAvg.avgTax,
          deviation: Math.abs(taxDeviation),
        });
      }
    }

    const summary = {
      totalAnomalies: anomalies.length,
      criticalCount: anomalies.filter(a => a.severity === 'CRITICAL').length,
      highCount: anomalies.filter(a => a.severity === 'HIGH').length,
      mediumCount: anomalies.filter(a => a.severity === 'MEDIUM').length,
      lowCount: anomalies.filter(a => a.severity === 'LOW').length,
    };

    return { anomalies, summary };
  }

  private aggregateByMonth(data: Payroll[]) {
    const monthlyMap = new Map<string, any>();

    data.forEach(payroll => {
      const monthKey = payroll.payDate.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          grossPay: 0,
          netPay: 0,
          totalTax: 0,
          totalDeductions: 0,
          count: 0,
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.grossPay += Number(payroll.grossPay);
      monthData.netPay += Number(payroll.netPay);
      monthData.totalTax += Number(payroll.incomeTax);
      monthData.totalDeductions += Number(payroll.totalDeductions);
      monthData.count += 1;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  private linearRegression(data: any[]) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    data.forEach((point, index) => {
      sumX += index;
      sumY += point.grossPay;
      sumXY += index * point.grossPay;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next month (index = n)
    const predictedGross = slope * n + intercept;
    const avgTaxRate = data.reduce((sum, d) => sum + d.totalTax / d.grossPay, 0) / n;
    const avgDeductionRate = data.reduce((sum, d) => sum + d.totalDeductions / d.grossPay, 0) / n;

    // Calculate confidence based on R-squared
    const meanY = sumY / n;
    let ssRes = 0;
    let ssTot = 0;

    data.forEach((point, index) => {
      const predicted = slope * index + intercept;
      ssRes += Math.pow(point.grossPay - predicted, 2);
      ssTot += Math.pow(point.grossPay - meanY, 2);
    });

    const rSquared = 1 - ssRes / ssTot;
    const confidence = Math.max(0, Math.min(1, rSquared)) * 100;

    return {
      grossPay: Math.round(predictedGross),
      netPay: Math.round(predictedGross * (1 - avgDeductionRate)),
      totalTax: Math.round(predictedGross * avgTaxRate),
      totalDeductions: Math.round(predictedGross * avgDeductionRate),
      employerContributions: Math.round(predictedGross * 0.15), // Estimate
      confidence: Math.round(confidence),
    };
  }

  private calculateTrends(data: any[]) {
    if (data.length < 2) {
      return { growthRate: 0, avgMonthlyIncrease: 0, volatility: 0 };
    }

    const first = data[0].grossPay;
    const last = data[data.length - 1].grossPay;
    const growthRate = ((last - first) / first) * 100;

    let totalIncrease = 0;
    for (let i = 1; i < data.length; i++) {
      totalIncrease += data[i].grossPay - data[i - 1].grossPay;
    }
    const avgMonthlyIncrease = totalIncrease / (data.length - 1);

    // Calculate volatility (standard deviation)
    const mean = data.reduce((sum, d) => sum + d.grossPay, 0) / data.length;
    const variance = data.reduce((sum, d) => sum + Math.pow(d.grossPay - mean, 2), 0) / data.length;
    const volatility = (Math.sqrt(variance) / mean) * 100;

    return {
      growthRate: Math.round(growthRate * 100) / 100,
      avgMonthlyIncrease: Math.round(avgMonthlyIncrease),
      volatility: Math.round(volatility * 100) / 100,
    };
  }

  private generateQuarterlyForecast(prediction: any, trends: any) {
    const forecast = [];
    const now = new Date();

    for (let i = 1; i <= 3; i++) {
      const futureMonth = new Date(now);
      futureMonth.setMonth(now.getMonth() + i);

      const predictedCost = Math.round(
        prediction.grossPay + trends.avgMonthlyIncrease * i,
      );
      const taxLiability = Math.round(predictedCost * 0.25); // Estimate
      const cashflowImpact = Math.round(predictedCost * 1.15); // Including employer contributions

      forecast.push({
        month: futureMonth.toISOString().substring(0, 7),
        predictedCost,
        taxLiability,
        cashflowImpact,
      });
    }

    return forecast;
  }

  private generateRecommendations(trends: any, prediction: any): string[] {
    const recommendations: string[] = [];

    if (trends.growthRate > 15) {
      recommendations.push(
        'High payroll growth detected. Consider reviewing hiring plan and budget allocation.',
      );
    }

    if (trends.volatility > 20) {
      recommendations.push(
        'High volatility in payroll costs. Investigate unusual fluctuations in bonuses or overtime.',
      );
    }

    if (prediction.confidence < 70) {
      recommendations.push(
        'Low forecast confidence. More consistent payroll patterns recommended for better predictions.',
      );
    }

    if (trends.avgMonthlyIncrease > prediction.grossPay * 0.05) {
      recommendations.push(
        'Monthly payroll increasing by >5%. Ensure budget can accommodate continued growth.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Payroll trends are stable and predictable. No immediate concerns detected.');
    }

    return recommendations;
  }

  private async getEmployeeHistoricalAverage(employeeId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const historicalPayrolls = await this.payrollRepository.find({
      where: {
        employeeId,
        payDate: Between(sixMonthsAgo, new Date()),
      },
    });

    if (historicalPayrolls.length < 2) return null;

    const avgGrossPay =
      historicalPayrolls.reduce((sum, p) => sum + Number(p.grossPay), 0) /
      historicalPayrolls.length;
    const avgDeductions =
      historicalPayrolls.reduce((sum, p) => sum + Number(p.totalDeductions), 0) /
      historicalPayrolls.length;
    const avgTax =
      historicalPayrolls.reduce((sum, p) => sum + Number(p.incomeTax), 0) /
      historicalPayrolls.length;

    return { avgGrossPay, avgDeductions, avgTax };
  }

  private calculateDeviation(current: number, expected: number): number {
    if (expected === 0) return 0;
    return (current - expected) / expected;
  }
}
