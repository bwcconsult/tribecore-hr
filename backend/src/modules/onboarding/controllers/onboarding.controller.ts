import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnboardingService } from '../services/onboarding.service';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('cases/from-offer')
  @ApiOperation({ summary: 'Create onboarding from offer' })
  async createFromOffer(@Body() data: any) {
    return this.onboardingService.createFromOffer(data);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get onboarding case details' })
  async getCaseDetails(@Param('id') id: string) {
    return this.onboardingService.getCaseDetails(id);
  }

  @Post('cases/:caseId/tasks/:taskId/complete')
  @ApiOperation({ summary: 'Complete checklist task' })
  async completeTask(
    @Param('caseId') caseId: string,
    @Param('taskId') taskId: string,
    @Body('completedBy') completedBy: string,
  ) {
    return this.onboardingService.completeTask(caseId, taskId, completedBy);
  }

  @Put('provisions/:id/status')
  @ApiOperation({ summary: 'Update provision status' })
  async updateProvision(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('completedBy') completedBy?: string,
  ) {
    return this.onboardingService.updateProvision(id, status, completedBy);
  }

  @Post('cases/:id/preboarding/complete')
  @ApiOperation({ summary: 'Mark pre-boarding complete' })
  async completePreBoarding(@Param('id') id: string) {
    return this.onboardingService.completePreBoarding(id);
  }

  @Post('cases/:id/probation/decision')
  @ApiOperation({ summary: 'Record probation decision' })
  async recordProbation(
    @Param('id') id: string,
    @Body('decision') decision: 'PASS' | 'EXTEND' | 'FAIL',
    @Body('notes') notes?: string,
  ) {
    return this.onboardingService.recordProbationDecision(id, decision, notes);
  }
}
