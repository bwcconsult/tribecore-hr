import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AISystem, AISystemStatus, AIRiskLevel } from '../entities/ai-system.entity';
import { AIDecisionLog, DecisionOutcome } from '../entities/ai-decision-log.entity';
import {
  CreateAISystemDto,
  UpdateAISystemDto,
  RecordBiasTestDto,
  UpdateModelVersionDto,
  CertifyAISystemDto,
  LogAIDecisionDto,
  ReviewAIDecisionDto,
  RecordDecisionOutcomeDto,
  GetAIDecisionLogsQueryDto,
  GenerateComplianceReportDto,
} from '../dto/ai-governance.dto';

@Injectable()
export class AIGovernanceService {
  constructor(
    @InjectRepository(AISystem)
    private readonly aiSystemRepository: Repository<AISystem>,
    @InjectRepository(AIDecisionLog)
    private readonly decisionLogRepository: Repository<AIDecisionLog>,
  ) {}

  // ============ AI System Management ============

  async createAISystem(dto: CreateAISystemDto): Promise<AISystem> {
    const aiSystem = this.aiSystemRepository.create(dto);

    // Auto-set requirements based on risk level
    if (dto.riskLevel === AIRiskLevel.HIGH) {
      aiSystem.requiresHumanReview = true;
      aiSystem.hasTransparencyNotice = true;
      aiSystem.loggingEnabled = true;
    }

    return this.aiSystemRepository.save(aiSystem);
  }

  async updateAISystem(id: string, dto: UpdateAISystemDto): Promise<AISystem> {
    const aiSystem = await this.aiSystemRepository.findOne({ where: { id } });
    if (!aiSystem) {
      throw new NotFoundException('AI System not found');
    }

    Object.assign(aiSystem, dto);
    return this.aiSystemRepository.save(aiSystem);
  }

  async getAISystem(id: string): Promise<AISystem> {
    const aiSystem = await this.aiSystemRepository.findOne({ where: { id } });
    if (!aiSystem) {
      throw new NotFoundException('AI System not found');
    }
    return aiSystem;
  }

  async getAISystemsByOrg(organizationId: string): Promise<AISystem[]> {
    return this.aiSystemRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async getHighRiskAISystems(organizationId: string): Promise<AISystem[]> {
    return this.aiSystemRepository.find({
      where: {
        organizationId,
        riskLevel: AIRiskLevel.HIGH,
        status: AISystemStatus.ACTIVE,
      },
    });
  }

  async recordBiasTest(dto: RecordBiasTestDto): Promise<AISystem> {
    const aiSystem = await this.getAISystem(dto.aiSystemId);

    aiSystem.biasTested = true;
    aiSystem.lastBiasTestDate = new Date();
    aiSystem.biasTestResults = {
      gender: dto.genderDisparateImpact,
      ethnicity: dto.ethnicityDisparateImpact,
      age: dto.ageDisparateImpact,
      disability: dto.disabilityDisparateImpact,
      testDate: new Date().toISOString(),
      testMethod: dto.testMethod,
      notes: dto.notes,
    };

    return this.aiSystemRepository.save(aiSystem);
  }

  async updateModelVersion(dto: UpdateModelVersionDto): Promise<AISystem> {
    const aiSystem = await this.getAISystem(dto.aiSystemId);

    aiSystem.modelVersion = dto.modelVersion;
    aiSystem.lastModelUpdate = dto.lastModelUpdate;
    aiSystem.trainingDataSources = dto.trainingDataSources;
    aiSystem.performanceMetrics = dto.performanceMetrics;

    // Require re-certification after model update
    if (aiSystem.certified) {
      aiSystem.certified = false;
      aiSystem.certificationExpiryDate = null;
    }

    return this.aiSystemRepository.save(aiSystem);
  }

  async certifyAISystem(dto: CertifyAISystemDto): Promise<AISystem> {
    const aiSystem = await this.getAISystem(dto.aiSystemId);

    // Check if all compliance requirements met
    if (aiSystem.riskLevel === AIRiskLevel.HIGH) {
      if (!aiSystem.hasDataProtectionImpactAssessment) {
        throw new BadRequestException('High-risk AI systems must have a completed DPIA');
      }
      if (!aiSystem.biasTested) {
        throw new BadRequestException('High-risk AI systems must undergo bias testing');
      }
      if (!aiSystem.loggingEnabled) {
        throw new BadRequestException('High-risk AI systems must have logging enabled');
      }
    }

    aiSystem.certified = dto.certified;
    aiSystem.certifiedBy = dto.certifiedBy;
    aiSystem.certificationDate = new Date();
    aiSystem.certificationExpiryDate = dto.certificationExpiryDate;
    aiSystem.lastReviewDate = new Date();
    
    // Calculate next review date (6 months for high-risk, 12 months for others)
    const nextReviewMonths = aiSystem.riskLevel === AIRiskLevel.HIGH ? 6 : 12;
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + nextReviewMonths);
    aiSystem.nextReviewDate = nextReview;

    if (dto.certified) {
      aiSystem.status = AISystemStatus.ACTIVE;
    }

    return this.aiSystemRepository.save(aiSystem);
  }

  async decommissionAISystem(id: string, reason: string): Promise<AISystem> {
    const aiSystem = await this.getAISystem(id);
    
    aiSystem.status = AISystemStatus.DECOMMISSIONED;
    aiSystem.metadata = {
      ...aiSystem.metadata,
      decommissionDate: new Date().toISOString(),
      decommissionReason: reason,
    };

    return this.aiSystemRepository.save(aiSystem);
  }

  // ============ AI Decision Logging ============

  async logAIDecision(dto: LogAIDecisionDto): Promise<AIDecisionLog> {
    const aiSystem = await this.getAISystem(dto.aiSystemId);

    // Check if system is active and certified
    if (aiSystem.status !== AISystemStatus.ACTIVE) {
      throw new BadRequestException('AI System is not active');
    }

    const log = this.decisionLogRepository.create({
      ...dto,
      decisionTimestamp: new Date(),
      modelVersion: dto.modelVersion || aiSystem.modelVersion,
    });

    // Auto-flag for review if confidence is low or system requires human review
    if (aiSystem.requiresHumanReview) {
      const threshold = aiSystem.humanReviewConfig?.reviewThreshold || 0.8;
      if (!dto.confidenceScore || dto.confidenceScore < threshold) {
        log.auditFlagged = true;
        log.auditNotes = `Flagged: Confidence score (${dto.confidenceScore}) below threshold (${threshold})`;
      }
    }

    return this.decisionLogRepository.save(log);
  }

  async reviewAIDecision(dto: ReviewAIDecisionDto): Promise<AIDecisionLog> {
    const log = await this.decisionLogRepository.findOne({
      where: { id: dto.decisionLogId },
    });

    if (!log) {
      throw new NotFoundException('AI Decision Log not found');
    }

    log.humanReviewed = true;
    log.reviewedBy = dto.reviewedBy;
    log.reviewerName = dto.reviewerName;
    log.reviewedAt = new Date();
    log.reviewNotes = dto.reviewNotes;
    log.overridden = dto.overridden;
    log.overrideReason = dto.overrideReason;
    log.finalDecision = dto.finalDecision;

    return this.decisionLogRepository.save(log);
  }

  async recordDecisionOutcome(dto: RecordDecisionOutcomeDto): Promise<AIDecisionLog> {
    const log = await this.decisionLogRepository.findOne({
      where: { id: dto.decisionLogId },
    });

    if (!log) {
      throw new NotFoundException('AI Decision Log not found');
    }

    log.feedbackReceived = true;
    log.outcomeTracking = {
      actualOutcome: dto.actualOutcome,
      aiCorrect: dto.aiCorrect,
      feedbackDate: new Date().toISOString(),
      notes: dto.notes,
    };

    return this.decisionLogRepository.save(log);
  }

  async getAIDecisionLogs(query: GetAIDecisionLogsQueryDto): Promise<{
    data: AIDecisionLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, startDate, endDate, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = { ...filters };

    if (startDate && endDate) {
      where.decisionTimestamp = Between(startDate, endDate);
    }

    const [data, total] = await this.decisionLogRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { decisionTimestamp: 'DESC' },
      relations: ['aiSystem'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDecisionLogsBySubject(
    subjectType: string,
    subjectId: string,
  ): Promise<AIDecisionLog[]> {
    return this.decisionLogRepository.find({
      where: { subjectType, subjectId },
      order: { decisionTimestamp: 'DESC' },
      relations: ['aiSystem'],
    });
  }

  // ============ Compliance & Reporting ============

  async generateComplianceReport(dto: GenerateComplianceReportDto): Promise<any> {
    const { organizationId, startDate, endDate, aiSystemIds, includeDecisionLogs, includeBiasTests } = dto;

    // Get all AI systems
    let aiSystems: AISystem[];
    if (aiSystemIds && aiSystemIds.length > 0) {
      aiSystems = await this.aiSystemRepository.find({
        where: { id: In(aiSystemIds), organizationId },
      });
    } else {
      aiSystems = await this.getAISystemsByOrg(organizationId);
    }

    // Get decision logs for the period
    let decisionLogs: AIDecisionLog[] = [];
    if (includeDecisionLogs) {
      const where: any = { organizationId };
      if (startDate && endDate) {
        where.decisionTimestamp = Between(startDate, endDate);
      }
      if (aiSystemIds && aiSystemIds.length > 0) {
        where.aiSystemId = In(aiSystemIds);
      }

      decisionLogs = await this.decisionLogRepository.find({
        where,
        order: { decisionTimestamp: 'DESC' },
      });
    }

    // Calculate metrics
    const totalSystems = aiSystems.length;
    const highRiskSystems = aiSystems.filter(s => s.riskLevel === AIRiskLevel.HIGH).length;
    const certifiedSystems = aiSystems.filter(s => s.certified).length;
    const systemsNeedingReview = aiSystems.filter(s => {
      if (!s.nextReviewDate) return false;
      return new Date(s.nextReviewDate) < new Date();
    }).length;

    const totalDecisions = decisionLogs.length;
    const decisionsReviewed = decisionLogs.filter(d => d.humanReviewed).length;
    const decisionsOverridden = decisionLogs.filter(d => d.overridden).length;
    const decisionsFlagged = decisionLogs.filter(d => d.auditFlagged).length;

    // Bias test compliance
    const highRiskSystemsWithBiasTests = aiSystems.filter(
      s => s.riskLevel === AIRiskLevel.HIGH && s.biasTested
    ).length;

    // DPIA compliance
    const highRiskSystemsWithDPIA = aiSystems.filter(
      s => s.riskLevel === AIRiskLevel.HIGH && s.hasDataProtectionImpactAssessment
    ).length;

    // Decision outcomes by type
    const decisionsByType = decisionLogs.reduce((acc, log) => {
      acc[log.decisionType] = (acc[log.decisionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Override rate by AI system
    const overrideRateBySystem = aiSystems.map(system => {
      const systemLogs = decisionLogs.filter(d => d.aiSystemId === system.id);
      const overrides = systemLogs.filter(d => d.overridden).length;
      return {
        systemName: system.name,
        systemId: system.id,
        totalDecisions: systemLogs.length,
        overrides,
        overrideRate: systemLogs.length > 0 ? (overrides / systemLogs.length) * 100 : 0,
      };
    });

    return {
      reportDate: new Date().toISOString(),
      period: { startDate, endDate },
      organizationId,
      
      summary: {
        totalAISystems: totalSystems,
        highRiskSystems,
        certifiedSystems,
        certificationRate: totalSystems > 0 ? (certifiedSystems / totalSystems) * 100 : 0,
        systemsNeedingReview,
      },

      compliance: {
        biasTestCompliance: {
          required: highRiskSystems,
          completed: highRiskSystemsWithBiasTests,
          complianceRate: highRiskSystems > 0 ? (highRiskSystemsWithBiasTests / highRiskSystems) * 100 : 0,
        },
        dpiaCompliance: {
          required: highRiskSystems,
          completed: highRiskSystemsWithDPIA,
          complianceRate: highRiskSystems > 0 ? (highRiskSystemsWithDPIA / highRiskSystems) * 100 : 0,
        },
      },

      decisions: {
        totalDecisions,
        decisionsReviewed,
        reviewRate: totalDecisions > 0 ? (decisionsReviewed / totalDecisions) * 100 : 0,
        decisionsOverridden,
        overrideRate: totalDecisions > 0 ? (decisionsOverridden / totalDecisions) * 100 : 0,
        decisionsFlagged,
        flagRate: totalDecisions > 0 ? (decisionsFlagged / totalDecisions) * 100 : 0,
        decisionsByType,
      },

      overrideAnalysis: overrideRateBySystem,

      systems: includeDecisionLogs ? aiSystems : aiSystems.map(s => ({
        id: s.id,
        name: s.name,
        riskLevel: s.riskLevel,
        status: s.status,
        certified: s.certified,
        certificationExpiryDate: s.certificationExpiryDate,
        nextReviewDate: s.nextReviewDate,
        biasTested: s.biasTested,
        hasDataProtectionImpactAssessment: s.hasDataProtectionImpactAssessment,
      })),

      decisionLogs: includeDecisionLogs ? decisionLogs : undefined,
    };
  }

  async getSystemsDueForReview(organizationId: string): Promise<AISystem[]> {
    const today = new Date();
    return this.aiSystemRepository
      .createQueryBuilder('system')
      .where('system.organizationId = :organizationId', { organizationId })
      .andWhere('system.nextReviewDate <= :today', { today })
      .andWhere('system.status = :status', { status: AISystemStatus.ACTIVE })
      .getMany();
  }

  async getFlaggedDecisions(organizationId: string): Promise<AIDecisionLog[]> {
    return this.decisionLogRepository.find({
      where: {
        organizationId,
        auditFlagged: true,
        humanReviewed: false,
      },
      order: { decisionTimestamp: 'DESC' },
      relations: ['aiSystem'],
    });
  }
}
