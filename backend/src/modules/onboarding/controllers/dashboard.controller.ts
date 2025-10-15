import { Controller, Get, Query } from '@nestjs/common';
import { OnboardingCaseService } from '../services/onboarding-case.service';
import { CXOService } from '../services/cxo.service';

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(
    private readonly caseService: OnboardingCaseService,
    private readonly cxoService: CXOService,
  ) {}

  @Get('onboarding')
  async getOnboardingDashboard(@Query('organizationId') organizationId: string) {
    return this.caseService.getDashboardStats(organizationId);
  }

  @Get('cxo')
  async getCXODashboard(
    @Query('organizationId') organizationId: string,
    @Query('csmId') csmId?: string,
  ) {
    return this.cxoService.getDashboardStats(organizationId, csmId);
  }
}
