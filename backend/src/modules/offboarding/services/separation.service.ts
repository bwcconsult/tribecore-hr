import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeparationCase, SeparationType, SeparationStatus } from '../entities/separation-case.entity';
import { NoticeTerms } from '../entities/notice-terms.entity';
import { SeveranceCalculation } from '../entities/severance-calc.entity';
import { SeparationTask, TaskType } from '../entities/separation-task.entity';

/**
 * SeparationService
 * Core business logic for employee exits
 */
@Injectable()
export class SeparationService {
  constructor(
    @InjectRepository(SeparationCase)
    private caseRepo: Repository<SeparationCase>,
    @InjectRepository(NoticeTerms)
    private noticeRepo: Repository<NoticeTerms>,
    @InjectRepository(SeveranceCalculation)
    private severanceRepo: Repository<SeveranceCalculation>,
    @InjectRepository(SeparationTask)
    private taskRepo: Repository<SeparationTask>,
  ) {}

  /**
   * Create new separation case
   */
  async createCase(data: {
    employeeId: string;
    organizationId: string;
    type: SeparationType;
    reasonCode?: string;
    reasonDetails?: string;
    proposedLeaveDate: Date;
    createdBy: string;
    metadata?: any;
  }): Promise<SeparationCase> {
    const separationCase = this.caseRepo.create({
      ...data,
      initiationDate: new Date(),
      status: SeparationStatus.DRAFT,
    });

    // Calculate initial risk score
    separationCase.calculateRiskScore();

    await this.caseRepo.save(separationCase);

    // Generate default offboarding tasks
    await this.generateDefaultTasks(separationCase);

    return separationCase;
  }

  /**
   * Generate standard offboarding tasks
   */
  private async generateDefaultTasks(separationCase: SeparationCase): Promise<void> {
    const leaveDate = new Date(separationCase.proposedLeaveDate);
    const taskTemplates = [
      {
        type: TaskType.ACCESS_REVOKE,
        title: 'Revoke system access',
        ownerTeam: 'IT',
        daysBeforeLeave: 0, // On leave date
        isBlocking: true,
      },
      {
        type: TaskType.ASSET_RETURN,
        title: 'Collect company assets',
        ownerTeam: 'IT',
        daysBeforeLeave: -1, // Day before leave
        isBlocking: true,
      },
      {
        type: TaskType.KNOWLEDGE_TRANSFER,
        title: 'Complete knowledge transfer',
        ownerTeam: 'MANAGER',
        daysBeforeLeave: -7, // Week before
        isBlocking: false,
      },
      {
        type: TaskType.EXIT_INTERVIEW,
        title: 'Conduct exit interview',
        ownerTeam: 'HR',
        daysBeforeLeave: -3,
        isBlocking: false,
      },
      {
        type: TaskType.BENEFITS_TERMINATION,
        title: 'Process benefits termination',
        ownerTeam: 'HR',
        daysBeforeLeave: 0,
        isBlocking: true,
      },
      {
        type: TaskType.PAYROLL_NOTIFICATION,
        title: 'Notify payroll of termination',
        ownerTeam: 'HR',
        daysBeforeLeave: -7,
        isBlocking: true,
      },
    ];

    for (const template of taskTemplates) {
      const dueDate = new Date(leaveDate);
      dueDate.setDate(dueDate.getDate() + template.daysBeforeLeave);

      await this.taskRepo.save(
        this.taskRepo.create({
          caseId: separationCase.id,
          organizationId: separationCase.organizationId,
          type: template.type,
          title: template.title,
          ownerTeam: template.ownerTeam,
          dueDate,
          isBlocking: template.isBlocking,
          priority: template.isBlocking ? 1 : 2,
        }),
      );
    }
  }

  /**
   * Calculate notice terms
   */
  async calculateNotice(
    caseId: string,
    tenureYears: number,
    contractualDays: number,
    country: string,
  ): Promise<NoticeTerms> {
    const separationCase = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!separationCase) throw new NotFoundException('Case not found');

    const { statutory, contractual, total } = NoticeTerms.calculateNoticeDays(
      tenureYears,
      contractualDays,
      country,
    );

    const noticeStart = new Date();
    const noticeEnd = new Date();
    noticeEnd.setDate(noticeEnd.getDate() + total);

    const notice = this.noticeRepo.create({
      caseId,
      organizationId: separationCase.organizationId,
      noticeStart,
      noticeEnd,
      noticeDays: total,
      statutoryNoticeDays: statutory,
      contractualNoticeDays: contractual,
    });

    return this.noticeRepo.save(notice);
  }

  /**
   * Calculate severance package
   */
  async calculateSeverance(
    caseId: string,
    data: {
      basePay: number;
      tenureYears: number;
      country: string;
      multiplier?: number;
      holidayHours?: number;
      toilHours?: number;
      age?: number;
    },
  ): Promise<SeveranceCalculation> {
    const separationCase = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!separationCase) throw new NotFoundException('Case not found');

    const calc = this.severanceRepo.create({
      caseId,
      organizationId: separationCase.organizationId,
      country: data.country,
      basePay: data.basePay,
      tenureYears: data.tenureYears,
      multiplier: data.multiplier || 1,
    });

    // Calculate statutory severance (UK example)
    if (data.country === 'GB' && data.age) {
      const weeklyPay = data.basePay / 52;
      calc.statutoryAmount = SeveranceCalculation.calculateUKStatutoryRedundancy(
        weeklyPay,
        data.tenureYears,
        data.age,
      );
    }

    // Holiday payout
    if (data.holidayHours) {
      const hourlyRate = data.basePay / 1950; // Approx 37.5h week * 52
      calc.holidayPayoutHours = data.holidayHours;
      calc.holidayPayoutAmount = data.holidayHours * hourlyRate;
    }

    // TOIL payout
    if (data.toilHours) {
      const hourlyRate = data.basePay / 1950;
      calc.toilPayoutHours = data.toilHours;
      calc.toilPayoutAmount = data.toilHours * hourlyRate;
    }

    // UK tax-free allowance
    if (data.country === 'GB') {
      calc.taxFreeAllowance = 30000;
    }

    // Calculate totals
    calc.calculate();

    await this.severanceRepo.save(calc);

    // Update case
    separationCase.finalPayCalculated = true;
    await this.caseRepo.save(separationCase);

    return calc;
  }

  /**
   * Approve separation case
   */
  async approveCase(caseId: string, approvedBy: string): Promise<SeparationCase> {
    const separationCase = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!separationCase) throw new NotFoundException('Case not found');

    if (separationCase.status !== SeparationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Case not pending approval');
    }

    separationCase.status = SeparationStatus.APPROVED;
    separationCase.approvedBy = approvedBy;
    separationCase.approvedAt = new Date();

    return this.caseRepo.save(separationCase);
  }

  /**
   * Complete offboarding
   */
  async completeCase(caseId: string): Promise<SeparationCase> {
    const separationCase = await this.caseRepo.findOne({ where: { id: caseId } });
    if (!separationCase) throw new NotFoundException('Case not found');

    if (!separationCase.isOffboardingComplete()) {
      throw new BadRequestException('All offboarding tasks must be complete');
    }

    separationCase.status = SeparationStatus.COMPLETED;
    separationCase.actualLeaveDate = new Date();

    return this.caseRepo.save(separationCase);
  }

  /**
   * Get case with all details
   */
  async getCaseDetails(caseId: string): Promise<any> {
    const separationCase = await this.caseRepo.findOne({
      where: { id: caseId },
      relations: ['employee'],
    });

    if (!separationCase) throw new NotFoundException('Case not found');

    const notice = await this.noticeRepo.findOne({ where: { caseId } });
    const severance = await this.severanceRepo.findOne({ where: { caseId } });
    const tasks = await this.taskRepo.find({ where: { caseId } });

    return {
      case: separationCase,
      notice,
      severance,
      tasks,
      completionPercentage: this.calculateCompletionPercentage(tasks),
    };
  }

  /**
   * Calculate case completion %
   */
  private calculateCompletionPercentage(tasks: SeparationTask[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  }

  /**
   * Get cases by status
   */
  async getCasesByStatus(
    organizationId: string,
    status?: SeparationStatus,
  ): Promise<SeparationCase[]> {
    const where: any = { organizationId };
    if (status) where.status = status;

    return this.caseRepo.find({
      where,
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }
}
