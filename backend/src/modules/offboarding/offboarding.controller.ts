import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { OffboardingService } from './offboarding.service';
import { CreateOffboardingDto, CreateOffboardingTaskDto, CreateExitInterviewDto, UpdateFinalSettlementDto } from './dto/create-offboarding.dto';
import { OffboardingStatus, OffboardingReason } from './entities/offboarding.entity';
import { TaskStatus } from './entities/offboarding-task.entity';

@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  // ===== OFFBOARDING PROCESSES =====

  @Post()
  async createOffboarding(@Body() createDto: CreateOffboardingDto, @Request() req) {
    return this.offboardingService.createOffboarding(createDto, req.user?.id || 'system');
  }

  @Get()
  async findAllOffboarding(
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: OffboardingStatus,
    @Query('reason') reason?: OffboardingReason,
  ) {
    return this.offboardingService.findAllOffboarding({
      organizationId,
      status,
      reason,
    });
  }

  @Get(':id')
  async getOffboardingById(@Param('id') id: string) {
    return this.offboardingService.getOffboardingById(id);
  }

  @Get(':id/details')
  async getOffboardingWithDetails(@Param('id') id: string) {
    return this.offboardingService.getOffboardingWithDetails(id);
  }

  @Put(':id/status')
  async updateOffboardingStatus(
    @Param('id') id: string,
    @Body('status') status: OffboardingStatus,
  ) {
    return this.offboardingService.updateOffboardingStatus(id, status);
  }

  @Put(':id/settlement')
  async updateFinalSettlement(
    @Param('id') id: string,
    @Body() settlementDto: UpdateFinalSettlementDto,
  ) {
    return this.offboardingService.updateFinalSettlement(id, settlementDto);
  }

  @Post(':id/revoke-access')
  async revokeAccess(@Param('id') id: string) {
    return this.offboardingService.revokeAccess(id);
  }

  @Post(':id/reference')
  async markReferenceProvided(@Param('id') id: string) {
    return this.offboardingService.markReferenceProvided(id);
  }

  // ===== TASKS =====

  @Post('tasks')
  async createTask(@Body() createDto: CreateOffboardingTaskDto) {
    return this.offboardingService.createTask(createDto);
  }

  @Get('process/:processId/tasks')
  async getProcessTasks(@Param('processId') processId: string) {
    return this.offboardingService.getProcessTasks(processId);
  }

  @Put('tasks/:taskId/status')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Body() body: { status: TaskStatus; completionNotes?: string },
    @Request() req,
  ) {
    return this.offboardingService.updateTaskStatus(
      taskId,
      body.status,
      req.user?.id,
      body.completionNotes,
    );
  }

  // ===== EXIT INTERVIEWS =====

  @Post('exit-interview')
  async createExitInterview(@Body() createDto: CreateExitInterviewDto, @Request() req) {
    return this.offboardingService.createExitInterview(createDto, req.user?.id || 'system');
  }

  @Get('process/:processId/exit-interview')
  async getExitInterview(@Param('processId') processId: string) {
    return this.offboardingService.getExitInterview(processId);
  }

  // ===== ANALYTICS =====

  @Get('analytics/overview')
  async getOffboardingAnalytics(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.offboardingService.getOffboardingAnalytics(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('analytics/exit-insights')
  async getExitInterviewInsights(@Query('organizationId') organizationId: string) {
    return this.offboardingService.getExitInterviewInsights(organizationId);
  }
}
