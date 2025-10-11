import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CompleteTaskDto, TaskQueryDto } from './dto/create-task.dto';
import { CreateChecklistDto, UpdateChecklistItemDto } from './dto/create-checklist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, CanViewSelf, CanCreate } from '../../common/decorators/permissions.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get tasks for current user' })
  @CanViewSelf('task')
  async getTasks(@Req() req, @Query() query: TaskQueryDto) {
    const scope = query.scope || 'self';
    return this.tasksService.getUserTasks(req.user.id, {
      type: query.type,
      status: query.status as any,
      scope,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @CanViewSelf('task')
  async getTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create task' })
  @RequirePermissions({ feature: 'task', action: 'assign', scope: 'team' })
  async createTask(@Req() req, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @RequirePermissions({ feature: 'task', action: 'assign', scope: 'team' })
  async updateTask(@Param('id') id: string, @Req() req, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, dto, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start task (mark as in progress)' })
  @CanViewSelf('task')
  async startTask(@Param('id') id: string, @Req() req) {
    return this.tasksService.startTask(id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete task' })
  @CanViewSelf('task')
  async completeTask(@Param('id') id: string, @Req() req, @Body() dto: CompleteTaskDto) {
    return this.tasksService.completeTask(id, req.user.id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel task' })
  @RequirePermissions({ feature: 'task', action: 'assign', scope: 'team' })
  async cancelTask(@Param('id') id: string, @Req() req, @Query('reason') reason?: string) {
    return this.tasksService.cancelTask(id, req.user.id, reason);
  }

  @Post(':id/reassign')
  @ApiOperation({ summary: 'Reassign task to another user' })
  @RequirePermissions({ feature: 'task', action: 'assign', scope: 'team' })
  async reassignTask(@Param('id') id: string, @Req() req, @Body('assigneeId') assigneeId: string) {
    return this.tasksService.reassignTask(id, assigneeId, req.user.id);
  }

  @Post('checklists')
  @ApiOperation({ summary: 'Create checklist' })
  @RequirePermissions({ feature: 'task', action: 'create_checklist', scope: 'org' })
  async createChecklist(@Req() req, @Body() dto: CreateChecklistDto) {
    return this.tasksService.createChecklist(dto, req.user.id);
  }

  @Get('checklists/:id')
  @ApiOperation({ summary: 'Get checklist with items' })
  @CanViewSelf('task')
  async getChecklist(@Param('id') id: string) {
    return this.tasksService.getChecklist(id);
  }

  @Patch('checklist-items/:id')
  @ApiOperation({ summary: 'Update checklist item (mark complete)' })
  @CanViewSelf('task')
  async updateChecklistItem(@Param('id') id: string, @Req() req, @Body() dto: UpdateChecklistItemDto) {
    return this.tasksService.updateChecklistItem(id, dto, req.user.id);
  }
}
