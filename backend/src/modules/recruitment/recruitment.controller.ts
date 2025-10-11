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
import { RecruitmentService } from './recruitment.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Recruitment')
@Controller('recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Endpoints
  @Post('jobs')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create new job posting' })
  createJob(@Body() createJobDto: CreateJobDto, @CurrentUser() user: any) {
    createJobDto.organizationId = user.organizationId;
    return this.recruitmentService.createJob(createJobDto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs with pagination' })
  findAllJobs(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.recruitmentService.findAllJobs(user.organizationId, paginationDto);
  }

  @Get('jobs/stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get recruitment statistics' })
  getJobStats(@CurrentUser() user: any) {
    return this.recruitmentService.getJobStats(user.organizationId);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job by ID' })
  findJobById(@Param('id') id: string) {
    return this.recruitmentService.findJobById(id);
  }

  @Patch('jobs/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update job posting' })
  updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.recruitmentService.updateJob(id, updateJobDto);
  }

  @Delete('jobs/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete job posting' })
  deleteJob(@Param('id') id: string) {
    return this.recruitmentService.deleteJob(id);
  }

  // Application Endpoints
  @Post('applications')
  @ApiOperation({ summary: 'Submit job application' })
  createApplication(@Body() createApplicationDto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(createApplicationDto);
  }

  @Get('applications/job/:jobId')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all applications for a job' })
  findAllApplications(
    @Param('jobId') jobId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.recruitmentService.findAllApplications(jobId, paginationDto);
  }

  @Get('applications/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get application by ID' })
  findApplicationById(@Param('id') id: string) {
    return this.recruitmentService.findApplicationById(id);
  }

  @Patch('applications/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update application status' })
  updateApplication(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.recruitmentService.updateApplication(id, updateApplicationDto);
  }

  @Delete('applications/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete application' })
  deleteApplication(@Param('id') id: string) {
    return this.recruitmentService.deleteApplication(id);
  }
}
