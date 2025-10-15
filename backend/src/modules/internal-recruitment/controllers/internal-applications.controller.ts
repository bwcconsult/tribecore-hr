import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InternalApplicationsService } from '../services/internal-applications.service';
import { ApplyForJobDto, ApproveApplicationDto, RejectApplicationDto } from '../dto/apply-for-job.dto';
import { ApplicationStatus } from '../entities/internal-application.entity';

@ApiTags('Internal Recruitment - Applications')
@Controller('api/v1/internal-recruitment/applications')
export class InternalApplicationsController {
  constructor(private readonly applicationsService: InternalApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit job application' })
  async submitApplication(@Body() dto: ApplyForJobDto) {
    return this.applicationsService.submitApplication(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  async getApplication(@Param('id') id: string) {
    return this.applicationsService.getApplicationById(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get employee applications' })
  async getEmployeeApplications(@Param('employeeId') employeeId: string) {
    return this.applicationsService.getEmployeeApplications(employeeId);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get job applications' })
  async getJobApplications(@Param('jobId') jobId: string) {
    return this.applicationsService.getJobApplications(jobId);
  }

  @Patch(':id/manager-approve')
  @ApiOperation({ summary: 'Manager approves application' })
  async managerApprove(@Param('id') id: string, @Body() dto: ApproveApplicationDto) {
    return this.applicationsService.approveByManager(id, dto);
  }

  @Patch(':id/manager-reject')
  @ApiOperation({ summary: 'Manager rejects application' })
  async managerReject(@Param('id') id: string, @Body() dto: RejectApplicationDto) {
    return this.applicationsService.rejectByManager(id, dto);
  }

  @Patch(':id/hr-approve')
  @ApiOperation({ summary: 'HR approves application' })
  async hrApprove(@Param('id') id: string, @Body() dto: ApproveApplicationDto) {
    return this.applicationsService.approveByHR(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @Body('actor') actor?: string,
    @Body('notes') notes?: string
  ) {
    return this.applicationsService.updateApplicationStatus(id, status, actor, notes);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw application' })
  async withdraw(@Param('id') id: string, @Body('reason') reason: string) {
    return this.applicationsService.withdrawApplication(id, reason);
  }

  @Get('organization/:orgId/stats')
  @ApiOperation({ summary: 'Get application statistics' })
  async getStats(@Param('orgId') orgId: string) {
    return this.applicationsService.getApplicationStats(orgId);
  }
}
