import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OvertimeCalculationEngineService } from '../services/overtime-calculation-engine.service';
import { PolicyEngineService } from '../services/policy-engine.service';
import { FatigueTrackerService } from '../services/fatigue-tracker.service';
import { BudgetValidatorService } from '../services/budget-validator.service';
import {
  CreateShiftDto,
  PunchDto,
  AddBreakDto,
  ClassifyOvertimeDto,
  BulkApproveDto,
  RedeemCompTimeDto,
  CreateOnCallDto,
  RecordCallOutDto,
  CreateBudgetDto,
  InitializePoliciesDto,
  QueryOvertimeDto,
  CheckFatigueDto,
  CheckRestComplianceDto,
  ExportToPayrollDto,
  OvertimeCalculationResponseDto,
  FatigueScoreResponseDto,
} from '../dto/overtime.dto';

/**
 * Enhanced Overtime Controller
 * Comprehensive API for world-class overtime management
 */
@ApiTags('Overtime Enhanced')
@Controller('overtime-enhanced')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class OvertimeEnhancedController {
  private readonly logger = new Logger(OvertimeEnhancedController.name);

  constructor(
    private readonly calculationEngine: OvertimeCalculationEngineService,
    private readonly policyEngine: PolicyEngineService,
    private readonly fatigueTracker: FatigueTrackerService,
    private readonly budgetValidator: BudgetValidatorService,
  ) {}

  // ==================== SHIFT MANAGEMENT ====================

  /**
   * Create a new shift / Clock in
   */
  @Post('shifts')
  @ApiOperation({ summary: 'Create shift or clock in' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  async createShift(@Body() dto: CreateShiftDto) {
    this.logger.log(`Creating shift for employee ${dto.employeeId}`);
    
    // Validate rest compliance before creating shift
    const policy = await this.policyEngine.findApplicablePolicy({
      country: 'US', // TODO: Get from employee record
      effectiveDate: dto.scheduledStart,
    });

    if (policy) {
      const restCheck = await this.fatigueTracker.checkRestCompliance(
        dto.employeeId,
        dto.actualStart || dto.scheduledStart,
        policy,
      );

      if (restCheck.hasBreach) {
        return {
          success: false,
          error: 'REST_BREACH',
          message: `Insufficient rest: ${restCheck.hoursSinceLastShift.toFixed(1)}h (${restCheck.minimumRequired}h required)`,
          restCheck,
        };
      }
    }

    // Check fatigue
    const fatigueScore = await this.fatigueTracker.calculateFatigueScore(dto.employeeId);
    if (fatigueScore.score >= 85) {
      return {
        success: false,
        error: 'CRITICAL_FATIGUE',
        message: `Critical fatigue level (${fatigueScore.score}/100) - mandatory rest required`,
        fatigueScore,
      };
    }

    // Create shift (implementation would use repository)
    return {
      success: true,
      message: 'Shift created successfully',
      // shift: createdShift,
      warnings: fatigueScore.score >= 60 ? ['High fatigue detected'] : [],
    };
  }

  /**
   * Punch in/out
   */
  @Post('shifts/:id/punch')
  @ApiOperation({ summary: 'Punch in or out of shift' })
  async punchShift(
    @Param('id') shiftId: string,
    @Body() dto: PunchDto,
  ) {
    this.logger.log(`Punch for shift ${shiftId} at ${dto.timestamp}`);
    
    return {
      success: true,
      message: 'Punch recorded successfully',
      timestamp: dto.timestamp,
      // Updated shift info would be returned here
    };
  }

  /**
   * Add break to shift
   */
  @Post('shifts/:id/breaks')
  @ApiOperation({ summary: 'Add break to shift' })
  async addBreak(
    @Param('id') shiftId: string,
    @Body() dto: AddBreakDto,
  ) {
    this.logger.log(`Adding ${dto.type} break to shift ${shiftId}`);
    
    return {
      success: true,
      message: 'Break added successfully',
      // break: addedBreak,
    };
  }

  /**
   * Complete shift
   */
  @Patch('shifts/:id/complete')
  @ApiOperation({ summary: 'Complete shift and mark ready for approval' })
  async completeShift(@Param('id') shiftId: string) {
    this.logger.log(`Completing shift ${shiftId}`);
    
    return {
      success: true,
      message: 'Shift completed and ready for approval',
    };
  }

  // ==================== OVERTIME CALCULATION ====================

  /**
   * Calculate/classify overtime for a shift
   */
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate overtime premiums for shift' })
  @ApiResponse({ status: 200, type: OvertimeCalculationResponseDto })
  async calculateOvertime(
    @Body() dto: ClassifyOvertimeDto,
  ): Promise<OvertimeCalculationResponseDto> {
    this.logger.log(`Calculating OT for shift ${dto.shiftId}`);

    // Get applicable policy
    const policy = await this.policyEngine.findApplicablePolicy({
      country: 'US', // TODO: From employee/shift
      sector: 'GENERAL',
    });

    if (!policy) {
      throw new Error('No applicable policy found');
    }

    // Calculate overtime
    const overtimeLines = await this.calculationEngine.calculateShiftOvertime(
      dto.shiftId,
      {
        ruleSet: policy,
        employeeBaseRate: dto.employeeBaseRate || 25,
        weeklyHoursWorked: dto.weeklyHoursWorked || 0,
        consecutiveDaysWorked: dto.consecutiveDaysWorked || 0,
      },
    );

    const totalHours = overtimeLines.reduce((sum, line) => sum + Number(line.quantityHours), 0);
    const totalAmount = overtimeLines.reduce((sum, line) => sum + Number(line.calculatedAmount), 0);

    // Check budget
    const budgetCheck = await this.budgetValidator.checkBudgetCapacity(
      'DEFAULT_CC', // TODO: From shift
      null,
      totalHours,
      totalAmount,
    );

    const warnings: string[] = [];
    if (!budgetCheck.hasCapacity) {
      warnings.push('Budget capacity exceeded - requires approval');
    }
    if (budgetCheck.warnings.length > 0) {
      warnings.push(...budgetCheck.warnings);
    }

    return {
      success: true,
      shiftId: dto.shiftId,
      totalOvertimeHours: totalHours,
      totalOvertimeAmount: totalAmount,
      overtimeLines: overtimeLines.map(line => ({
        id: line.id,
        rateClass: line.rateClass,
        basis: line.basis,
        hours: line.quantityHours,
        multiplier: line.multiplier,
        amount: line.calculatedAmount,
        earningCode: line.earningCode,
        explanation: line.explainTrace.ruleName,
      })),
      warnings,
    };
  }

  /**
   * Preview overtime without saving
   */
  @Post('calculate/preview')
  @ApiOperation({ summary: 'Preview OT calculation without creating records' })
  async previewOvertime(@Body() dto: ClassifyOvertimeDto) {
    dto.dryRun = true;
    return this.calculateOvertime(dto);
  }

  // ==================== APPROVALS ====================

  /**
   * Get pending approvals
   */
  @Get('approvals/pending')
  @ApiOperation({ summary: 'Get pending overtime approvals' })
  async getPendingApprovals(
    @Query('managerId') managerId: string,
    @Query('level') level?: string,
  ) {
    this.logger.log(`Fetching pending approvals for manager ${managerId}`);
    
    return {
      success: true,
      count: 0,
      approvals: [],
      // Would query OvertimeApproval repository
    };
  }

  /**
   * Approve overtime
   */
  @Post('approvals/:id/approve')
  @ApiOperation({ summary: 'Approve overtime request' })
  async approveOvertime(
    @Param('id') approvalId: string,
    @Body() body: { approvedBy: string; comments?: string },
  ) {
    this.logger.log(`Approving overtime ${approvalId} by ${body.approvedBy}`);
    
    return {
      success: true,
      message: 'Overtime approved successfully',
      // nextLevel: 'L2_SENIOR_MANAGER' or null if final
    };
  }

  /**
   * Reject overtime
   */
  @Post('approvals/:id/reject')
  @ApiOperation({ summary: 'Reject overtime request' })
  async rejectOvertime(
    @Param('id') approvalId: string,
    @Body() body: { rejectedBy: string; reason: string },
  ) {
    this.logger.log(`Rejecting overtime ${approvalId}`);
    
    return {
      success: true,
      message: 'Overtime rejected',
    };
  }

  /**
   * Bulk approve
   */
  @Post('approvals/bulk-approve')
  @ApiOperation({ summary: 'Approve multiple overtime requests' })
  async bulkApprove(@Body() dto: BulkApproveDto) {
    this.logger.log(`Bulk approving ${dto.shiftIds.length} shifts`);
    
    return {
      success: true,
      approved: dto.shiftIds.length,
      failed: 0,
      results: dto.shiftIds.map(id => ({ shiftId: id, status: 'approved' })),
    };
  }

  // ==================== COMP-TIME ====================

  /**
   * Get comp-time balance
   */
  @Get('comp-time/balance/:employeeId')
  @ApiOperation({ summary: 'Get comp-time balance for employee' })
  async getCompTimeBalance(@Param('employeeId') employeeId: string) {
    this.logger.log(`Fetching comp-time balance for ${employeeId}`);
    
    return {
      success: true,
      employeeId,
      balanceHours: 0,
      totalAccrued: 0,
      totalRedeemed: 0,
      expiringWithin30Days: 0,
      // Would query CompTimeBank repository
    };
  }

  /**
   * Redeem comp-time
   */
  @Post('comp-time/redeem')
  @ApiOperation({ summary: 'Redeem comp-time hours' })
  async redeemCompTime(@Body() dto: RedeemCompTimeDto) {
    this.logger.log(`Redeeming ${dto.hoursToRedeem}h comp-time for ${dto.employeeId}`);
    
    return {
      success: true,
      message: 'Comp-time redeemed successfully',
      remainingBalance: 0,
    };
  }

  // ==================== ON-CALL & STANDBY ====================

  /**
   * Create on-call period
   */
  @Post('on-call')
  @ApiOperation({ summary: 'Create on-call/standby period' })
  async createOnCall(@Body() dto: CreateOnCallDto) {
    this.logger.log(`Creating on-call for ${dto.employeeId}`);
    
    return {
      success: true,
      message: 'On-call period created',
      // onCall: created,
    };
  }

  /**
   * Record call-out
   */
  @Post('on-call/call-out')
  @ApiOperation({ summary: 'Record call-out event during on-call' })
  async recordCallOut(@Body() dto: RecordCallOutDto) {
    this.logger.log(`Recording call-out for ${dto.onCallStandbyId}`);
    
    return {
      success: true,
      message: 'Call-out recorded',
      minimumHoursApplied: false,
    };
  }

  // ==================== FATIGUE & SAFETY ====================

  /**
   * Get fatigue score
   */
  @Post('fatigue/check')
  @ApiOperation({ summary: 'Calculate fatigue score for employee' })
  @ApiResponse({ status: 200, type: FatigueScoreResponseDto })
  async checkFatigue(@Body() dto: CheckFatigueDto): Promise<FatigueScoreResponseDto> {
    this.logger.log(`Checking fatigue for ${dto.employeeId}`);
    
    const result = await this.fatigueTracker.calculateFatigueScore(
      dto.employeeId,
      dto.asOfDate,
    );

    return {
      employeeId: dto.employeeId,
      ...result,
    };
  }

  /**
   * Check rest compliance
   */
  @Post('rest/check')
  @ApiOperation({ summary: 'Check rest period compliance' })
  async checkRestCompliance(@Body() dto: CheckRestComplianceDto) {
    this.logger.log(`Checking rest compliance for ${dto.employeeId}`);
    
    const policy = await this.policyEngine.findApplicablePolicy({
      country: dto.country,
      sector: dto.sector,
    });

    if (!policy) {
      return {
        success: false,
        error: 'No policy found',
      };
    }

    const result = await this.fatigueTracker.checkRestCompliance(
      dto.employeeId,
      dto.proposedShiftStart,
      policy,
    );

    return {
      success: true,
      compliant: !result.hasBreach,
      ...result,
    };
  }

  /**
   * Check if fit for shift
   */
  @Get('fatigue/fit-for-shift/:employeeId')
  @ApiOperation({ summary: 'Check if employee is fit for shift' })
  async checkFitForShift(
    @Param('employeeId') employeeId: string,
    @Query('shiftStart') shiftStart: string,
    @Query('duration') duration: number,
    @Query('country') country: string,
  ) {
    const policy = await this.policyEngine.findApplicablePolicy({
      country: country as any,
    });

    if (!policy) {
      return { success: false, error: 'No policy found' };
    }

    const result = await this.fatigueTracker.isFitForShift(
      employeeId,
      new Date(shiftStart),
      duration,
      policy,
    );

    return {
      success: true,
      ...result,
    };
  }

  // ==================== BUDGET ====================

  /**
   * Create budget
   */
  @Post('budgets')
  @ApiOperation({ summary: 'Create overtime budget' })
  async createBudget(@Body() dto: CreateBudgetDto) {
    this.logger.log(`Creating budget: ${dto.name}`);
    
    return {
      success: true,
      message: 'Budget created successfully',
      // budget: created,
    };
  }

  /**
   * Check budget capacity
   */
  @Get('budgets/check-capacity')
  @ApiOperation({ summary: 'Check if overtime is within budget' })
  async checkBudgetCapacity(
    @Query('costCenter') costCenter: string,
    @Query('project') project: string,
    @Query('hours') hours: number,
    @Query('amount') amount: number,
  ) {
    const result = await this.budgetValidator.checkBudgetCapacity(
      costCenter,
      project,
      +hours,
      +amount,
    );

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get budget forecast
   */
  @Get('budgets/:id/forecast')
  @ApiOperation({ summary: 'Get budget forecast' })
  async getBudgetForecast(@Param('id') budgetId: string) {
    const forecast = await this.budgetValidator.generateForecast(budgetId);
    
    return {
      success: true,
      ...forecast,
    };
  }

  /**
   * Get budgets needing attention
   */
  @Get('budgets/attention')
  @ApiOperation({ summary: 'Get budgets with warnings or exceeded' })
  async getBudgetsNeedingAttention() {
    const budgets = await this.budgetValidator.getBudgetsNeedingAttention();
    
    return {
      success: true,
      count: budgets.length,
      budgets,
    };
  }

  // ==================== POLICIES ====================

  /**
   * Initialize default policies
   */
  @Post('policies/initialize')
  @ApiOperation({ summary: 'Initialize default country policies' })
  async initializePolicies(@Body() dto: InitializePoliciesDto) {
    this.logger.log(`Initializing policies for org ${dto.organizationId}`);
    
    const policies = await this.policyEngine.initializeDefaultPolicies(dto.organizationId);
    
    return {
      success: true,
      message: `Created ${policies.length} policies`,
      policies: policies.map(p => ({
        id: p.id,
        name: p.name,
        country: p.country,
        sector: p.sector,
      })),
    };
  }

  /**
   * Get applicable policy
   */
  @Get('policies/applicable')
  @ApiOperation({ summary: 'Get applicable policy for employee/date' })
  async getApplicablePolicy(
    @Query('country') country: string,
    @Query('sector') sector?: string,
    @Query('state') state?: string,
    @Query('date') date?: string,
  ) {
    const policy = await this.policyEngine.findApplicablePolicy({
      country: country as any,
      sector: sector as any,
      stateProvince: state,
      effectiveDate: date ? new Date(date) : new Date(),
    });

    if (!policy) {
      return {
        success: false,
        message: 'No applicable policy found',
      };
    }

    return {
      success: true,
      policy: {
        id: policy.id,
        name: policy.name,
        country: policy.country,
        sector: policy.sector,
        weeklyThreshold: policy.weeklyHoursThreshold,
        dailyThreshold: policy.dailyHoursThreshold,
        premiums: policy.premiumLadders,
      },
    };
  }

  // ==================== REPORTING & EXPORT ====================

  /**
   * Query overtime lines
   */
  @Get('lines')
  @ApiOperation({ summary: 'Query overtime lines with filters' })
  async queryOvertimeLines(@Query() query: QueryOvertimeDto) {
    this.logger.log('Querying overtime lines');
    
    return {
      success: true,
      page: query.page || 1,
      limit: query.limit || 50,
      total: 0,
      data: [],
      // Would query OvertimeLine repository with filters
    };
  }

  /**
   * Export to payroll
   */
  @Post('export/payroll')
  @ApiOperation({ summary: 'Export overtime to payroll system' })
  async exportToPayroll(@Body() dto: ExportToPayrollDto) {
    this.logger.log(`Exporting OT to payroll ${dto.payrollId}`);
    
    return {
      success: true,
      message: 'Overtime exported to payroll',
      linesExported: 0,
      totalAmount: 0,
      // Would query, lock, and export OvertimeLines
    };
  }

  /**
   * Get audit trail
   */
  @Get('audit/:lineId')
  @ApiOperation({ summary: 'Get audit trail for overtime line' })
  async getAuditTrail(@Param('lineId') lineId: string) {
    this.logger.log(`Fetching audit trail for line ${lineId}`);
    
    return {
      success: true,
      lineId,
      explainTrace: {},
      timeBlocks: [],
      approvals: [],
      // Full audit trail
    };
  }
}
