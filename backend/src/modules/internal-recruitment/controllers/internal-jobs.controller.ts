import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InternalJobsService } from '../services/internal-jobs.service';
import { CreateJobPostingDto } from '../dto/create-job-posting.dto';
import { JobStatus } from '../entities/internal-job-posting.entity';

@ApiTags('Internal Recruitment - Jobs')
@Controller('api/v1/internal-recruitment/jobs')
export class InternalJobsController {
  constructor(private readonly jobsService: InternalJobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create internal job posting' })
  async createJob(@Body() dto: CreateJobPostingDto, @Body('postedBy') postedBy: string) {
    return this.jobsService.createJobPosting(dto, postedBy);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job posting by ID' })
  async getJob(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Get('organization/:orgId')
  @ApiOperation({ summary: 'Get all jobs for organization' })
  async getOrganizationJobs(
    @Param('orgId') orgId: string,
    @Query('status') status?: JobStatus,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.jobsService.getAllJobs(orgId, { status, departmentId });
  }

  @Get('organization/:orgId/search')
  @ApiOperation({ summary: 'Search jobs' })
  async searchJobs(@Param('orgId') orgId: string, @Query('q') query: string) {
    return this.jobsService.searchJobs(orgId, query);
  }

  @Get('organization/:orgId/stats')
  @ApiOperation({ summary: 'Get job statistics' })
  async getJobStats(@Param('orgId') orgId: string) {
    return this.jobsService.getJobStats(orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job posting' })
  async updateJob(@Param('id') id: string, @Body() updates: any) {
    return this.jobsService.updateJobPosting(id, updates);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close job posting' })
  async closeJob(@Param('id') id: string) {
    return this.jobsService.closeJobPosting(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment view count' })
  async incrementViews(@Param('id') id: string) {
    await this.jobsService.incrementViewCount(id);
    return { success: true };
  }
}
