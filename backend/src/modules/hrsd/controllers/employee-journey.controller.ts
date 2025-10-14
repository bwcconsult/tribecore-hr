import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeeJourneyService } from '../services/employee-journey.service';
import {
  CreateEmployeeJourneyDto,
  UpdateJourneyTaskDto,
  CompleteJourneyDto,
} from '../dto/hrsd.dto';
import { JourneyType } from '../entities/employee-journey.entity';

@ApiTags('HR Service Delivery - Employee Journeys')
@Controller('hrsd/journeys')
export class EmployeeJourneyController {
  constructor(private readonly journeyService: EmployeeJourneyService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee journey' })
  @ApiResponse({ status: 201, description: 'Journey created successfully' })
  async createJourney(@Body() dto: CreateEmployeeJourneyDto) {
    return this.journeyService.createJourney(dto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start journey' })
  async startJourney(@Param('id') id: string) {
    return this.journeyService.startJourney(id);
  }

  @Put('tasks/update')
  @ApiOperation({ summary: 'Update journey task' })
  async updateTask(@Body() dto: UpdateJourneyTaskDto) {
    return this.journeyService.updateTask(dto);
  }

  @Post('tasks/:journeyId/:taskId/complete')
  @ApiOperation({ summary: 'Complete task' })
  async completeTask(
    @Param('journeyId') journeyId: string,
    @Param('taskId') taskId: string,
    @Body('completedBy') completedBy: string,
  ) {
    return this.journeyService.completeTask(journeyId, taskId, completedBy);
  }

  @Post('milestones/:journeyId/:milestoneId/complete')
  @ApiOperation({ summary: 'Complete milestone' })
  async completeMilestone(
    @Param('journeyId') journeyId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.journeyService.completeMilestone(journeyId, milestoneId);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause journey' })
  async pauseJourney(@Param('id') id: string) {
    return this.journeyService.pauseJourney(id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume journey' })
  async resumeJourney(@Param('id') id: string) {
    return this.journeyService.resumeJourney(id);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete journey' })
  async completeJourney(@Body() dto: CompleteJourneyDto) {
    return this.journeyService.completeJourney(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journey details' })
  async getJourney(@Param('id') id: string) {
    return this.journeyService.getJourney(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get journeys by employee' })
  async getJourneysByEmployee(@Param('employeeId') employeeId: string) {
    return this.journeyService.getJourneysByEmployee(employeeId);
  }

  @Get('active/:organizationId')
  @ApiOperation({ summary: 'Get active journeys' })
  async getActiveJourneys(@Param('organizationId') organizationId: string) {
    return this.journeyService.getActiveJourneys(organizationId);
  }

  @Get('type/:organizationId/:journeyType')
  @ApiOperation({ summary: 'Get journeys by type' })
  async getJourneysByType(
    @Param('organizationId') organizationId: string,
    @Param('journeyType') journeyType: JourneyType,
  ) {
    return this.journeyService.getJourneysByType(organizationId, journeyType);
  }

  // Template endpoints
  @Post('templates')
  @ApiOperation({ summary: 'Create journey template' })
  async createTemplate(@Body() template: any) {
    return this.journeyService.createTemplate(template);
  }

  @Get('templates/:organizationId/:journeyType')
  @ApiOperation({ summary: 'Get templates by type' })
  async getTemplatesByType(
    @Param('organizationId') organizationId: string,
    @Param('journeyType') journeyType: JourneyType,
  ) {
    return this.journeyService.getTemplatesByType(organizationId, journeyType);
  }

  @Get('templates/:organizationId/:journeyType/default')
  @ApiOperation({ summary: 'Get default template' })
  async getDefaultTemplate(
    @Param('organizationId') organizationId: string,
    @Param('journeyType') journeyType: JourneyType,
  ) {
    return this.journeyService.getDefaultTemplate(organizationId, journeyType);
  }

  @Get('metrics/:organizationId')
  @ApiOperation({ summary: 'Get journey metrics' })
  async getJourneyMetrics(@Param('organizationId') organizationId: string) {
    return this.journeyService.getJourneyMetrics(organizationId);
  }
}
