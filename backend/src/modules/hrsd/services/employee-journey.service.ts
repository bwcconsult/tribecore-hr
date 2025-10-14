import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeJourney, JourneyStatus, JourneyTemplate, JourneyType } from '../entities/employee-journey.entity';
import {
  CreateEmployeeJourneyDto,
  UpdateJourneyTaskDto,
  CompleteJourneyDto,
} from '../dto/hrsd.dto';

@Injectable()
export class EmployeeJourneyService {
  constructor(
    @InjectRepository(EmployeeJourney)
    private readonly journeyRepository: Repository<EmployeeJourney>,
    @InjectRepository(JourneyTemplate)
    private readonly templateRepository: Repository<JourneyTemplate>,
  ) {}

  async createJourney(dto: CreateEmployeeJourneyDto): Promise<EmployeeJourney> {
    // Get default template for journey type
    const template = await this.templateRepository.findOne({
      where: {
        organizationId: dto.organizationId,
        journeyType: dto.journeyType,
        isDefault: true,
        isActive: true,
      },
    });

    // Generate journey ID
    const count = await this.journeyRepository.count({ where: { organizationId: dto.organizationId } });
    const journeyId = `JOURNEY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Calculate dates based on template
    const startDate = new Date(dto.startDate);
    let expectedEndDate = dto.expectedEndDate;

    if (template && template.durationDays && !expectedEndDate) {
      expectedEndDate = new Date(startDate);
      expectedEndDate.setDate(expectedEndDate.getDate() + template.durationDays);
    }

    // Initialize milestones and tasks from template
    let milestones: any[] = [];
    let tasks: any[] = [];

    if (template) {
      milestones = template.milestones.map((m, index) => {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + m.daysFromStart);

        return {
          id: `M-${Date.now()}-${index}`,
          name: m.name,
          description: m.description,
          dueDate: dueDate.toISOString(),
          status: 'PENDING',
          order: m.order,
        };
      });

      tasks = template.tasks.map((t, index) => {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + t.daysFromStart);

        return {
          id: `T-${Date.now()}-${index}`,
          title: t.title,
          description: t.description,
          category: t.category,
          assignedToRole: t.assignedToRole,
          dueDate: dueDate.toISOString(),
          status: 'TODO',
          mandatory: t.mandatory,
          order: t.order,
          metadata: t.metadata,
        };
      });
    }

    const journey = this.journeyRepository.create({
      ...dto,
      journeyId,
      name: dto.name || `${dto.journeyType} - ${dto.employeeId}`,
      startDate,
      expectedEndDate,
      status: JourneyStatus.NOT_STARTED,
      milestones,
      tasks,
      totalTasks: tasks.length,
      completedTasks: 0,
      progressPercentage: 0,
      resources: template?.resources,
    });

    return this.journeyRepository.save(journey);
  }

  async startJourney(journeyId: string): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    journey.status = JourneyStatus.IN_PROGRESS;

    return this.journeyRepository.save(journey);
  }

  async updateTask(dto: UpdateJourneyTaskDto): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: dto.journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    // Find and update the task
    const taskIndex = journey.tasks?.findIndex(t => t.id === dto.taskId);
    if (taskIndex === undefined || taskIndex === -1) {
      throw new NotFoundException('Task not found');
    }

    const task = journey.tasks![taskIndex];
    if (dto.status) task.status = dto.status;
    if (dto.completedBy) task.completedBy = dto.completedBy;
    if (dto.completedDate) task.completedDate = dto.completedDate.toISOString();

    journey.tasks![taskIndex] = task;

    // Recalculate progress
    await this.calculateProgress(journey);

    return this.journeyRepository.save(journey);
  }

  async completeTask(journeyId: string, taskId: string, completedBy: string): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    const taskIndex = journey.tasks?.findIndex(t => t.id === taskId);
    if (taskIndex === undefined || taskIndex === -1) {
      throw new NotFoundException('Task not found');
    }

    journey.tasks![taskIndex].status = 'COMPLETED';
    journey.tasks![taskIndex].completedBy = completedBy;
    journey.tasks![taskIndex].completedDate = new Date().toISOString();

    await this.calculateProgress(journey);

    // Check if all milestones completed
    const allTasksComplete = journey.tasks?.every(t => !t.mandatory || t.status === 'COMPLETED');
    if (allTasksComplete) {
      journey.status = JourneyStatus.COMPLETED;
      journey.actualEndDate = new Date();
    }

    return this.journeyRepository.save(journey);
  }

  async completeMilestone(journeyId: string, milestoneId: string): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    const milestoneIndex = journey.milestones?.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === undefined || milestoneIndex === -1) {
      throw new NotFoundException('Milestone not found');
    }

    journey.milestones![milestoneIndex].status = 'COMPLETED';
    journey.milestones![milestoneIndex].completedDate = new Date().toISOString();

    return this.journeyRepository.save(journey);
  }

  async pauseJourney(journeyId: string): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    journey.status = JourneyStatus.PAUSED;
    journey.pausedDate = new Date();

    return this.journeyRepository.save(journey);
  }

  async resumeJourney(journeyId: string): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    journey.status = JourneyStatus.IN_PROGRESS;
    journey.pausedDate = null;

    return this.journeyRepository.save(journey);
  }

  async completeJourney(dto: CompleteJourneyDto): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({ where: { id: dto.journeyId } });
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    journey.status = JourneyStatus.COMPLETED;
    journey.actualEndDate = new Date();
    journey.satisfactionScore = dto.satisfactionScore;
    journey.feedback = dto.feedback;
    journey.feedbackCollectedAt = new Date();

    return this.journeyRepository.save(journey);
  }

  async getJourney(id: string): Promise<EmployeeJourney> {
    const journey = await this.journeyRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!journey) {
      throw new NotFoundException('Journey not found');
    }

    return journey;
  }

  async getJourneysByEmployee(employeeId: string): Promise<EmployeeJourney[]> {
    return this.journeyRepository.find({
      where: { employeeId },
      order: { startDate: 'DESC' },
    });
  }

  async getActiveJourneys(organizationId: string): Promise<EmployeeJourney[]> {
    return this.journeyRepository.find({
      where: {
        organizationId,
        status: JourneyStatus.IN_PROGRESS,
      },
      order: { startDate: 'ASC' },
      relations: ['employee'],
    });
  }

  async getJourneysByType(organizationId: string, journeyType: JourneyType): Promise<EmployeeJourney[]> {
    return this.journeyRepository.find({
      where: {
        organizationId,
        journeyType,
      },
      order: { startDate: 'DESC' },
    });
  }

  // ============ Templates ============

  async createTemplate(template: Partial<JourneyTemplate>): Promise<JourneyTemplate> {
    const newTemplate = this.templateRepository.create(template);
    return this.templateRepository.save(newTemplate);
  }

  async getTemplatesByType(organizationId: string, journeyType: JourneyType): Promise<JourneyTemplate[]> {
    return this.templateRepository.find({
      where: {
        organizationId,
        journeyType,
        isActive: true,
      },
    });
  }

  async getDefaultTemplate(organizationId: string, journeyType: JourneyType): Promise<JourneyTemplate | null> {
    return this.templateRepository.findOne({
      where: {
        organizationId,
        journeyType,
        isDefault: true,
        isActive: true,
      },
    });
  }

  // ============ Analytics ============

  async getJourneyMetrics(organizationId: string): Promise<any> {
    const journeys = await this.journeyRepository.find({ where: { organizationId } });

    const total = journeys.length;
    const active = journeys.filter(j => j.status === JourneyStatus.IN_PROGRESS).length;
    const completed = journeys.filter(j => j.status === JourneyStatus.COMPLETED).length;

    const byType = journeys.reduce((acc, j) => {
      acc[j.journeyType] = (acc[j.journeyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCompletion = journeys.length > 0
      ? journeys.reduce((sum, j) => sum + (j.progressPercentage || 0), 0) / journeys.length
      : 0;

    const avgSatisfaction = journeys
      .filter(j => j.satisfactionScore)
      .reduce((sum, j, _, arr) => sum + j.satisfactionScore! / arr.length, 0);

    return {
      total,
      active,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      avgCompletionPercentage: avgCompletion,
      avgSatisfactionScore: avgSatisfaction || null,
      byType,
    };
  }

  // ============ Helper Methods ============

  private async calculateProgress(journey: EmployeeJourney): Promise<void> {
    if (!journey.tasks || journey.tasks.length === 0) {
      journey.progressPercentage = 0;
      journey.completedTasks = 0;
      return;
    }

    const completed = journey.tasks.filter(t => t.status === 'COMPLETED').length;
    journey.completedTasks = completed;
    journey.totalTasks = journey.tasks.length;
    journey.progressPercentage = (completed / journey.totalTasks) * 100;
  }
}
