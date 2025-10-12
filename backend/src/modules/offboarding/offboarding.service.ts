import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OffboardingProcess, OffboardingStatus, OffboardingReason } from './entities/offboarding.entity';
import { OffboardingTask, TaskStatus } from './entities/offboarding-task.entity';
import { ExitInterview } from './entities/exit-interview.entity';
import { CreateOffboardingDto, CreateOffboardingTaskDto, CreateExitInterviewDto, UpdateFinalSettlementDto } from './dto/create-offboarding.dto';

@Injectable()
export class OffboardingService {
  constructor(
    @InjectRepository(OffboardingProcess)
    private processRepository: Repository<OffboardingProcess>,
    @InjectRepository(OffboardingTask)
    private taskRepository: Repository<OffboardingTask>,
    @InjectRepository(ExitInterview)
    private interviewRepository: Repository<ExitInterview>,
  ) {}

  // ===== OFFBOARDING PROCESSES =====

  async createOffboarding(createDto: CreateOffboardingDto, initiatedBy: string): Promise<OffboardingProcess> {
    const process = this.processRepository.create({
      ...createDto,
      initiatedBy,
      status: OffboardingStatus.PLANNED,
    });

    const saved = await this.processRepository.save(process);

    // Create default tasks based on reason
    await this.createDefaultTasks(saved.id, createDto.reason);

    return saved;
  }

  async findAllOffboarding(filters: {
    organizationId?: string;
    status?: OffboardingStatus;
    reason?: OffboardingReason;
  }): Promise<OffboardingProcess[]> {
    const queryBuilder = this.processRepository.createQueryBuilder('process');

    if (filters.organizationId) {
      queryBuilder.andWhere('process.organizationId = :orgId', { orgId: filters.organizationId });
    }

    if (filters.status) {
      queryBuilder.andWhere('process.status = :status', { status: filters.status });
    }

    if (filters.reason) {
      queryBuilder.andWhere('process.reason = :reason', { reason: filters.reason });
    }

    return queryBuilder.orderBy('process.lastWorkingDay', 'ASC').getMany();
  }

  async getOffboardingById(id: string): Promise<OffboardingProcess> {
    const process = await this.processRepository.findOne({ where: { id } });
    if (!process) {
      throw new NotFoundException('Offboarding process not found');
    }
    return process;
  }

  async getOffboardingWithDetails(id: string) {
    const process = await this.getOffboardingById(id);
    const tasks = await this.taskRepository.find({
      where: { offboardingProcessId: id },
      order: { order: 'ASC' },
    });
    const interview = await this.interviewRepository.findOne({
      where: { offboardingProcessId: id },
    });

    return {
      process,
      tasks,
      interview,
    };
  }

  async updateOffboardingStatus(id: string, status: OffboardingStatus): Promise<OffboardingProcess> {
    const process = await this.getOffboardingById(id);
    process.status = status;
    return this.processRepository.save(process);
  }

  async updateFinalSettlement(id: string, settlementDto: UpdateFinalSettlementDto): Promise<OffboardingProcess> {
    const process = await this.getOffboardingById(id);

    const totalPayment = 
      (settlementDto.finalSalary || 0) +
      (settlementDto.leavePayment || 0) +
      (settlementDto.severancePay || 0) +
      (settlementDto.bonuses || 0) +
      (settlementDto.otherPayments || 0);

    process.finalSettlement = {
      ...settlementDto,
      totalPayment,
    };

    return this.processRepository.save(process);
  }

  async revokeAccess(id: string): Promise<OffboardingProcess> {
    const process = await this.getOffboardingById(id);
    process.accessRevoked = true;
    process.accessRevokedDate = new Date();
    return this.processRepository.save(process);
  }

  async markReferenceProvided(id: string): Promise<OffboardingProcess> {
    const process = await this.getOffboardingById(id);
    process.referenceProvided = true;
    process.referenceProvidedDate = new Date();
    return this.processRepository.save(process);
  }

  // ===== TASKS =====

  async createTask(createDto: CreateOffboardingTaskDto): Promise<OffboardingTask> {
    const task = this.taskRepository.create(createDto);
    const saved = await this.taskRepository.save(task);
    await this.updateCompletionPercentage(createDto.offboardingProcessId);
    return saved;
  }

  async getProcessTasks(processId: string): Promise<OffboardingTask[]> {
    return this.taskRepository.find({
      where: { offboardingProcessId: processId },
      order: { order: 'ASC' },
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    completedBy?: string,
    completionNotes?: string,
  ): Promise<OffboardingTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = status;
    if (status === TaskStatus.COMPLETED) {
      task.completedBy = completedBy;
      task.completedAt = new Date();
      task.completionNotes = completionNotes;
    }

    const saved = await this.taskRepository.save(task);
    await this.updateCompletionPercentage(task.offboardingProcessId);
    return saved;
  }

  private async createDefaultTasks(processId: string, reason: OffboardingReason): Promise<void> {
    const defaultTasks = [
      { title: 'Collect company equipment', category: 'IT', order: 1 },
      { title: 'Revoke system access', category: 'IT', order: 2 },
      { title: 'Conduct exit interview', category: 'HR', order: 3 },
      { title: 'Process final payroll', category: 'FINANCE', order: 4 },
      { title: 'Calculate final settlement', category: 'FINANCE', order: 5 },
      { title: 'Knowledge transfer', category: 'MANAGER', order: 6 },
      { title: 'Update organizational chart', category: 'HR', order: 7 },
      { title: 'Provide reference letter', category: 'HR', order: 8 },
      { title: 'Remove from mailing lists', category: 'IT', order: 9 },
      { title: 'Archive employee records', category: 'HR', order: 10 },
    ];

    if (reason === OffboardingReason.REDUNDANCY) {
      defaultTasks.push(
        { title: 'Conduct redundancy consultation', category: 'HR', order: 0 },
        { title: 'Offer alternative roles', category: 'HR', order: 0 },
        { title: 'Calculate redundancy package', category: 'FINANCE', order: 1 },
      );
    }

    const tasks = defaultTasks.map((task) => 
      this.taskRepository.create({
        offboardingProcessId: processId,
        ...task,
        isRequired: true,
      })
    );

    await this.taskRepository.save(tasks);
  }

  private async updateCompletionPercentage(processId: string): Promise<void> {
    const tasks = await this.getProcessTasks(processId);
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    await this.processRepository.update(processId, { completionPercentage });

    // Auto-update status if all tasks completed
    if (completionPercentage === 100) {
      await this.updateOffboardingStatus(processId, OffboardingStatus.COMPLETED);
    }
  }

  // ===== EXIT INTERVIEWS =====

  async createExitInterview(createDto: CreateExitInterviewDto, conductedBy: string): Promise<ExitInterview> {
    const interview = this.interviewRepository.create({
      ...createDto,
      conductedBy,
    });

    const saved = await this.interviewRepository.save(interview);

    // Update offboarding process
    await this.processRepository.update(createDto.offboardingProcessId, {
      exitInterviewDate: createDto.interviewDate,
      exitInterviewConductedBy: conductedBy,
    });

    return saved;
  }

  async getExitInterview(processId: string): Promise<ExitInterview> {
    const interview = await this.interviewRepository.findOne({
      where: { offboardingProcessId: processId },
    });
    if (!interview) {
      throw new NotFoundException('Exit interview not found');
    }
    return interview;
  }

  // ===== ANALYTICS =====

  async getOffboardingAnalytics(organizationId: string, startDate: Date, endDate: Date) {
    const processes = await this.processRepository.find({
      where: { organizationId },
    });

    const filtered = processes.filter((p) => {
      const lwd = new Date(p.lastWorkingDay);
      return lwd >= startDate && lwd <= endDate;
    });

    const totalOffboarding = filtered.length;
    const byReason = filtered.reduce((acc, p) => {
      acc[p.reason] = (acc[p.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = filtered.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const redundancies = filtered.filter((p) => p.reason === OffboardingReason.REDUNDANCY).length;
    const voluntaryDepartures = filtered.filter((p) => 
      p.reason === OffboardingReason.RESIGNATION || p.reason === OffboardingReason.RETIREMENT
    ).length;

    const avgCompletionPercentage = filtered.length > 0 
      ? filtered.reduce((sum, p) => sum + p.completionPercentage, 0) / filtered.length 
      : 0;

    return {
      totalOffboarding,
      redundancies,
      voluntaryDepartures,
      byReason,
      byStatus,
      avgCompletionPercentage,
      turnoverRate: 0, // Would need total employee count to calculate
    };
  }

  async getExitInterviewInsights(organizationId: string) {
    const processes = await this.processRepository.find({
      where: { organizationId },
    });

    const processIds = processes.map((p) => p.id);
    const interviews = await this.interviewRepository.find({
      where: { offboardingProcessId: In(processIds) },
    });

    const avgSatisfaction = interviews.length > 0
      ? interviews.reduce((sum, i) => sum + (i.overallSatisfactionRating || 0), 0) / interviews.length
      : 0;

    const wouldRehireCount = interviews.filter((i) => i.wouldRehire).length;
    const openToReturningCount = interviews.filter((i) => i.openToReturning).length;

    const topImprovementAreas: string[] = [];
    interviews.forEach((i) => {
      if (i.improvementSuggestions) {
        topImprovementAreas.push(...i.improvementSuggestions);
      }
    });

    const improvementFrequency = topImprovementAreas.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInterviews: interviews.length,
      avgSatisfaction,
      wouldRehireRate: interviews.length > 0 ? (wouldRehireCount / interviews.length) * 100 : 0,
      openToReturningRate: interviews.length > 0 ? (openToReturningCount / interviews.length) * 100 : 0,
      topImprovementAreas: Object.entries(improvementFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }
}
