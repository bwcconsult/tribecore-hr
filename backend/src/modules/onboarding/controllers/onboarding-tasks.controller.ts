import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingTask, TaskStatus } from '../entities/onboarding-task.entity';
import { CreateOnboardingTaskDto, UpdateOnboardingTaskDto } from '../dto/create-onboarding-task.dto';

@Controller('api/v1/onboarding')
export class OnboardingTasksController {
  constructor(
    @InjectRepository(OnboardingTask)
    private readonly taskRepository: Repository<OnboardingTask>,
  ) {}

  @Post('cases/:caseId/tasks')
  async createTask(@Param('caseId') caseId: string, @Body() dto: CreateOnboardingTaskDto) {
    const task = this.taskRepository.create({ ...dto, caseId });
    return this.taskRepository.save(task);
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.taskRepository.findOne({ where: { id } });
  }

  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() dto: UpdateOnboardingTaskDto) {
    await this.taskRepository.update(id, dto);
    return this.taskRepository.findOne({ where: { id } });
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    await this.taskRepository.softDelete(id);
    return { message: 'Task deleted successfully' };
  }

  @Patch('tasks/:id/complete')
  async completeTask(@Param('id') id: string, @Body('completedBy') completedBy: string) {
    await this.taskRepository.update(id, {
      status: TaskStatus.DONE,
      completedAt: new Date(),
      completedBy,
    });
    return this.taskRepository.findOne({ where: { id } });
  }

  @Patch('tasks/:id/block')
  async blockTask(@Param('id') id: string, @Body('reason') reason: string) {
    await this.taskRepository.update(id, {
      status: TaskStatus.BLOCKED,
      blockReason: reason,
    });
    return this.taskRepository.findOne({ where: { id } });
  }

  @Patch('tasks/:id/unblock')
  async unblockTask(@Param('id') id: string) {
    await this.taskRepository.update(id, {
      status: TaskStatus.PENDING,
      blockReason: undefined,
    });
    return this.taskRepository.findOne({ where: { id } });
  }
}
