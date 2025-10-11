import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingWorkflow } from './entities/onboarding.entity';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingWorkflow)
    private readonly onboardingRepository: Repository<OnboardingWorkflow>,
  ) {}

  async create(createOnboardingDto: CreateOnboardingDto): Promise<OnboardingWorkflow> {
    const workflow = this.onboardingRepository.create(createOnboardingDto);
    return await this.onboardingRepository.save(workflow);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: OnboardingWorkflow[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.onboardingRepository
      .createQueryBuilder('workflow')
      .leftJoinAndSelect('workflow.employee', 'employee')
      .where('workflow.organizationId = :organizationId', { organizationId });

    if (search) {
      query.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('workflow.startDate', 'DESC')
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

  async findOne(id: string): Promise<OnboardingWorkflow> {
    const workflow = await this.onboardingRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!workflow) {
      throw new NotFoundException(`Onboarding workflow with ID ${id} not found`);
    }
    return workflow;
  }

  async findByEmployee(employeeId: string): Promise<OnboardingWorkflow> {
    const workflow = await this.onboardingRepository.findOne({
      where: { employeeId },
      relations: ['employee'],
    });
    if (!workflow) {
      throw new NotFoundException(`Onboarding workflow for employee ${employeeId} not found`);
    }
    return workflow;
  }

  async update(id: string, updateOnboardingDto: UpdateOnboardingDto): Promise<OnboardingWorkflow> {
    const workflow = await this.findOne(id);
    Object.assign(workflow, updateOnboardingDto);
    
    // Recalculate progress
    if (updateOnboardingDto.tasks) {
      const completedTasks = updateOnboardingDto.tasks.filter(t => t.status === 'COMPLETED').length;
      workflow.completedTasksCount = completedTasks;
      workflow.progressPercentage = (completedTasks / workflow.totalTasksCount) * 100;
    }
    
    return await this.onboardingRepository.save(workflow);
  }

  async updateTaskStatus(
    id: string,
    taskId: string,
    status: string,
    completedBy?: string,
  ): Promise<OnboardingWorkflow> {
    const workflow = await this.findOne(id);
    const taskIndex = workflow.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${taskId} not found in workflow`);
    }

    workflow.tasks[taskIndex].status = status as any;
    
    if (status === 'COMPLETED') {
      workflow.tasks[taskIndex].completedAt = new Date();
      workflow.tasks[taskIndex].completedBy = completedBy;
    }

    // Recalculate progress
    const completedTasks = workflow.tasks.filter(t => t.status === 'COMPLETED').length;
    workflow.completedTasksCount = completedTasks;
    workflow.progressPercentage = (completedTasks / workflow.totalTasksCount) * 100;

    // Check if all tasks completed
    if (completedTasks === workflow.totalTasksCount) {
      workflow.status = 'COMPLETED' as any;
      workflow.completionDate = new Date();
    }

    return await this.onboardingRepository.save(workflow);
  }

  async delete(id: string): Promise<void> {
    const workflow = await this.findOne(id);
    await this.onboardingRepository.remove(workflow);
  }

  async getStats(organizationId: string) {
    const [total, inProgress, completed, notStarted] = await Promise.all([
      this.onboardingRepository.count({ where: { organizationId } }),
      this.onboardingRepository.count({ where: { organizationId, status: 'IN_PROGRESS' } }),
      this.onboardingRepository.count({ where: { organizationId, status: 'COMPLETED' } }),
      this.onboardingRepository.count({ where: { organizationId, status: 'NOT_STARTED' } }),
    ]);

    return {
      total,
      inProgress,
      completed,
      notStarted,
    };
  }
}
