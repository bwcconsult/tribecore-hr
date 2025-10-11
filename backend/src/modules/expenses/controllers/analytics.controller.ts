import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Expense Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get expense analytics overview' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Analytics overview' })
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.analyticsService.getOverview(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      departmentId,
      employeeId,
    );
  }

  @Get('trends')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get expense trends over time' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months (default: 12)' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Expense trends' })
  async getTrends(
    @Query('months') months?: number,
    @Query('departmentId') departmentId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.analyticsService.getTrends(
      months ? parseInt(months.toString(), 10) : 12,
      departmentId,
      employeeId,
    );
  }

  @Get('by-category')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get expense breakdown by category' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Category breakdown' })
  async getCategoryBreakdown(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.analyticsService.getCategoryBreakdown(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      departmentId,
      employeeId,
    );
  }

  @Get('top-spenders')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get top spending employees' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of employees (default: 10)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Top spenders' })
  async getTopSpenders(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.analyticsService.getTopSpenders(
      limit ? parseInt(limit.toString(), 10) : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      departmentId,
    );
  }

  @Get('approval-metrics')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get approval metrics and statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'approverId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Approval metrics' })
  async getApprovalMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('approverId') approverId?: string,
  ) {
    return this.analyticsService.getApprovalMetrics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      approverId,
    );
  }

  @Get('by-department')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get expense comparison by department' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Department comparison' })
  async getDepartmentComparison(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDepartmentComparison(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('policy-violations')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get policy violation statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Policy violations' })
  async getPolicyViolations(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getPolicyViolations(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
