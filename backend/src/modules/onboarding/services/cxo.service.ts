import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientAccount } from '../entities/client-account.entity';
import { ClientOnboardingCase, ClientOnboardingStatus } from '../entities/client-onboarding-case.entity';
import { Workstream, WorkstreamName } from '../entities/workstream.entity';
import { COTask, COTaskStatus } from '../entities/co-task.entity';
import { CreateClientOnboardingCaseDto, UpdateClientOnboardingCaseDto } from '../dto/create-client-onboarding-case.dto';

@Injectable()
export class CXOService {
  constructor(
    @InjectRepository(ClientAccount)
    private readonly accountRepository: Repository<ClientAccount>,
    @InjectRepository(ClientOnboardingCase)
    private readonly caseRepository: Repository<ClientOnboardingCase>,
    @InjectRepository(Workstream)
    private readonly workstreamRepository: Repository<Workstream>,
    @InjectRepository(COTask)
    private readonly taskRepository: Repository<COTask>,
  ) {}

  /**
   * Create customer onboarding case from intake
   * Automatically creates default workstreams
   */
  async createCaseFromIntake(dto: CreateClientOnboardingCaseDto): Promise<ClientOnboardingCase> {
    // Verify account exists
    const account = await this.accountRepository.findOne({
      where: { id: dto.accountId },
    });

    if (!account) {
      throw new NotFoundException(`Client account with ID ${dto.accountId} not found`);
    }

    // Create the case
    const caseEntity = this.caseRepository.create({
      organizationId: dto.organizationId,
      accountId: dto.accountId,
      csmId: dto.csmId,
      tier: dto.tier,
      region: dto.region,
      goLiveTarget: dto.goLiveTarget,
      status: dto.status || ClientOnboardingStatus.INTAKE,
      risk: dto.risk || 'LOW' as any,
      completionPercentage: 0,
      gateChecks: dto.gateChecks || {
        securityApproved: false,
        legalApproved: false,
        billingApproved: false,
        uatApproved: false,
        runbookApproved: false,
      },
      metadata: dto.metadata,
    });

    const savedCase = await this.caseRepository.save(caseEntity);

    // Create default workstreams
    await this.createDefaultWorkstreams(savedCase.id);

    return this.getCase(savedCase.id);
  }

  /**
   * Create default workstreams for a case
   */
  private async createDefaultWorkstreams(caseId: string): Promise<void> {
    const defaultWorkstreams = [
      WorkstreamName.SECURITY,
      WorkstreamName.LEGAL,
      WorkstreamName.TECHNICAL,
      WorkstreamName.BILLING,
      WorkstreamName.TRAINING,
    ];

    const workstreams = defaultWorkstreams.map((name) =>
      this.workstreamRepository.create({
        caseId,
        name,
        completionPercentage: 0,
        active: true,
      }),
    );

    await this.workstreamRepository.save(workstreams);
  }

  /**
   * Get case by ID with all relations
   */
  async getCase(id: string): Promise<ClientOnboardingCase> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id },
      relations: ['account', 'workstreams', 'workstreams.tasks', 'environments', 'risks'],
    });

    if (!caseEntity) {
      throw new NotFoundException(`Client onboarding case with ID ${id} not found`);
    }

    return caseEntity;
  }

  /**
   * Get cases with filters
   */
  async getCases(filters: {
    organizationId: string;
    status?: ClientOnboardingStatus;
    csmId?: string;
    tier?: string;
    region?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ClientOnboardingCase[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.caseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.account', 'account')
      .where('case.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });

    if (filters.status) {
      query.andWhere('case.status = :status', { status: filters.status });
    }

    if (filters.csmId) {
      query.andWhere('case.csmId = :csmId', { csmId: filters.csmId });
    }

    if (filters.tier) {
      query.andWhere('case.tier = :tier', { tier: filters.tier });
    }

    if (filters.region) {
      query.andWhere('case.region = :region', { region: filters.region });
    }

    const [data, total] = await query
      .orderBy('case.goLiveTarget', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update case status with Go-Live gate checking
   */
  async updateCaseStatus(
    id: string,
    newStatus: ClientOnboardingStatus,
  ): Promise<ClientOnboardingCase> {
    const caseEntity = await this.getCase(id);

    // Gate check: cannot move to ENABLEMENT without all gates passing
    if (newStatus === ClientOnboardingStatus.ENABLEMENT) {
      const gateCheck = await this.checkGoLiveGate(id);
      if (!gateCheck.ready) {
        throw new BadRequestException(
          `Cannot move to Enablement. Missing gates: ${gateCheck.missing.join(', ')}`,
        );
      }
    }

    caseEntity.status = newStatus;

    // Set timestamps based on status
    if (newStatus === ClientOnboardingStatus.KICKOFF) {
      caseEntity.kickoffDate = new Date();
    } else if (newStatus === ClientOnboardingStatus.ENABLEMENT) {
      caseEntity.goLiveDate = new Date();
    } else if (newStatus === ClientOnboardingStatus.HYPERCARE) {
      // Set hypercare end date (typically 30 days after go-live)
      const hypercareEnd = new Date();
      hypercareEnd.setDate(hypercareEnd.getDate() + 30);
      caseEntity.hypercareEndDate = hypercareEnd;
    }

    return this.caseRepository.save(caseEntity);
  }

  /**
   * Check Go-Live gate
   * Business Rule: Security + Legal + Billing + UAT + Runbook must all be approved
   */
  async checkGoLiveGate(
    caseId: string,
  ): Promise<{ ready: boolean; missing: string[]; progress: number }> {
    const caseEntity = await this.getCase(caseId);
    const gates = caseEntity.gateChecks || {};

    const missing: string[] = [];

    if (!gates.securityApproved) missing.push('Security approval');
    if (!gates.legalApproved) missing.push('Legal approval');
    if (!gates.billingApproved) missing.push('Billing setup');
    if (!gates.uatApproved) missing.push('UAT signoff');
    if (!gates.runbookApproved) missing.push('Runbook approval');

    const totalGates = 5;
    const passedGates = totalGates - missing.length;
    const progress = Math.round((passedGates / totalGates) * 100);

    return {
      ready: missing.length === 0,
      missing,
      progress,
    };
  }

  /**
   * Update gate check
   */
  async updateGateCheck(
    id: string,
    gateName: keyof ClientOnboardingCase['gateChecks'],
    approved: boolean,
  ): Promise<ClientOnboardingCase> {
    const caseEntity = await this.getCase(id);

    caseEntity.gateChecks = {
      ...caseEntity.gateChecks,
      [gateName]: approved,
    };

    return this.caseRepository.save(caseEntity);
  }

  /**
   * Update case
   */
  async updateCase(id: string, dto: UpdateClientOnboardingCaseDto): Promise<ClientOnboardingCase> {
    const caseEntity = await this.getCase(id);
    Object.assign(caseEntity, dto);
    return this.caseRepository.save(caseEntity);
  }

  /**
   * Delete case (soft delete)
   */
  async deleteCase(id: string): Promise<void> {
    const caseEntity = await this.getCase(id);
    await this.caseRepository.softRemove(caseEntity);
  }

  /**
   * Get dashboard stats for CSMs
   */
  async getDashboardStats(organizationId: string, csmId?: string): Promise<{
    total: number;
    active: number;
    atRisk: number;
    goLiveThisMonth: number;
    avgTimeToLive: number;
    slaBreaches: number;
  }> {
    const query = this.caseRepository
      .createQueryBuilder('case')
      .where('case.organizationId = :organizationId', { organizationId });

    if (csmId) {
      query.andWhere('case.csmId = :csmId', { csmId });
    }

    const cases = await query.getMany();

    const total = cases.length;
    const active = cases.filter(
      (c) =>
        c.status !== ClientOnboardingStatus.STEADY_STATE &&
        c.status !== ClientOnboardingStatus.CHURNED,
    ).length;

    // Cases are "at risk" if go-live target is < 14 days and status is not ENABLEMENT or beyond
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const atRisk = cases.filter((c) => {
      return (
        c.goLiveTarget < twoWeeksFromNow &&
        c.status !== ClientOnboardingStatus.ENABLEMENT &&
        c.status !== ClientOnboardingStatus.HYPERCARE &&
        c.status !== ClientOnboardingStatus.STEADY_STATE
      );
    }).length;

    // Go-live this month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const goLiveThisMonth = cases.filter((c) => {
      const goLive = new Date(c.goLiveTarget);
      return goLive >= firstDayOfMonth && goLive <= lastDayOfMonth;
    }).length;

    // Calculate average time to live (kickoff to go-live)
    const completedCases = cases.filter((c) => c.goLiveDate && c.kickoffDate);
    let avgTimeToLive = 0;
    if (completedCases.length > 0) {
      const totalDays = completedCases.reduce((sum, c) => {
        const days = Math.floor(
          (c.goLiveDate.getTime() - c.kickoffDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }, 0);
      avgTimeToLive = Math.round(totalDays / completedCases.length);
    }

    // Count SLA breaches (tasks overdue)
    let slaBreaches = 0;
    for (const c of cases) {
      const workstreams = await this.workstreamRepository.find({
        where: { caseId: c.id },
        relations: ['tasks'],
      });

      for (const ws of workstreams) {
        const overdueTasks = ws.tasks.filter(
          (t) => t.dueDate < now && t.status !== COTaskStatus.DONE,
        );
        slaBreaches += overdueTasks.length;
      }
    }

    return {
      total,
      active,
      atRisk,
      goLiveThisMonth,
      avgTimeToLive,
      slaBreaches,
    };
  }

  /**
   * Calculate completion percentage for a case
   */
  async calculateCompletionPercentage(caseId: string): Promise<number> {
    const workstreams = await this.workstreamRepository.find({
      where: { caseId },
      relations: ['tasks'],
    });

    let totalTasks = 0;
    let completedTasks = 0;

    for (const ws of workstreams) {
      totalTasks += ws.tasks.length;
      completedTasks += ws.tasks.filter((t) => t.status === COTaskStatus.DONE).length;
    }

    if (totalTasks === 0) return 0;

    return Math.round((completedTasks / totalTasks) * 100);
  }
}
