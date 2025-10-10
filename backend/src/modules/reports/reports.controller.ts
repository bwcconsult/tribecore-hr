import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('workforce-demographics')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get workforce demographics report' })
  getWorkforceDemographics(@CurrentUser() user: any) {
    return this.reportsService.getWorkforceDemographics(user.organizationId);
  }

  @Get('payroll-summary')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get payroll summary report' })
  getPayrollSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.getPayrollSummary(
      user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('leave-utilization')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get leave utilization report' })
  getLeaveUtilization(@Query('year') year: number, @CurrentUser() user: any) {
    return this.reportsService.getLeaveUtilization(user.organizationId, year || new Date().getFullYear());
  }

  @Get('turnover-rate')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get turnover rate report' })
  getTurnoverRate(@Query('year') year: number, @CurrentUser() user: any) {
    return this.reportsService.getTurnoverRate(user.organizationId, year || new Date().getFullYear());
  }

  @Get('attendance')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get attendance report' })
  getAttendanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.getAttendanceReport(
      user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
