import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, TaskStatus, TaskType } from './entities/task.entity';
import { Checklist, ChecklistItem } from './entities/checklist.entity';
import { TaskEvent, TaskEventType } from './entities/task-event.entity';
import { CreateTaskDto, UpdateTaskDto, CompleteTaskDto } from './dto/create-task.dto';
import { CreateChecklistDto, UpdateChecklistItemDto } from './dto/create-checklist.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
    @InjectRepository(ChecklistItem)
    private checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(TaskEvent)
    private taskEventRepository: Repository<TaskEvent>,
  ) {}

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDto, createdByUserId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...dto,
      status: TaskStatus.PENDING,
      createdByUserId,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log creation event
    await this.logTaskEvent({
      taskId: savedTask.id,
      eventType: TaskEventType.CREATED,
      actorId: createdByUserId,
      newState: { status: TaskStatus.PENDING },
    });

    // TODO: Send notification to assignee

    return savedTask;
  }

  /**
   * Get tasks for a user (with filtering)
   */
  async getUserTasks(
    userId: string,
    filters?: {
      type?: TaskType;
      status?: TaskStatus;
      scope?: 'self' | 'team' | 'org';
    },
  ): Promise<Task[]> {
    const query: any = {};

    if (filters?.scope === 'self') {
      query.assigneeId = userId;
    }
    // TODO: Implement team and org scope filtering

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.status) {
      query.status = filters.status;
    } else {
      // By default, exclude completed tasks
      query.status = In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.OVERDUE]);
    }

    return this.taskRepository.find({
      where: query,
      order: {
        dueDate: 'ASC',
        priority: 'DESC',
        createdAt: 'DESC',
      },
      relations: ['requester', 'assignee'],
    });
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['requester', 'assignee', 'completedBy'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.getTask(id);
    const previousState = { ...task };

    Object.assign(task, dto);
    task.modifiedByUserId = userId;

    const updatedTask = await this.taskRepository.save(task);

    // Log update event
    await this.logTaskEvent({
      taskId: id,
      eventType: TaskEventType.STATUS_CHANGED,
      actorId: userId,
      previousState,
      newState: dto,
    });

    return updatedTask;
  }

  /**
   * Start task (mark as in progress)
   */
  async startTask(id: string, userId: string): Promise<Task> {
    const task = await this.getTask(id);

    if (task.assigneeId !== userId) {
      throw new BadRequestException('You are not assigned to this task');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('Task is not in pending status');
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = new Date();

    const updatedTask = await this.taskRepository.save(task);

    await this.logTaskEvent({
      taskId: id,
      eventType: TaskEventType.STARTED,
      actorId: userId,
      previousState: { status: TaskStatus.PENDING },
      newState: { status: TaskStatus.IN_PROGRESS },
    });

    return updatedTask;
  }

  /**
   * Complete task
   */
  async completeTask(id: string, userId: string, dto?: CompleteTaskDto): Promise<Task> {
    const task = await this.getTask(id);

    if (task.assigneeId !== userId) {
      throw new BadRequestException('You are not assigned to this task');
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Task is already completed');
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedByUserId = userId;
    task.completionNotes = dto?.completionNotes;

    const updatedTask = await this.taskRepository.save(task);

    await this.logTaskEvent({
      taskId: id,
      eventType: TaskEventType.COMPLETED,
      actorId: userId,
      previousState: { status: task.status },
      newState: { status: TaskStatus.COMPLETED },
      comment: dto?.completionNotes,
    });

    // TODO: Send notification to requester

    return updatedTask;
  }

  /**
   * Cancel task
   */
  async cancelTask(id: string, userId: string, reason?: string): Promise<Task> {
    const task = await this.getTask(id);

    task.status = TaskStatus.CANCELLED;
    task.modifiedByUserId = userId;

    const updatedTask = await this.taskRepository.save(task);

    await this.logTaskEvent({
      taskId: id,
      eventType: TaskEventType.CANCELLED,
      actorId: userId,
      comment: reason,
    });

    return updatedTask;
  }

  /**
   * Reassign task
   */
  async reassignTask(id: string, newAssigneeId: string, userId: string): Promise<Task> {
    const task = await this.getTask(id);
    const previousAssigneeId = task.assigneeId;

    task.assigneeId = newAssigneeId;
    task.modifiedByUserId = userId;

    const updatedTask = await this.taskRepository.save(task);

    await this.logTaskEvent({
      taskId: id,
      eventType: TaskEventType.REASSIGNED,
      actorId: userId,
      previousState: { assigneeId: previousAssigneeId },
      newState: { assigneeId: newAssigneeId },
    });

    // TODO: Send notification to new assignee

    return updatedTask;
  }

  /**
   * Create checklist from template or scratch
   */
  async createChecklist(dto: CreateChecklistDto, userId: string): Promise<Checklist> {
    const checklist = this.checklistRepository.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      isTemplate: dto.isTemplate || false,
      visibleToRoles: [],
      totalItems: dto.items?.length || 0,
      completedItems: 0,
      completionPercentage: 0,
      createdByUserId: userId,
    });

    const savedChecklist = await this.checklistRepository.save(checklist);

    // Create checklist items
    if (dto.items && dto.items.length > 0) {
      for (let i = 0; i < dto.items.length; i++) {
        const itemDto = dto.items[i];
        const item = this.checklistItemRepository.create({
          checklistId: savedChecklist.id,
          title: itemDto.title,
          description: itemDto.description,
          sequence: i + 1,
          assignedToUserId: itemDto.assignedToUserId,
          assignedToRole: itemDto.assignedToRole,
          isRequired: itemDto.isRequired !== undefined ? itemDto.isRequired : true,
          dueInDays: itemDto.dueInDays,
        });
        await this.checklistItemRepository.save(item);
      }
    }

    return savedChecklist;
  }

  /**
   * Get checklist with items
   */
  async getChecklist(id: string): Promise<Checklist & { items: ChecklistItem[] }> {
    const checklist = await this.checklistRepository.findOne({ where: { id } });
    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    const items = await this.checklistItemRepository.find({
      where: { checklistId: id },
      order: { sequence: 'ASC' },
    });

    return { ...checklist, items };
  }

  /**
   * Update checklist item (mark as complete)
   */
  async updateChecklistItem(
    itemId: string,
    dto: UpdateChecklistItemDto,
    userId: string,
  ): Promise<ChecklistItem> {
    const item = await this.checklistItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }

    if (dto.isCompleted !== undefined) {
      item.isCompleted = dto.isCompleted;
      if (dto.isCompleted) {
        item.completedAt = new Date();
        item.completedByUserId = userId;
      } else {
        item.completedAt = null;
        item.completedByUserId = null;
      }
    }

    if (dto.completionNotes) {
      item.completionNotes = dto.completionNotes;
    }

    const updatedItem = await this.checklistItemRepository.save(item);

    // Update checklist completion percentage
    await this.updateChecklistCompletion(item.checklistId);

    return updatedItem;
  }

  /**
   * Update checklist completion percentage
   */
  private async updateChecklistCompletion(checklistId: string): Promise<void> {
    const checklist = await this.checklistRepository.findOne({ where: { id: checklistId } });
    if (!checklist) return;

    const items = await this.checklistItemRepository.find({ where: { checklistId } });
    const totalItems = items.length;
    const completedItems = items.filter((item) => item.isCompleted).length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    checklist.totalItems = totalItems;
    checklist.completedItems = completedItems;
    checklist.completionPercentage = Math.round(completionPercentage * 100) / 100;

    await this.checklistRepository.save(checklist);
  }

  /**
   * Log task event for audit trail
   */
  private async logTaskEvent(data: {
    taskId: string;
    eventType: TaskEventType;
    actorId: string;
    comment?: string;
    previousState?: any;
    newState?: any;
  }): Promise<void> {
    const event = this.taskEventRepository.create({
      taskId: data.taskId,
      eventType: data.eventType,
      actorId: data.actorId,
      comment: data.comment,
      previousState: data.previousState,
      newState: data.newState,
      eventTimestamp: new Date(),
    });

    await this.taskEventRepository.save(event);
  }
}
