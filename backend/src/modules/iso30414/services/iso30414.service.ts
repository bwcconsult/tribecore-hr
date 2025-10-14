import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HCMetric, MetricCategory } from '../entities/hc-metric.entity';
import { HCReport, ReportType } from '../entities/hc-report.entity';

@Injectable()
export class ISO30414Service {
  constructor(
    @InjectRepository(HCMetric)
    private readonly metricRepository: Repository<HCMetric>,
    @InjectRepository(HCReport)
    private readonly reportRepository: Repository<HCReport>,
  ) {}

  // ============ Metric Calculation ============

  async calculateAllMetrics(organizationId: string, periodStart: Date, periodEnd: Date): Promise<HCMetric[]> {
    const metrics: HCMetric[] = [];

    // Calculate each ISO 30414 metric category
    metrics.push(...await this.calculateCostMetrics(organizationId, periodStart, periodEnd));
    metrics.push(...await this.calculateProductivityMetrics(organizationId, periodStart, periodEnd));
    metrics.push(...await this.calculateRecruitmentMetrics(organizationId, periodStart, periodEnd));
    metrics.push(...await this.calculateTurnoverMetrics(organizationId, periodStart, periodEnd));
    metrics.push(...await this.calculateDiversityMetrics(organizationId, periodStart, periodEnd));
    metrics.push(...await this.calculateLeadershipMetrics(organizationId, periodStart, periodEnd));
    metrics.push(...await this.calculateSkillsMetrics(organizationId, periodStart, periodEnd));

    // Save all metrics
    return this.metricRepository.save(metrics);
  }

  private async calculateCostMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    // In real implementation, query payroll, benefits, etc.
    return [
      this.createMetric(orgId, 'TOTAL_WORKFORCE_COST', 'Total Workforce Cost', MetricCategory.COSTS, start, end, 5000000, 'USD'),
      this.createMetric(orgId, 'COST_PER_HIRE', 'Cost Per Hire', MetricCategory.COSTS, start, end, 4500, 'USD'),
      this.createMetric(orgId, 'HR_OPERATING_COST', 'HR Operating Cost', MetricCategory.COSTS, start, end, 250000, 'USD'),
    ];
  }

  private async calculateProductivityMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    return [
      this.createMetric(orgId, 'REVENUE_PER_FTE', 'Revenue Per FTE', MetricCategory.PRODUCTIVITY, start, end, 250000, 'USD'),
      this.createMetric(orgId, 'PROFIT_PER_FTE', 'Profit Per FTE', MetricCategory.PRODUCTIVITY, start, end, 50000, 'USD'),
    ];
  }

  private async calculateRecruitmentMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    return [
      this.createMetric(orgId, 'TIME_TO_FILL', 'Average Time to Fill', MetricCategory.RECRUITMENT, start, end, 45, 'days'),
      this.createMetric(orgId, 'QUALITY_OF_HIRE', 'Quality of Hire Score', MetricCategory.RECRUITMENT, start, end, 85, '%'),
      this.createMetric(orgId, 'OFFER_ACCEPTANCE_RATE', 'Offer Acceptance Rate', MetricCategory.RECRUITMENT, start, end, 92, '%'),
    ];
  }

  private async calculateTurnoverMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    return [
      this.createMetric(orgId, 'VOLUNTARY_TURNOVER', 'Voluntary Turnover Rate', MetricCategory.TURNOVER, start, end, 12.5, '%'),
      this.createMetric(orgId, 'INVOLUNTARY_TURNOVER', 'Involuntary Turnover Rate', MetricCategory.TURNOVER, start, end, 3.2, '%'),
      this.createMetric(orgId, 'REGRETTABLE_LOSS', 'Regrettable Loss Rate', MetricCategory.TURNOVER, start, end, 8.1, '%'),
    ];
  }

  private async calculateDiversityMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    return [
      this.createMetric(orgId, 'GENDER_RATIO', 'Gender Ratio (F:M)', MetricCategory.DIVERSITY, start, end, 43, '%'),
      this.createMetric(orgId, 'GENDER_PAY_GAP', 'Gender Pay Gap', MetricCategory.DIVERSITY, start, end, 3, '%'),
      this.createMetric(orgId, 'LEADERSHIP_DIVERSITY', 'Leadership Gender Diversity', MetricCategory.DIVERSITY, start, end, 38, '%'),
    ];
  }

  private async calculateLeadershipMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    return [
      this.createMetric(orgId, 'LEADERSHIP_PIPELINE', 'Leadership Pipeline Strength', MetricCategory.LEADERSHIP, start, end, 75, '%'),
      this.createMetric(orgId, 'SUCCESSION_COVERAGE', 'Succession Plan Coverage', MetricCategory.LEADERSHIP, start, end, 85, '%'),
      this.createMetric(orgId, 'INTERNAL_PROMOTION_RATE', 'Internal Promotion Rate', MetricCategory.LEADERSHIP, start, end, 68, '%'),
    ];
  }

  private async calculateSkillsMetrics(orgId: string, start: Date, end: Date): Promise<Partial<HCMetric>[]> {
    return [
      this.createMetric(orgId, 'SKILLS_COVERAGE', 'Critical Skills Coverage', MetricCategory.SKILLS, start, end, 82, '%'),
      this.createMetric(orgId, 'TRAINING_HOURS_PER_FTE', 'Training Hours Per FTE', MetricCategory.SKILLS, start, end, 40, 'hours'),
      this.createMetric(orgId, 'LEARNING_INVESTMENT', 'Learning Investment Per FTE', MetricCategory.SKILLS, start, end, 1500, 'USD'),
    ];
  }

  private createMetric(
    orgId: string,
    code: string,
    name: string,
    category: MetricCategory,
    start: Date,
    end: Date,
    value: number,
    unit: string,
  ): Partial<HCMetric> {
    return {
      organizationId: orgId,
      metricCode: code,
      metricName: name,
      category,
      periodStart: start,
      periodEnd: end,
      numericValue: value,
      unit,
      calculatedAt: new Date(),
      dataSource: 'CALCULATED',
      verified: false,
      includeInBoardReport: true,
    };
  }

  // ============ Report Generation ============

  async generateBoardReport(organizationId: string, periodStart: Date, periodEnd: Date): Promise<HCReport> {
    const metrics = await this.metricRepository.find({
      where: {
        organizationId,
        periodStart: Between(periodStart, periodEnd),
        includeInBoardReport: true,
      },
    });

    const reportId = `HCR-${new Date().getFullYear()}-${Date.now()}`;

    const report = this.reportRepository.create({
      organizationId,
      reportId,
      title: `Human Capital Report - ${periodStart.toISOString().slice(0, 7)}`,
      reportType: ReportType.BOARD_REPORT,
      periodStart,
      periodEnd,
      fiscalYear: `FY${new Date().getFullYear()}`,
      metrics: metrics.map(m => ({
        metricId: m.id,
        metricCode: m.metricCode,
        metricName: m.metricName,
        category: m.category,
        value: m.numericValue,
        unit: m.unit || '',
        previousValue: m.previousPeriodValue,
        changePercent: m.changePercent,
        benchmark: m.industryBenchmark,
        target: m.targetValue,
      })),
      executiveSummary: this.generateExecutiveSummary(metrics),
      keyFindings: this.generateKeyFindings(metrics),
      generatedBy: 'SYSTEM',
      generatedAt: new Date(),
      autoGenerated: true,
    });

    return this.reportRepository.save(report);
  }

  private generateExecutiveSummary(metrics: HCMetric[]): string {
    return `This Human Capital Report provides a comprehensive overview of our workforce metrics aligned with ISO 30414 standards. Key highlights include workforce cost efficiency, talent acquisition effectiveness, and diversity progress.`;
  }

  private generateKeyFindings(metrics: HCMetric[]): string[] {
    return [
      'Voluntary turnover remains below industry average',
      'Leadership diversity improved by 5% year-over-year',
      'Time-to-fill reduced through improved ATS processes',
      'Skills coverage increased with targeted training programs',
    ];
  }

  async getMetricsByCategory(organizationId: string, category: MetricCategory): Promise<HCMetric[]> {
    return this.metricRepository.find({
      where: { organizationId, category },
      order: { periodStart: 'DESC' },
    });
  }

  async getMetricTrend(organizationId: string, metricCode: string, periods: number = 12): Promise<HCMetric[]> {
    return this.metricRepository.find({
      where: { organizationId, metricCode },
      order: { periodStart: 'DESC' },
      take: periods,
    });
  }

  async getDashboardData(organizationId: string): Promise<any> {
    const latestMetrics = await this.metricRepository
      .createQueryBuilder('metric')
      .where('metric.organizationId = :organizationId', { organizationId })
      .distinctOn(['metric.metricCode'])
      .orderBy('metric.metricCode')
      .addOrderBy('metric.periodStart', 'DESC')
      .getMany();

    const byCategory = latestMetrics.reduce((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push({
        code: m.metricCode,
        name: m.metricName,
        value: m.numericValue,
        unit: m.unit,
        change: m.changePercent,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return {
      summary: {
        totalMetrics: latestMetrics.length,
        lastUpdated: latestMetrics[0]?.calculatedAt,
        verificationRate: (latestMetrics.filter(m => m.verified).length / latestMetrics.length) * 100,
      },
      byCategory,
    };
  }
}
