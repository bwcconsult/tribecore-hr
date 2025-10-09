import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('audit-logs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit logs' })
  getAuditLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    return this.complianceService.getAuditLogs(
      user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('gdpr/export/:employeeId')
  @ApiOperation({ summary: 'Export GDPR data for employee' })
  exportGDPRData(@Param('employeeId') employeeId: string) {
    return this.complianceService.exportGDPRData(employeeId);
  }

  @Post('gdpr/delete/:employeeId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user data (Right to Erasure)' })
  deleteUserData(@Param('employeeId') employeeId: string, @Body('reason') reason: string) {
    return this.complianceService.deleteUserData(employeeId, reason);
  }

  @Get('report')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get compliance report' })
  getComplianceReport(@CurrentUser() user: any) {
    return this.complianceService.getComplianceReport(user.organizationId);
  }
}
