import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeEntryDto, CreateProjectDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto, UpdateProjectDto } from './dto/update-time-entry.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Time Tracking')
@Controller('time-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  // Time Entry Endpoints
  @Post('entries')
  @ApiOperation({ summary: 'Create time entry' })
  createTimeEntry(@Body() createTimeEntryDto: CreateTimeEntryDto, @CurrentUser() user: any) {
    createTimeEntryDto.employeeId = user.employeeId || user.id;
    return this.timeTrackingService.createTimeEntry(createTimeEntryDto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get all time entries' })
  findAllTimeEntries(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.timeTrackingService.findAllTimeEntries(user.employeeId || user.id, paginationDto);
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get time entry by ID' })
  findTimeEntryById(@Param('id') id: string) {
    return this.timeTrackingService.findTimeEntryById(id);
  }

  @Patch('entries/:id')
  @ApiOperation({ summary: 'Update time entry' })
  updateTimeEntry(@Param('id') id: string, @Body() updateTimeEntryDto: UpdateTimeEntryDto) {
    return this.timeTrackingService.updateTimeEntry(id, updateTimeEntryDto);
  }

  @Delete('entries/:id')
  @ApiOperation({ summary: 'Delete time entry' })
  deleteTimeEntry(@Param('id') id: string) {
    return this.timeTrackingService.deleteTimeEntry(id);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start timer' })
  startTimer(@Body() createTimeEntryDto: CreateTimeEntryDto, @CurrentUser() user: any) {
    return this.timeTrackingService.startTimer(user.employeeId || user.id, createTimeEntryDto);
  }

  @Post('stop/:id')
  @ApiOperation({ summary: 'Stop timer' })
  stopTimer(@Param('id') id: string) {
    return this.timeTrackingService.stopTimer(id);
  }

  // Project Endpoints
  @Post('projects')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create project' })
  createProject(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: any) {
    createProjectDto.organizationId = user.organizationId;
    return this.timeTrackingService.createProject(createProjectDto);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get all projects' })
  findAllProjects(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.timeTrackingService.findAllProjects(user.organizationId, paginationDto);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project by ID' })
  findProjectById(@Param('id') id: string) {
    return this.timeTrackingService.findProjectById(id);
  }

  @Patch('projects/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update project' })
  updateProject(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.timeTrackingService.updateProject(id, updateProjectDto);
  }

  @Delete('projects/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete project' })
  deleteProject(@Param('id') id: string) {
    return this.timeTrackingService.deleteProject(id);
  }
}
