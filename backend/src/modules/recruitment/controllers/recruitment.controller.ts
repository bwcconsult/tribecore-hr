import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecruitmentService } from '../services/recruitment.service';

@ApiTags('Recruitment')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post('requisitions')
  @ApiOperation({ summary: 'Create requisition' })
  async createRequisition(@Body() data: any) {
    return this.recruitmentService.createRequisition(data);
  }

  @Post('requisitions/:id/approve')
  @ApiOperation({ summary: 'Approve requisition' })
  async approveRequisition(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
    @Body('comments') comments?: string,
  ) {
    return this.recruitmentService.approveRequisition(id, approverId, comments);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create job posting' })
  async createJobPosting(@Body() data: any) {
    return this.recruitmentService.createJobPosting(data);
  }

  @Post('jobs/:id/publish')
  @ApiOperation({ summary: 'Publish job to channels' })
  async publishJob(@Param('id') id: string, @Body('channels') channels: any[]) {
    return this.recruitmentService.publishJob(id, channels);
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Create/update candidate' })
  async upsertCandidate(@Body() data: any) {
    return this.recruitmentService.upsertCandidate(data);
  }

  @Post('applications')
  @ApiOperation({ summary: 'Submit application' })
  async submitApplication(@Body() data: any) {
    return this.recruitmentService.submitApplication(data);
  }

  @Post('applications/:id/advance')
  @ApiOperation({ summary: 'Advance to next stage' })
  async advanceApplication(@Param('id') id: string, @Body('nextStage') nextStage: any) {
    return this.recruitmentService.advanceApplication(id, nextStage);
  }

  @Post('applications/:id/reject')
  @ApiOperation({ summary: 'Reject application' })
  async rejectApplication(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('feedback') feedback?: string,
  ) {
    return this.recruitmentService.rejectApplication(id, reason, feedback);
  }

  @Post('interviews')
  @ApiOperation({ summary: 'Schedule interview' })
  async scheduleInterview(@Body() data: any) {
    return this.recruitmentService.scheduleInterview(data);
  }

  @Post('interviews/:id/feedback')
  @ApiOperation({ summary: 'Submit interview feedback' })
  async submitFeedback(
    @Param('id') id: string,
    @Body('panelId') panelId: string,
    @Body('scorecard') scorecard: any,
  ) {
    return this.recruitmentService.submitInterviewFeedback(id, panelId, scorecard);
  }

  @Post('offers')
  @ApiOperation({ summary: 'Create offer' })
  async createOffer(@Body() data: any) {
    return this.recruitmentService.createOffer(data);
  }

  @Post('offers/:id/accept')
  @ApiOperation({ summary: 'Accept offer' })
  async acceptOffer(@Param('id') id: string) {
    return this.recruitmentService.acceptOffer(id);
  }

  @Get('pipeline/metrics')
  @ApiOperation({ summary: 'Get pipeline metrics' })
  async getPipelineMetrics(@Query('organizationId') organizationId: string) {
    return this.recruitmentService.getPipelineMetrics(organizationId);
  }
}
