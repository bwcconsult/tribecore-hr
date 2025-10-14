import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like } from 'typeorm';
import { HRCase, CaseStatus, CasePriority, CaseComment, CaseActivity } from '../entities/hr-case.entity';
import {
  CreateHRCaseDto,
  UpdateHRCaseDto,
  AssignCaseDto,
  ResolveCaseDto,
  AddCaseCommentDto,
  RateCaseDto,
  GetCasesQueryDto,
} from '../dto/hrsd.dto';

@Injectable()
export class CaseManagementService {
  constructor(
    @InjectRepository(HRCase)
    private readonly caseRepository: Repository<HRCase>,
    @InjectRepository(CaseComment)
    private readonly commentRepository: Repository<CaseComment>,
    @InjectRepository(CaseActivity)
    private readonly activityRepository: Repository<CaseActivity>,
  ) {}

  // ============ Case Management ============

  async createCase(dto: CreateHRCaseDto): Promise<HRCase> {
    // Generate case number
    const count = await this.caseRepository.count({ where: { organizationId: dto.organizationId } });
    const caseNumber = `CASE-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Set SLA targets based on priority and case type
    const slaTargets = this.calculateSLA(dto.priority || CasePriority.MEDIUM, dto.caseType);

    const hrCase = this.caseRepository.create({
      ...dto,
      caseNumber,
      status: CaseStatus.NEW,
      createdTimestamp: new Date(),
      firstResponseSLA: slaTargets.firstResponse,
      resolutionSLA: slaTargets.resolution,
    });

    const saved = await this.caseRepository.save(hrCase);

    // Log activity
    await this.logActivity(saved.id, 'CREATED', `Case created by ${dto.employeeId}`, dto.employeeId);

    return saved;
  }

  async updateCase(id: string, dto: UpdateHRCaseDto): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({ where: { id } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    const oldStatus = hrCase.status;
    const oldPriority = hrCase.priority;

    Object.assign(hrCase, dto);

    // Track status changes
    if (dto.status && dto.status !== oldStatus) {
      if (dto.status === CaseStatus.RESOLVED) {
        hrCase.resolvedAt = new Date();
      } else if (dto.status === CaseStatus.CLOSED) {
        hrCase.closedAt = new Date();
      }

      await this.logActivity(
        id,
        'STATUS_CHANGED',
        `Status changed from ${oldStatus} to ${dto.status}`,
        null,
        [{ field: 'status', oldValue: oldStatus, newValue: dto.status }],
      );
    }

    // Track priority changes
    if (dto.priority && dto.priority !== oldPriority) {
      await this.logActivity(
        id,
        'PRIORITY_CHANGED',
        `Priority changed from ${oldPriority} to ${dto.priority}`,
        null,
        [{ field: 'priority', oldValue: oldPriority, newValue: dto.priority }],
      );

      // Recalculate SLA
      const slaTargets = this.calculateSLA(dto.priority, hrCase.caseType);
      hrCase.firstResponseSLA = slaTargets.firstResponse;
      hrCase.resolutionSLA = slaTargets.resolution;
    }

    // Check SLA breach
    this.checkSLABreach(hrCase);

    return this.caseRepository.save(hrCase);
  }

  async assignCase(dto: AssignCaseDto): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({ where: { id: dto.caseId } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    const oldAssignee = hrCase.assignedTo;

    hrCase.assignedTo = dto.assignedTo;
    hrCase.assignedAt = new Date();
    hrCase.assignedBy = dto.assignedBy;
    hrCase.status = CaseStatus.ASSIGNED;

    await this.logActivity(
      dto.caseId,
      'ASSIGNED',
      `Case assigned to ${dto.assignedTo}${oldAssignee ? ` (previously ${oldAssignee})` : ''}`,
      dto.assignedBy,
      [{ field: 'assignedTo', oldValue: oldAssignee, newValue: dto.assignedTo }],
    );

    return this.caseRepository.save(hrCase);
  }

  async resolveCase(dto: ResolveCaseDto): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({ where: { id: dto.caseId } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    hrCase.status = CaseStatus.RESOLVED;
    hrCase.resolution = dto.resolution;
    hrCase.resolutionCategory = dto.resolutionCategory;
    hrCase.resolvedAt = new Date();
    hrCase.resolvedBy = dto.resolvedBy;

    // Check resolution SLA
    this.checkSLABreach(hrCase);

    await this.logActivity(
      dto.caseId,
      'RESOLVED',
      `Case resolved: ${dto.resolutionCategory}`,
      dto.resolvedBy,
    );

    return this.caseRepository.save(hrCase);
  }

  async closeCase(caseId: string, closedBy: string): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    if (hrCase.status !== CaseStatus.RESOLVED) {
      throw new BadRequestException('Case must be resolved before closing');
    }

    hrCase.status = CaseStatus.CLOSED;
    hrCase.closedAt = new Date();

    await this.logActivity(caseId, 'CLOSED', 'Case closed', closedBy);

    return this.caseRepository.save(hrCase);
  }

  async escalateCase(caseId: string, escalatedTo: string, reason: string, escalatedBy: string): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    hrCase.escalated = true;
    hrCase.escalatedTo = escalatedTo;
    hrCase.escalatedAt = new Date();
    hrCase.escalationReason = reason;
    hrCase.priority = CasePriority.URGENT; // Auto-escalate priority

    await this.logActivity(
      caseId,
      'ESCALATED',
      `Case escalated to ${escalatedTo}: ${reason}`,
      escalatedBy,
    );

    return this.caseRepository.save(hrCase);
  }

  async addComment(dto: AddCaseCommentDto): Promise<CaseComment> {
    const hrCase = await this.caseRepository.findOne({ where: { id: dto.caseId } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    const comment = this.commentRepository.create({
      ...dto,
      commentedAt: new Date(),
    });

    const saved = await this.commentRepository.save(comment);

    // Update first response time if this is the first response
    if (!hrCase.firstResponseAt && !dto.isInternal) {
      hrCase.firstResponseAt = new Date();
      await this.caseRepository.save(hrCase);
    }

    await this.logActivity(
      dto.caseId,
      'COMMENTED',
      `Comment added by ${dto.authorName}${dto.isInternal ? ' (internal)' : ''}`,
      dto.authorId,
    );

    return saved;
  }

  async rateCase(dto: RateCaseDto): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({ where: { id: dto.caseId } });
    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    if (hrCase.status !== CaseStatus.CLOSED) {
      throw new BadRequestException('Can only rate closed cases');
    }

    hrCase.satisfactionScore = dto.satisfactionScore;
    hrCase.satisfactionComments = dto.satisfactionComments;
    hrCase.satisfactionSurveyCompletedAt = new Date();

    await this.logActivity(
      dto.caseId,
      'RATED',
      `Satisfaction score: ${dto.satisfactionScore}/5`,
      null,
    );

    return this.caseRepository.save(hrCase);
  }

  async getCases(query: GetCasesQueryDto): Promise<{
    data: HRCase[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, startDate, endDate, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = { ...filters };

    if (startDate && endDate) {
      where.createdTimestamp = Between(startDate, endDate);
    }

    const [data, total] = await this.caseRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdTimestamp: 'DESC' },
      relations: ['employee', 'assignee', 'comments', 'activities'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCaseById(id: string): Promise<HRCase> {
    const hrCase = await this.caseRepository.findOne({
      where: { id },
      relations: ['employee', 'assignee', 'comments', 'activities'],
    });

    if (!hrCase) {
      throw new NotFoundException('Case not found');
    }

    return hrCase;
  }

  async getCaseComments(caseId: string, includeInternal: boolean = false): Promise<CaseComment[]> {
    const where: any = { caseId };
    if (!includeInternal) {
      where.isInternal = false;
    }

    return this.commentRepository.find({
      where,
      order: { commentedAt: 'ASC' },
      relations: ['author'],
    });
  }

  async getCaseActivities(caseId: string): Promise<CaseActivity[]> {
    return this.activityRepository.find({
      where: { caseId },
      order: { occurredAt: 'ASC' },
    });
  }

  // ============ Analytics & Reporting ============

  async getCaseMetrics(organizationId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = { organizationId };
    if (startDate && endDate) {
      where.createdTimestamp = Between(startDate, endDate);
    }

    const allCases = await this.caseRepository.find({ where });

    const totalCases = allCases.length;
    const resolvedCases = allCases.filter(c => c.status === CaseStatus.RESOLVED || c.status === CaseStatus.CLOSED).length;
    const openCases = totalCases - resolvedCases;
    const slaBreached = allCases.filter(c => c.slaBreached).length;

    // Average resolution time (in hours)
    const resolvedWithTime = allCases.filter(c => c.resolvedAt && c.createdTimestamp);
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, c) => {
          const diff = new Date(c.resolvedAt!).getTime() - new Date(c.createdTimestamp).getTime();
          return sum + (diff / (1000 * 60 * 60)); // Convert to hours
        }, 0) / resolvedWithTime.length
      : 0;

    // Cases by type
    const casesByType = allCases.reduce((acc, c) => {
      acc[c.caseType] = (acc[c.caseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cases by status
    const casesByStatus = allCases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average satisfaction
    const ratedCases = allCases.filter(c => c.satisfactionScore);
    const avgSatisfaction = ratedCases.length > 0
      ? ratedCases.reduce((sum, c) => sum + c.satisfactionScore!, 0) / ratedCases.length
      : null;

    return {
      totalCases,
      openCases,
      resolvedCases,
      resolutionRate: totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0,
      slaBreached,
      slaComplianceRate: totalCases > 0 ? ((totalCases - slaBreached) / totalCases) * 100 : 0,
      avgResolutionTimeHours: avgResolutionTime,
      avgSatisfactionScore: avgSatisfaction,
      casesByType,
      casesByStatus,
    };
  }

  // ============ Helper Methods ============

  private calculateSLA(priority: CasePriority, caseType: any): { firstResponse: number; resolution: number } {
    // SLA in minutes
    const slaMatrix: Record<CasePriority, { firstResponse: number; resolution: number }> = {
      [CasePriority.LOW]: { firstResponse: 1440, resolution: 7200 }, // 1 day, 5 days
      [CasePriority.MEDIUM]: { firstResponse: 480, resolution: 2880 }, // 8 hours, 2 days
      [CasePriority.HIGH]: { firstResponse: 120, resolution: 1440 }, // 2 hours, 1 day
      [CasePriority.URGENT]: { firstResponse: 30, resolution: 480 }, // 30 min, 8 hours
    };

    return slaMatrix[priority];
  }

  private checkSLABreach(hrCase: HRCase): void {
    const now = new Date();

    // Check first response SLA
    if (!hrCase.firstResponseAt && hrCase.firstResponseSLA) {
      const minutesSinceCreated = (now.getTime() - new Date(hrCase.createdTimestamp).getTime()) / (1000 * 60);
      if (minutesSinceCreated > hrCase.firstResponseSLA) {
        hrCase.slaBreached = true;
        hrCase.slaBreachReason = 'First response SLA breached';
      }
    }

    // Check resolution SLA
    if (hrCase.status !== CaseStatus.RESOLVED && hrCase.status !== CaseStatus.CLOSED && hrCase.resolutionSLA) {
      const minutesSinceCreated = (now.getTime() - new Date(hrCase.createdTimestamp).getTime()) / (1000 * 60);
      if (minutesSinceCreated > hrCase.resolutionSLA) {
        hrCase.slaBreached = true;
        hrCase.slaBreachReason = 'Resolution SLA breached';
      }
    }
  }

  private async logActivity(
    caseId: string,
    activityType: string,
    description: string,
    performedBy: string | null,
    changes?: any[],
  ): Promise<void> {
    const activity = this.activityRepository.create({
      caseId,
      activityType,
      description,
      performedBy,
      performedByName: performedBy, // In real app, fetch user name
      changes,
      occurredAt: new Date(),
    });

    await this.activityRepository.save(activity);
  }
}
