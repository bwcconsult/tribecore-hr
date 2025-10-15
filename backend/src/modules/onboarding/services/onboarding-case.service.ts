import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardCase, OnboardingStatus } from '../entities/onboard-case.entity';
import { OnboardingTask, TaskStatus } from '../entities/onboarding-task.entity';
import { CreateOnboardingCaseDto } from '../dto/create-onboarding-case.dto';

@Injectable()
export class OnboardingCaseService {
  constructor(
    @InjectRepository(OnboardCase)
    private readonly caseRepository: Repository<OnboardCase>,
    @InjectRepository(OnboardingTask)
    private readonly taskRepository: Repository<OnboardingTask>,
  ) {}

  /**
   * Create onboarding case manually (not from template)
   */
  async createCase(dto: CreateOnboardingCaseDto): Promise<OnboardCase> {
    const onboardCase = this.caseRepository.create(dto);
    return this.caseRepository.save(onboardCase);
  }

  /**
   * Get case by ID with all relations
   */
  async getCase(id: string): Promise<OnboardCase> {
    const onboardCase = await this.caseRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!onboardCase) {
      throw new NotFoundException(`Onboarding case with ID ${id} not found`);
    }

    return onboardCase;
  }

  /**
   * Get cases with filters and pagination
   */
  async getCases(filters: {
    organizationId: string;
    status?: OnboardingStatus;
    ownerId?: string;
    department?: string;
    country?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: OnboardCase[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.caseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.employee', 'employee')
      .where('case.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });

    if (filters.status) {
      query.andWhere('case.status = :status', { status: filters.status });
    }

    if (filters.department) {
      query.andWhere('case.department = :department', { department: filters.department });
    }

    if (filters.country) {
      query.andWhere('case.country = :country', { country: filters.country });
    }

    const [data, total] = await query
      .orderBy('case.startDate', 'DESC')
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
   * Get case with tasks
   */
  async getCaseWithTasks(id: string): Promise<OnboardCase & { tasks: OnboardingTask[] }> {
    const onboardCase = await this.getCase(id);

    const tasks = await this.taskRepository.find({
      where: { caseId: id },
      order: { dueDate: 'ASC' },
    });

    return { ...onboardCase, tasks } as any;
  }

  /**
   * Update case status with gate checking
   */
  async updateCaseStatus(id: string, newStatus: OnboardingStatus): Promise<OnboardCase> {
    const onboardCase = await this.getCase(id);

    // Gate checks: cannot transition to DAY1 unless prerequisites are met
    if (newStatus === OnboardingStatus.IN_PROGRESS) {
      const isReady = await this.checkDay1Readiness(id);
      if (!isReady.ready) {
        throw new BadRequestException(
          `Cannot move to Day 1. Missing requirements: ${isReady.missing.join(', ')}`,
        );
      }
    }

    onboardCase.status = newStatus;

    // Set timestamps based on status
    if (newStatus === OnboardingStatus.COMPLETED) {
      // Mark completion
      onboardCase.day1ChecklistComplete = true;
    }

    return this.caseRepository.save(onboardCase);
  }

  /**
   * Check if case is ready for Day 1
   * Business Rule: PREBOARDING and PROVISIONING tasks must be DONE
   */
  async checkDay1Readiness(
    caseId: string,
  ): Promise<{ ready: boolean; missing: string[]; progress: number }> {
    const tasks = await this.taskRepository.find({
      where: { caseId },
    });

    const missing: string[] = [];

    // Check preboarding tasks
    const preboardingTasks = tasks.filter(
      (t) => t.metadata?.category === 'PREBOARDING' || t.dueDate < new Date(),
    );
    const preboardingComplete = preboardingTasks.every((t) => t.status === TaskStatus.DONE);

    if (!preboardingComplete) {
      missing.push('Preboarding tasks not complete');
    }

    // Check provisioning tasks
    const provisioningTasks = tasks.filter((t) => t.metadata?.category === 'PROVISIONING');
    const provisioningComplete = provisioningTasks.every((t) => t.status === TaskStatus.DONE);

    if (!provisioningComplete) {
      missing.push('Provisioning tasks not complete');
    }

    // Calculate progress
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return {
      ready: missing.length === 0,
      missing,
      progress,
    };
  }

  /**
   * Get overdue tasks for a case
   */
  async getOverdueTasks(caseId: string): Promise<OnboardingTask[]> {
    const now = new Date();

    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.caseId = :caseId', { caseId })
      .andWhere('task.dueDate < :now', { now })
      .andWhere('task.status != :done', { done: TaskStatus.DONE })
      .orderBy('task.dueDate', 'ASC')
      .getMany();
  }

  /**
   * Get blocked tasks for a case
   */
  async getBlockedTasks(caseId: string): Promise<OnboardingTask[]> {
    return this.taskRepository.find({
      where: { caseId, status: TaskStatus.BLOCKED },
      order: { dueDate: 'ASC' },
    });
  }

  /**
   * Update case fields
   */
  async updateCase(id: string, updates: Partial<OnboardCase>): Promise<OnboardCase> {
    const onboardCase = await this.getCase(id);
    Object.assign(onboardCase, updates);
    return this.caseRepository.save(onboardCase);
  }

  /**
   * Delete case (soft delete)
   */
  async deleteCase(id: string): Promise<void> {
    const onboardCase = await this.getCase(id);
    await this.caseRepository.softRemove(onboardCase);
  }

  /**
   * Get dashboard stats for HR
   */
  async getDashboardStats(organizationId: string): Promise<{
    total: number;
    active: number;
    atRisk: number;
    overdueTasks: number;
    completionRate: number;
  }> {
    const cases = await this.caseRepository.find({
      where: { organizationId },
    });

    const total = cases.length;
    const active = cases.filter(
      (c) =>
        c.status === OnboardingStatus.PRE_BOARDING || c.status === OnboardingStatus.IN_PROGRESS,
    ).length;

    // Cases are "at risk" if they have overdue tasks
    let atRisk = 0;
    let totalOverdueTasks = 0;

    for (const c of cases) {
      const overdue = await this.getOverdueTasks(c.id);
      if (overdue.length > 0) {
        atRisk++;
        totalOverdueTasks += overdue.length;
      }
    }

    const completed = cases.filter((c) => c.status === OnboardingStatus.COMPLETED).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      active,
      atRisk,
      overdueTasks: totalOverdueTasks,
      completionRate,
    };
  }
}
