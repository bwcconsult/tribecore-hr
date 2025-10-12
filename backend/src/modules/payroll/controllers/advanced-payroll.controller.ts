import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AiForecastingService } from '../services/ai-forecasting.service';
import { BulkProcessingService } from '../services/bulk-processing.service';
import { ThirteenthMonthService } from '../services/thirteenth-month.service';
import { BonusCommissionService, BonusRule } from '../services/bonus-commission.service';
import { AuditTrailService } from '../services/audit-trail.service';

@ApiTags('Advanced Payroll')
@Controller('payroll/advanced')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdvancedPayrollController {
  constructor(
    private readonly aiForecastingService: AiForecastingService,
    private readonly bulkProcessingService: BulkProcessingService,
    private readonly thirteenthMonthService: ThirteenthMonthService,
    private readonly bonusCommissionService: BonusCommissionService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  // ========== AI Forecasting & Analytics ==========

  @Get('forecast')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get AI-powered payroll forecast' })
  async getForecast(@CurrentUser() user: any) {
    return this.aiForecastingService.forecastPayroll(user.organizationId);
  }

  @Get('anomalies')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Detect payroll anomalies' })
  async detectAnomalies(
    @CurrentUser() user: any,
    @Query('payrollRunId') payrollRunId?: string,
  ) {
    return this.aiForecastingService.detectAnomalies(user.organizationId, payrollRunId);
  }

  // ========== Bulk Processing ==========

  @Post('bulk-process')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process bulk payroll for multiple employees' })
  async processBulk(
    @CurrentUser() user: any,
    @Body()
    data: {
      employeeIds: string[];
      payrollData: {
        payPeriodStart: Date;
        payPeriodEnd: Date;
        payDate: Date;
        frequency: string;
      };
    },
  ) {
    return this.bulkProcessingService.processBulkPayroll(
      user.organizationId,
      data.employeeIds,
      data.payrollData,
    );
  }

  @Post('bulk-process/multi-entity')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process payroll for multiple entities' })
  async processMultiEntity(
    @Body()
    data: {
      entities: Array<{
        organizationId: string;
        employeeIds: string[];
        payrollData: any;
      }>;
    },
  ) {
    return this.bulkProcessingService.processMultiEntity(data.entities);
  }

  @Post('bulk-process/rollback/:batchId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Rollback a payroll batch' })
  async rollbackBatch(@Param('batchId') batchId: string) {
    return this.bulkProcessingService.rollbackBatch(batchId);
  }

  // ========== 13th/14th Month Salary ==========

  @Get('thirteenth-month/:year')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Calculate 13th month salary for all employees' })
  async calculateThirteenthMonth(
    @CurrentUser() user: any,
    @Param('year') year: number,
  ) {
    return this.thirteenthMonthService.calculateThirteenthMonth(
      user.organizationId,
      year,
    );
  }

  @Get('thirteenth-month/:year/employee/:employeeId')
  @ApiOperation({ summary: 'Calculate 13th month salary for specific employee' })
  async calculateThirteenthMonthForEmployee(
    @Param('year') year: number,
    @Param('employeeId') employeeId: string,
  ) {
    // Get employee first
    const employee = await this.thirteenthMonthService['employeeRepository'].findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.thirteenthMonthService.calculateForEmployee(employee, year);
  }

  @Get('fourteenth-month/:year')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Calculate 14th month salary (Italy, Greece)' })
  async calculateFourteenthMonth(
    @CurrentUser() user: any,
    @Param('year') year: number,
  ) {
    return this.thirteenthMonthService.calculateFourteenthMonth(
      user.organizationId,
      year,
    );
  }

  @Get('thirteenth-month/countries')
  @ApiOperation({ summary: 'Get supported countries for 13th month salary' })
  async getSupportedCountries() {
    return this.thirteenthMonthService.getAllSupportedCountries();
  }

  // ========== Bonuses & Commissions ==========

  @Post('bonus/calculate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Calculate bonus for an employee' })
  async calculateBonus(
    @Body()
    data: {
      employeeId: string;
      rule: BonusRule;
    },
  ) {
    return this.bonusCommissionService.calculateBonus(data.employeeId, data.rule);
  }

  @Post('bonus/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Calculate bonuses for multiple employees' })
  async bulkCalculateBonuses(
    @CurrentUser() user: any,
    @Body()
    data: {
      rule: BonusRule;
      employeeIds?: string[];
    },
  ) {
    return this.bonusCommissionService.bulkCalculateBonuses(
      user.organizationId,
      data.rule,
      data.employeeIds,
    );
  }

  @Post('commission/calculate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Calculate sales commission for an employee' })
  async calculateCommission(
    @Body()
    data: {
      employeeId: string;
      salesAmount: number;
      targetAmount: number;
      commissionRate: number;
      tiers?: Array<{ from: number; to: number; rate: number }>;
    },
  ) {
    return this.bonusCommissionService.calculateCommission(
      data.employeeId,
      data.salesAmount,
      data.targetAmount,
      data.commissionRate,
      data.tiers,
    );
  }

  @Get('bonus/presets/year-end')
  @ApiOperation({ summary: 'Get year-end bonus preset' })
  async getYearEndBonusPreset(@Query('percentage') percentage: number = 100) {
    return this.bonusCommissionService.getYearEndBonusRule(percentage);
  }

  @Get('bonus/presets/performance')
  @ApiOperation({ summary: 'Get performance bonus preset' })
  async getPerformanceBonusPreset(
    @Query('target') target: number,
    @Query('actual') actual: number,
    @Query('percentage') percentage: number = 20,
  ) {
    return this.bonusCommissionService.getPerformanceBonusRule(
      target,
      actual,
      percentage,
    );
  }

  @Get('bonus/presets/sales-commission')
  @ApiOperation({ summary: 'Get sales commission preset' })
  async getSalesCommissionPreset(@Query('sales') sales: number) {
    return this.bonusCommissionService.getSalesCommissionRule(sales);
  }

  // ========== Audit & Compliance ==========

  @Get('audit/report')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate audit-ready payroll report' })
  async generateAuditReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.auditTrailService.generateAuditReport(
      user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('audit/general-ledger')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export general ledger for accounting' })
  async exportGeneralLedger(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: 'CSV' | 'XML' | 'JSON' = 'CSV',
  ) {
    const glExport = await this.auditTrailService.exportGeneralLedger(
      user.organizationId,
      new Date(startDate),
      new Date(endDate),
      format,
    );

    if (format === 'CSV') {
      return {
        data: await this.auditTrailService.exportToCSV(glExport),
        contentType: 'text/csv',
      };
    } else if (format === 'XML') {
      return {
        data: await this.auditTrailService.exportToXML(glExport),
        contentType: 'application/xml',
      };
    }

    return glExport;
  }

  @Get('audit/compliance-checklist')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get compliance checklist for a period' })
  async getComplianceChecklist(
    @CurrentUser() user: any,
    @Query('period') period: string, // YYYY-MM format
  ) {
    const [year, month] = period.split('-').map(Number);
    return this.auditTrailService.generateComplianceChecklist(
      user.organizationId,
      new Date(year, month - 1, 1),
    );
  }
}
