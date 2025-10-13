import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('expenses/admin/dashboard')
@UseGuards(JwtAuthGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('summary')
  getOverallSummary(@Query('fiscalYear') fiscalYear?: string) {
    return this.adminDashboardService.getOverallSummary(fiscalYear);
  }

  @Get('spend-summary')
  getSpendSummary(@Query('fiscalYear') fiscalYear?: string) {
    return this.adminDashboardService.getSpendSummary(fiscalYear);
  }

  @Get('pending-items')
  getPendingItems() {
    return this.adminDashboardService.getPendingItems();
  }

  @Get('corporate-cards')
  getCorporateCardSummary() {
    return this.adminDashboardService.getCorporateCardSummary();
  }

  @Get('expenses-by-category')
  getExpensesByCategory(@Query('period') period?: string) {
    return this.adminDashboardService.getExpensesByCategory(period);
  }

  @Get('expenses-by-project')
  getExpensesByProject(@Query('period') period?: string) {
    return this.adminDashboardService.getExpensesByProject(period);
  }

  @Get('top-policy-violations')
  getTopPolicyViolations(@Query('period') period?: string) {
    return this.adminDashboardService.getTopPolicyViolations(period);
  }

  @Get('top-spending-users')
  getTopSpendingUsers(@Query('limit') limit?: number) {
    return this.adminDashboardService.getTopSpendingUsers(limit || 10);
  }

  @Get('top-violators')
  getTopViolators(@Query('limit') limit?: number) {
    return this.adminDashboardService.getTopViolators(limit || 10);
  }
}
