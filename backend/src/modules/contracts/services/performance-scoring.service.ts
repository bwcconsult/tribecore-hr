import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../entities/contract.entity';
import { Obligation, ObligationStatus } from '../entities/obligation.entity';

export interface PerformanceMetrics {
  overallScore: number;
  category: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'POOR' | 'CRITICAL';
  metrics: {
    obligationCompletion: number;
    slaCompliance: number;
    paymentTimeliness: number;
    qualityScore: number;
    communicationScore: number;
  };
  breakdown: {
    totalObligations: number;
    completedOnTime: number;
    completedLate: number;
    overdue: number;
    averageDelayDays: number;
  };
  recommendations: string[];
  riskFactors: string[];
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

@Injectable()
export class PerformanceScoringService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Obligation)
    private obligationRepository: Repository<Obligation>,
  ) {}

  /**
   * Calculate comprehensive performance score for a contract
   */
  async calculatePerformanceScore(contractId: string): Promise<PerformanceMetrics> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['obligations'],
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    const obligations = await this.obligationRepository.find({
      where: { contractId },
    });

    // Calculate individual metrics
    const obligationScore = this.calculateObligationScore(obligations);
    const slaScore = this.calculateSLAScore(obligations);
    const paymentScore = this.calculatePaymentScore(obligations);
    const qualityScore = this.estimateQualityScore(contract);
    const communicationScore = this.estimateCommunicationScore(contract);

    // Weighted overall score
    const overallScore = Math.round(
      obligationScore * 0.3 +
        slaScore * 0.25 +
        paymentScore * 0.25 +
        qualityScore * 0.1 +
        communicationScore * 0.1,
    );

    // Calculate breakdown
    const breakdown = this.calculateBreakdown(obligations);

    // Determine category
    const category = this.determineCategory(overallScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      overallScore,
      obligationScore,
      slaScore,
      paymentScore,
      breakdown,
    );

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(
      obligationScore,
      slaScore,
      paymentScore,
      breakdown,
    );

    // Determine trend
    const trend = this.determineTrend(obligations);

    return {
      overallScore,
      category,
      metrics: {
        obligationCompletion: obligationScore,
        slaCompliance: slaScore,
        paymentTimeliness: paymentScore,
        qualityScore,
        communicationScore,
      },
      breakdown,
      recommendations,
      riskFactors,
      trend,
    };
  }

  /**
   * Calculate obligation completion score (0-100)
   */
  private calculateObligationScore(obligations: Obligation[]): number {
    if (obligations.length === 0) return 100;

    const completed = obligations.filter((o) => o.status === ObligationStatus.COMPLETED).length;
    const overdue = obligations.filter((o) => o.status === ObligationStatus.OVERDUE).length;
    const total = obligations.length;

    // Penalize overdue obligations heavily
    const completionRate = (completed / total) * 100;
    const overdueRate = (overdue / total) * 100;
    const score = completionRate - overdueRate * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate SLA compliance score
   */
  private calculateSLAScore(obligations: Obligation[]): number {
    const slaObligations = obligations.filter((o) => o.type === 'SLA');

    if (slaObligations.length === 0) return 100;

    let totalCompliance = 0;

    for (const obl of slaObligations) {
      if (obl.kpiTarget && obl.kpiActual) {
        const compliance = (obl.kpiActual / obl.kpiTarget) * 100;
        totalCompliance += Math.min(100, compliance);
      } else if (obl.kpiMet) {
        totalCompliance += 100;
      } else {
        totalCompliance += 50; // Neutral if no data
      }
    }

    return Math.round(totalCompliance / slaObligations.length);
  }

  /**
   * Calculate payment timeliness score
   */
  private calculatePaymentScore(obligations: Obligation[]): number {
    const paymentObligations = obligations.filter((o) => o.type === 'PAYMENT');

    if (paymentObligations.length === 0) return 100;

    let onTimePayments = 0;

    for (const obl of paymentObligations) {
      if (obl.status === ObligationStatus.COMPLETED && obl.completedDate) {
        const dueDate = new Date(obl.dueDate);
        const completedDate = new Date(obl.completedDate);
        if (completedDate <= dueDate) {
          onTimePayments++;
        }
      }
    }

    return Math.round((onTimePayments / paymentObligations.length) * 100);
  }

  /**
   * Estimate quality score (would connect to feedback/ratings in production)
   */
  private estimateQualityScore(contract: Contract): number {
    // In production, this would pull from:
    // - Customer feedback ratings
    // - Issue/complaint tickets
    // - Product/service quality metrics
    // For now, use risk score as inverse indicator
    const riskBasedScore = 100 - contract.riskScore * 10;
    return Math.max(0, Math.min(100, riskBasedScore));
  }

  /**
   * Estimate communication score
   */
  private estimateCommunicationScore(contract: Contract): number {
    // In production, this would track:
    // - Response times to queries
    // - Number of escalations
    // - Communication quality ratings
    // Default to good score
    return 80;
  }

  /**
   * Calculate detailed breakdown
   */
  private calculateBreakdown(obligations: Obligation[]) {
    const completed = obligations.filter((o) => o.status === ObligationStatus.COMPLETED);
    const overdue = obligations.filter((o) => o.status === ObligationStatus.OVERDUE);

    let completedOnTime = 0;
    let completedLate = 0;
    let totalDelayDays = 0;

    for (const obl of completed) {
      if (obl.completedDate) {
        const dueDate = new Date(obl.dueDate);
        const completedDate = new Date(obl.completedDate);
        const delayDays = Math.ceil(
          (completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (delayDays <= 0) {
          completedOnTime++;
        } else {
          completedLate++;
          totalDelayDays += delayDays;
        }
      }
    }

    return {
      totalObligations: obligations.length,
      completedOnTime,
      completedLate,
      overdue: overdue.length,
      averageDelayDays: completedLate > 0 ? Math.round(totalDelayDays / completedLate) : 0,
    };
  }

  /**
   * Determine performance category
   */
  private determineCategory(
    score: number,
  ): 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'POOR' | 'CRITICAL' {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'SATISFACTORY';
    if (score >= 40) return 'POOR';
    return 'CRITICAL';
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    overallScore: number,
    obligationScore: number,
    slaScore: number,
    paymentScore: number,
    breakdown: any,
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore >= 90) {
      recommendations.push('Excellent performance - consider renewing with favorable terms');
      recommendations.push('Candidate for preferred vendor/partner status');
    } else if (overallScore >= 75) {
      recommendations.push('Good performance - suitable for renewal');
    } else if (overallScore >= 60) {
      recommendations.push('Satisfactory performance - monitor closely');
      recommendations.push('Consider performance improvement plan');
    } else {
      recommendations.push('Performance concerns - review relationship');
      recommendations.push('Consider termination or renegotiation');
    }

    if (obligationScore < 70) {
      recommendations.push('Action required: High rate of missed obligations');
    }

    if (slaScore < 80) {
      recommendations.push('SLA compliance below acceptable levels');
    }

    if (paymentScore < 80) {
      recommendations.push('Payment delays detected - review payment terms');
    }

    if (breakdown.overdue > 3) {
      recommendations.push(`${breakdown.overdue} overdue obligations require immediate attention`);
    }

    if (breakdown.averageDelayDays > 7) {
      recommendations.push(
        `Average delay of ${breakdown.averageDelayDays} days - investigate root causes`,
      );
    }

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    obligationScore: number,
    slaScore: number,
    paymentScore: number,
    breakdown: any,
  ): string[] {
    const risks: string[] = [];

    if (obligationScore < 60) {
      risks.push('HIGH RISK: Poor obligation completion rate');
    }

    if (slaScore < 70) {
      risks.push('HIGH RISK: Consistent SLA failures');
    }

    if (paymentScore < 70) {
      risks.push('MEDIUM RISK: Payment delays may indicate financial issues');
    }

    if (breakdown.overdue > 5) {
      risks.push('HIGH RISK: Excessive overdue obligations');
    }

    if (breakdown.averageDelayDays > 14) {
      risks.push('MEDIUM RISK: Significant delays in obligation completion');
    }

    if (risks.length === 0) {
      risks.push('No significant risk factors identified');
    }

    return risks;
  }

  /**
   * Determine performance trend
   */
  private determineTrend(obligations: Obligation[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    // Compare recent performance (last 3 months) vs previous 3 months
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const recent = obligations.filter((o) => new Date(o.dueDate) >= threeMonthsAgo);
    const previous = obligations.filter(
      (o) => new Date(o.dueDate) >= sixMonthsAgo && new Date(o.dueDate) < threeMonthsAgo,
    );

    if (recent.length === 0 || previous.length === 0) return 'STABLE';

    const recentScore = this.calculateObligationScore(recent);
    const previousScore = this.calculateObligationScore(previous);

    const difference = recentScore - previousScore;

    if (difference > 10) return 'IMPROVING';
    if (difference < -10) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Batch calculate scores for multiple contracts
   */
  async batchCalculateScores(contractIds: string[]): Promise<Map<string, PerformanceMetrics>> {
    const results = new Map<string, PerformanceMetrics>();

    for (const contractId of contractIds) {
      try {
        const score = await this.calculatePerformanceScore(contractId);
        results.set(contractId, score);
      } catch (error) {
        console.error(`Failed to calculate score for contract ${contractId}:`, error);
      }
    }

    return results;
  }
}
