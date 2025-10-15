import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk, RiskSeverity, RiskStatus } from '../entities/risk.entity';
import { CreateRiskDto, UpdateRiskDto } from '../dto/create-risk.dto';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepository: Repository<Risk>,
  ) {}

  /**
   * Add a risk to a case
   */
  async addRisk(dto: CreateRiskDto): Promise<Risk> {
    const risk = this.riskRepository.create({
      caseId: dto.caseId,
      severity: dto.severity,
      description: dto.description,
      mitigation: dto.mitigation,
      ownerId: dto.ownerId,
      status: dto.status || RiskStatus.OPEN,
      identifiedAt: new Date(),
      targetResolutionDate: dto.targetResolutionDate,
      impact: dto.impact,
      probability: dto.probability,
      metadata: dto.metadata,
    });

    return this.riskRepository.save(risk);
  }

  /**
   * Get risk by ID
   */
  async getRisk(id: string): Promise<Risk> {
    const risk = await this.riskRepository.findOne({ where: { id } });
    if (!risk) {
      throw new NotFoundException(`Risk with ID ${id} not found`);
    }
    return risk;
  }

  /**
   * Get all risks for a case
   */
  async getRisksForCase(caseId: string): Promise<Risk[]> {
    return this.riskRepository.find({
      where: { caseId },
      order: { severity: 'DESC', identifiedAt: 'DESC' },
    });
  }

  /**
   * Get open risks for a case
   */
  async getOpenRisks(caseId: string): Promise<Risk[]> {
    return this.riskRepository.find({
      where: { caseId, status: RiskStatus.OPEN },
      order: { severity: 'DESC', identifiedAt: 'DESC' },
    });
  }

  /**
   * Get critical and high severity open risks
   */
  async getCriticalRisks(caseId: string): Promise<Risk[]> {
    return this.riskRepository
      .createQueryBuilder('risk')
      .where('risk.caseId = :caseId', { caseId })
      .andWhere('risk.status IN (:...statuses)', {
        statuses: [RiskStatus.OPEN, RiskStatus.MITIGATING],
      })
      .andWhere('risk.severity IN (:...severities)', {
        severities: [RiskSeverity.CRITICAL, RiskSeverity.HIGH],
      })
      .orderBy('risk.severity', 'DESC')
      .addOrderBy('risk.identifiedAt', 'DESC')
      .getMany();
  }

  /**
   * Update risk
   */
  async updateRisk(id: string, dto: UpdateRiskDto): Promise<Risk> {
    const risk = await this.getRisk(id);
    
    Object.assign(risk, dto);

    // If status changed to CLOSED, set resolvedAt
    if (dto.status === RiskStatus.CLOSED && risk.status !== RiskStatus.CLOSED) {
      risk.resolvedAt = new Date();
    }

    return this.riskRepository.save(risk);
  }

  /**
   * Update risk status
   */
  async updateRiskStatus(id: string, status: RiskStatus, mitigation?: string): Promise<Risk> {
    const risk = await this.getRisk(id);
    
    risk.status = status;
    if (mitigation) {
      risk.mitigation = mitigation;
    }

    if (status === RiskStatus.CLOSED) {
      risk.resolvedAt = new Date();
    }

    return this.riskRepository.save(risk);
  }

  /**
   * Delete risk (soft delete)
   */
  async deleteRisk(id: string): Promise<void> {
    const risk = await this.getRisk(id);
    await this.riskRepository.softRemove(risk);
  }

  /**
   * Get risk burndown for a case
   * Returns count of open critical and high risks over time
   */
  async getRiskBurndown(caseId: string): Promise<{
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    trend: 'improving' | 'stable' | 'worsening';
  }> {
    const risks = await this.getRisksForCase(caseId);
    const openRisks = risks.filter((r) => r.status === RiskStatus.OPEN || r.status === RiskStatus.MITIGATING);

    const critical = openRisks.filter((r) => r.severity === RiskSeverity.CRITICAL).length;
    const high = openRisks.filter((r) => r.severity === RiskSeverity.HIGH).length;
    const medium = openRisks.filter((r) => r.severity === RiskSeverity.MEDIUM).length;
    const low = openRisks.filter((r) => r.severity === RiskSeverity.LOW).length;

    // Simple trend analysis: compare risks identified in last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentRisks = openRisks.filter((r) => r.identifiedAt >= sevenDaysAgo).length;
    const previousRisks = openRisks.filter(
      (r) => r.identifiedAt >= fourteenDaysAgo && r.identifiedAt < sevenDaysAgo,
    ).length;

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (recentRisks < previousRisks) {
      trend = 'improving';
    } else if (recentRisks > previousRisks) {
      trend = 'worsening';
    }

    return {
      critical,
      high,
      medium,
      low,
      total: openRisks.length,
      trend,
    };
  }

  /**
   * Get overdue risks (past target resolution date)
   */
  async getOverdueRisks(caseId: string): Promise<Risk[]> {
    const now = new Date();
    
    return this.riskRepository
      .createQueryBuilder('risk')
      .where('risk.caseId = :caseId', { caseId })
      .andWhere('risk.status IN (:...statuses)', {
        statuses: [RiskStatus.OPEN, RiskStatus.MITIGATING],
      })
      .andWhere('risk.targetResolutionDate < :now', { now })
      .orderBy('risk.severity', 'DESC')
      .addOrderBy('risk.targetResolutionDate', 'ASC')
      .getMany();
  }

  /**
   * Calculate risk score (severity * probability)
   */
  calculateRiskScore(severity: RiskSeverity, probability: number): number {
    const severityWeight = {
      [RiskSeverity.LOW]: 1,
      [RiskSeverity.MEDIUM]: 2,
      [RiskSeverity.HIGH]: 3,
      [RiskSeverity.CRITICAL]: 4,
    };

    return severityWeight[severity] * (probability || 3); // Default probability to 3 if not set
  }

  /**
   * Get risk matrix data for visualization
   */
  async getRiskMatrix(caseId: string): Promise<{
    matrix: Array<{ severity: RiskSeverity; probability: number; count: number }>;
    highestRisk: Risk | null;
  }> {
    const risks = await this.getOpenRisks(caseId);

    // Group by severity and probability
    const matrix: Array<{ severity: RiskSeverity; probability: number; count: number }> = [];

    for (const severity of Object.values(RiskSeverity)) {
      for (let probability = 1; probability <= 5; probability++) {
        const count = risks.filter(
          (r) => r.severity === severity && r.probability === probability,
        ).length;

        if (count > 0) {
          matrix.push({ severity, probability, count });
        }
      }
    }

    // Find highest risk (highest score)
    let highestRisk: Risk | null = null;
    let highestScore = 0;

    for (const risk of risks) {
      const score = this.calculateRiskScore(risk.severity, risk.probability || 3);
      if (score > highestScore) {
        highestScore = score;
        highestRisk = risk;
      }
    }

    return {
      matrix,
      highestRisk,
    };
  }
}
