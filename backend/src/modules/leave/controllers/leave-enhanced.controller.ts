import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveApproval } from '../entities/leave-approval.entity';
import { Entitlement } from '../entities/entitlement.entity';
import { PublicHoliday } from '../entities/public-holiday.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { WorkingPattern } from '../entities/working-pattern.entity';
import { PolicyEngineService } from '../services/policy-engine.service';
import { DeductionEngineService } from '../services/deduction-engine.service';
import { CoverageValidationService } from '../services/coverage-validation.service';
import { ApprovalWorkflowService } from '../services/approval-workflow.service';
import { AccrualCalculationService } from '../services/accrual-calculation.service';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { ApproveLeaveDto, RejectLeaveDto, RequestChangesDto } from '../dto/approve-leave.dto';

/**
 * LeaveEnhancedController
 * Comprehensive REST API for world-class Holiday Planner
 * Supports multi-region, policy-driven leave management
 */
@ApiTags('Leave (Enhanced)')
@Controller('leave')
export class LeaveEnhancedController {
  constructor(
    @InjectRepository(LeaveRequest)
    private requestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveApproval)
    private approvalRepo: Repository<LeaveApproval>,
    @InjectRepository(Entitlement)
    private entitlementRepo: Repository<Entitlement>,
    @InjectRepository(PublicHoliday)
    private publicHolidayRepo: Repository<PublicHoliday>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(WorkingPattern)
    private workingPatternRepo: Repository<WorkingPattern>,
    private policyEngine: PolicyEngineService,
    private deductionEngine: DeductionEngineService,
    private coverageService: CoverageValidationService,
    private approvalWorkflow: ApprovalWorkflowService,
    private accrualService: AccrualCalculationService,
  ) {}

  // ==================== LEAVE REQUESTS ====================

  /**
   * POST /leave-requests
   * Create a new leave request with full validation
   */
  @Post('requests')
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  async createLeaveRequest(
    @Body() dto: CreateLeaveRequestDto,
    @Request() req: any,
  ) {
    const organizationId = req.user?.organizationId || 'ORG001';

    // 1. Get leave type policy
    const leaveType = await this.policyEngine.getLeaveType(organizationId, dto.leaveTypeCode);
    if (!leaveType) {
      throw new HttpException('Leave type not found', HttpStatus.NOT_FOUND);
    }

    // 2. Get employee's working pattern
    // TODO: Get from employee service
    const workingPattern = await this.workingPatternRepo.findOne({
      where: { organizationId, isActive: true },
    });

    if (!workingPattern) {
      throw new HttpException('Working pattern not configured', HttpStatus.BAD_REQUEST);
    }

    // 3. Get public holidays
    const publicHolidays = await this.policyEngine.getPublicHolidays(
      organizationId,
      'GB', // TODO: Get from employee location
      'ENG',
      dto.startDate,
      dto.endDate,
    );

    // 4. Calculate deductions
    const deductions = await this.deductionEngine.calculateDeductions(
      'temp-id', // Will be updated after save
      dto.employeeId,
      organizationId,
      dto.startDate,
      dto.endDate,
      workingPattern,
      leaveType,
      publicHolidays,
      dto.partialDays,
    );

    // 5. Calculate notice days
    const noticeDays = Math.ceil(
      (dto.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    const meetsNotice = noticeDays >= leaveType.minNoticeDays;

    // 6. Check balance
    const entitlement = await this.entitlementRepo.findOne({
      where: {
        employeeId: dto.employeeId,
        leaveTypeId: leaveType.id,
        organizationId,
      },
    });

    const balanceBefore = entitlement?.minutesAvailable || 0;
    const balanceAfter = balanceBefore - deductions.totalMinutesDeducted;
    const causesNegativeBalance = balanceAfter < 0 && !leaveType.allowNegativeBalance;

    // 7. Check embargoes
    const embargoes = await this.policyEngine.checkEmbargoes(
      organizationId,
      dto.employeeId,
      dto.leaveTypeCode,
      dto.startDate,
      dto.endDate,
    );

    // 8. Check coverage (if configured)
    const coverageRules = [
      { scope: 'DEPT:ENGINEERING', role: 'Developer', minOnShift: 3 },
    ]; // TODO: Load from policy

    const coverageCheck = await this.coverageService.checkCoverage(
      organizationId,
      dto.employeeId,
      dto.startDate,
      dto.endDate,
      coverageRules,
    );

    // 9. Create leave request
    const request = this.requestRepo.create({
      employeeId: dto.employeeId,
      organizationId,
      leaveTypeId: leaveType.id,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalMinutesRequested: deductions.totalMinutesDeducted,
      totalMinutesDeducted: deductions.totalMinutesDeducted,
      workingDaysCount: deductions.workingDaysCount,
      calendarDaysCount: deductions.calendarDaysCount,
      partialDays: dto.partialDays,
      reason: dto.reason,
      employeeNotes: dto.employeeNotes,
      attachments: dto.attachments,
      status: 'PENDING',
      noticeDaysGiven: noticeDays,
      meetsNoticeRequirement: meetsNotice,
      meetsComplianceRules: meetsNotice && !causesNegativeBalance,
      complianceWarnings: [],
      balanceBeforeRequest: balanceBefore,
      balanceAfterRequest: balanceAfter,
      causesNegativeBalance,
      hasEmbargoConflict: embargoes.length > 0,
      embargoConflicts: embargoes.map(e => ({
        embargoId: e.id,
        name: e.name,
        canOverride: e.allowOverride,
      })),
      publicHolidaysInRange: deductions.publicHolidaysInRange,
      coverageAnalysis: {
        affected: !coverageCheck.isSafe,
        breaches: coverageCheck.breaches,
        requiresBackfill: coverageCheck.requiresBackfill,
        alternativeDates: coverageCheck.suggestedAlternatives?.map(d => d.toISOString()),
      },
    });

    const savedRequest = await this.requestRepo.save(request);

    // 10. Save segments
    const segments = deductions.segments.map(seg => ({
      ...seg,
      leaveRequestId: savedRequest.id,
    }));
    await this.deductionEngine.saveSegments(segments as any);

    // 11. Check auto-approval
    const workflowConfig = {
      default: ['LINE_MANAGER', 'ROSTER_OWNER?'],
      thresholds: [
        { type: 'AL', hoursGreaterThan: 40, add: 'DEPARTMENT_HEAD' },
      ],
      autoApprove: {
        maxHours: 4,
        minNoticeDays: 7,
        requiresCoverageOK: true,
      },
      slaHours: {
        LINE_MANAGER: 48,
        DEPARTMENT_HEAD: 24,
      },
    };

    const autoApproveCheck = this.approvalWorkflow.canAutoApprove(
      savedRequest,
      workflowConfig,
      coverageCheck.isSafe,
    );

    if (autoApproveCheck.canAutoApprove) {
      savedRequest.autoApproved = true;
      savedRequest.autoApprovalReason = autoApproveCheck.reason;
      savedRequest.status = 'APPROVED';
      savedRequest.isFullyApproved = true;
      await this.requestRepo.save(savedRequest);

      // Update balance
      if (entitlement) {
        entitlement.deduct(deductions.totalMinutesDeducted, false);
        await this.entitlementRepo.save(entitlement);
      }
    } else {
      // 12. Build approval chain
      const employeeData = {
        managerId: 'MGR001', // TODO: Get from employee
        departmentHeadId: 'HEAD001',
        rosterOwnerId: 'ROSTER001',
        hasRosterConflict: false,
      };

      await this.approvalWorkflow.buildApprovalChain(
        savedRequest,
        workflowConfig,
        employeeData,
      );

      // Update entitlement as pending
      if (entitlement) {
        entitlement.deduct(deductions.totalMinutesDeducted, true);
        await this.entitlementRepo.save(entitlement);
      }
    }

    return {
      id: savedRequest.id,
      status: savedRequest.status,
      autoApproved: savedRequest.autoApproved,
      totalDaysRequested: deductions.workingDaysCount,
      totalHoursRequested: (deductions.totalMinutesDeducted / 60).toFixed(2),
      balanceAfter: (balanceAfter / 60).toFixed(2),
      warnings: [
        ...(!meetsNotice ? [`Requires ${leaveType.minNoticeDays} days notice`] : []),
        ...(causesNegativeBalance ? ['Would cause negative balance'] : []),
        ...(embargoes.length > 0 ? [`Conflicts with ${embargoes[0].name}`] : []),
        ...(!coverageCheck.isSafe ? [`Coverage breach - ${coverageCheck.breaches.length} dates`] : []),
      ],
      coverageBreaches: coverageCheck.breaches,
      suggestedAlternatives: coverageCheck.suggestedAlternatives,
    };
  }

  /**
   * GET /leave-requests
   * Get leave requests with filters
   */
  @Get('requests')
  @ApiOperation({ summary: 'Get leave requests' })
  async getLeaveRequests(
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Query('approverId') approverId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const query = this.requestRepo.createQueryBuilder('lr').leftJoinAndSelect('lr.leaveType', 'lt');

    if (status) {
      query.andWhere('lr.status = :status', { status });
    }

    if (employeeId) {
      query.andWhere('lr.employeeId = :employeeId', { employeeId });
    }

    if (approverId) {
      // Find requests pending approval by this user
      query
        .leftJoin('lr.approvals', 'app')
        .andWhere('app.approverId = :approverId', { approverId })
        .andWhere('app.decision = :decision', { decision: 'PENDING' });
    }

    if (startDate && endDate) {
      query.andWhere('lr.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const requests = await query.orderBy('lr.createdAt', 'DESC').getMany();

    return requests.map(r => ({
      id: r.id,
      employeeId: r.employeeId,
      leaveType: (r.leaveType as any)?.name,
      leaveTypeCode: (r.leaveType as any)?.code,
      startDate: r.startDate,
      endDate: r.endDate,
      durationHours: (r.totalMinutesDeducted / 60).toFixed(2),
      durationDays: r.workingDaysCount,
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt,
    }));
  }

  /**
   * GET /leave-requests/:id
   * Get leave request details
   */
  @Get('requests/:id')
  @ApiOperation({ summary: 'Get leave request details' })
  async getLeaveRequest(@Param('id') id: string) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['leaveType', 'segments', 'approvals'],
    });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    return request;
  }

  /**
   * POST /leave-requests/:id/approve
   * Approve a leave request
   */
  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Approve leave request' })
  async approveRequest(
    @Param('id') id: string,
    @Body() dto: ApproveLeaveDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.id || 'USER001';

    // Find pending approval for this user
    const approval = await this.approvalRepo.findOne({
      where: {
        leaveRequestId: id,
        approverId,
        decision: 'PENDING',
      },
    });

    if (!approval) {
      throw new HttpException('No pending approval found', HttpStatus.NOT_FOUND);
    }

    const result = await this.approvalWorkflow.approve(
      approval.id,
      approverId,
      dto.comment,
      dto.override,
    );

    return {
      approved: true,
      completed: result.completed,
      nextStep: result.nextStep?.stepName,
      message: result.completed
        ? 'Request fully approved'
        : `Approved - awaiting ${result.nextStep?.stepName}`,
    };
  }

  /**
   * POST /leave-requests/:id/reject
   * Reject a leave request
   */
  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject leave request' })
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectLeaveDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.id || 'USER001';

    const approval = await this.approvalRepo.findOne({
      where: {
        leaveRequestId: id,
        approverId,
        decision: 'PENDING',
      },
    });

    if (!approval) {
      throw new HttpException('No pending approval found', HttpStatus.NOT_FOUND);
    }

    await this.approvalWorkflow.reject(approval.id, approverId, dto.reason);

    return {
      rejected: true,
      message: 'Request rejected',
    };
  }

  /**
   * POST /leave-requests/:id/cancel
   * Cancel a leave request
   */
  @Post('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  async cancelRequest(@Param('id') id: string, @Request() req: any) {
    const request = await this.requestRepo.findOne({ where: { id } });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    if (!request.canBeCancelled()) {
      throw new HttpException('Request cannot be cancelled', HttpStatus.BAD_REQUEST);
    }

    request.isCancelled = true;
    request.cancelledBy = req.user?.id || 'USER001';
    request.cancelledAt = new Date();
    request.status = 'CANCELLED';

    await this.requestRepo.save(request);

    // Return balance
    const entitlement = await this.entitlementRepo.findOne({
      where: {
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
      },
    });

    if (entitlement) {
      const wasPending = request.status === 'PENDING';
      entitlement.returnToBalance(request.totalMinutesDeducted, wasPending);
      await this.entitlementRepo.save(entitlement);
    }

    return {
      cancelled: true,
      message: 'Request cancelled and balance restored',
    };
  }

  // ==================== BALANCES ====================

  /**
   * GET /employees/:id/leave/balances
   * Get leave balances for employee
   */
  @Get('employees/:id/leave/balances')
  @ApiOperation({ summary: 'Get employee leave balances' })
  async getBalances(
    @Param('id') employeeId: string,
    @Query('asOf') asOf?: string,
  ) {
    const date = asOf ? new Date(asOf) : new Date();

    const entitlements = await this.entitlementRepo.find({
      where: { employeeId },
      relations: ['leaveType'],
    });

    return entitlements.map(ent => ({
      leaveTypeCode: (ent.leaveType as any)?.code,
      leaveTypeName: (ent.leaveType as any)?.name,
      color: (ent.leaveType as any)?.color,
      entitled: (ent.minutesEntitled / 60).toFixed(2),
      accrued: (ent.minutesAccrued / 60).toFixed(2),
      carriedOver: (ent.minutesCarriedOver / 60).toFixed(2),
      purchased: (ent.minutesPurchased / 60).toFixed(2),
      sold: (ent.minutesSold / 60).toFixed(2),
      taken: (ent.minutesTaken / 60).toFixed(2),
      pending: (ent.minutesPending / 60).toFixed(2),
      available: (ent.minutesAvailable / 60).toFixed(2),
      expiringSoon: (ent.minutesExpiringSoon / 60).toFixed(2),
      expiryDate: ent.carryoverExpiryDate,
    }));
  }

  // ==================== PUBLIC HOLIDAYS ====================

  /**
   * GET /holidays
   * Get public holidays
   */
  @Get('holidays')
  @ApiOperation({ summary: 'Get public holidays' })
  async getPublicHolidays(
    @Query('country') country: string,
    @Query('state') state?: string,
    @Query('year') year?: number,
  ) {
    const query = this.publicHolidayRepo.createQueryBuilder('ph').where('ph.country = :country', { country });

    if (state) {
      query.andWhere('(ph.state = :state OR ph.state IS NULL)', { state });
    }

    if (year) {
      query.andWhere('ph.year = :year', { year });
    }

    const holidays = await query.orderBy('ph.date', 'ASC').getMany();

    return holidays.map(h => ({
      date: h.date,
      name: h.name,
      type: h.type,
      isCompanySpecific: h.isCompanySpecific,
    }));
  }

  // ==================== POLICY MANAGEMENT ====================

  /**
   * GET /policies/:id
   * Get organization leave policy
   */
  @Get('policies/:id')
  @ApiOperation({ summary: 'Get leave policy' })
  async getPolicy(@Param('id') organizationId: string) {
    const leaveTypes = await this.policyEngine.getLeaveTypes(organizationId);

    return {
      organizationId,
      leaveTypes: leaveTypes.map(lt => ({
        code: lt.code,
        name: lt.name,
        unit: lt.unit,
        entitlement: lt.entitlement,
        accrual: lt.accrual,
        carryover: lt.carryover,
        purchaseSell: lt.purchaseSell,
        minNoticeDays: lt.minNoticeDays,
      })),
    };
  }

  // ==================== EXPORTS ====================

  /**
   * GET /exports/payroll/leave-deductions
   * Export leave deductions for payroll
   */
  @Get('exports/payroll/leave-deductions')
  @ApiOperation({ summary: 'Export leave deductions for payroll' })
  async exportPayrollDeductions(@Query('period') period: string) {
    // TODO: Implement payroll export
    // Query approved leave in period, format for payroll system

    return {
      period,
      records: [],
    };
  }
}
