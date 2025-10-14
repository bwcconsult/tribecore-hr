import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveSegment } from '../entities/leave-segment.entity';
import { LeaveType } from '../entities/leave-type.entity';

interface PayrollDeduction {
  employeeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  payrollCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalHours: number;
  paidHours: number;
  unpaidHours: number;
  payRate: number; // 1.0 = full, 0.5 = half, 0 = unpaid
  deductionAmount?: number;
  leaveRequestId: string;
  status: string;
  notes?: string;
}

interface SickPayCalculation {
  employeeId: string;
  sickDays: number;
  fullPayDays: number;
  halfPayDays: number;
  unpaidDays: number;
  fullPayAmount: number;
  halfPayAmount: number;
  totalDeduction: number;
  stage: string; // FULL, HALF, UNPAID
}

/**
 * PayrollIntegrationService
 * Exports leave deductions to payroll system
 * Handles sick pay calculations, unpaid leave
 */
@Injectable()
export class PayrollIntegrationService {
  private readonly logger = new Logger(PayrollIntegrationService.name);

  constructor(
    @InjectRepository(LeaveRequest)
    private requestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveSegment)
    private segmentRepo: Repository<LeaveSegment>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
  ) {}

  /**
   * Export leave deductions for payroll period
   */
  async exportLeaveDeductions(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<PayrollDeduction[]> {
    // Get all approved leave requests that overlap with payroll period
    const requests = await this.requestRepo
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.leaveType', 'lt')
      .leftJoinAndSelect('lr.segments', 'seg')
      .where('lr.organizationId = :organizationId', { organizationId })
      .andWhere('lr.status = :status', { status: 'APPROVED' })
      .andWhere('lr.isLocked = false') // Not yet exported
      .andWhere(
        '(lr.startDate BETWEEN :periodStart AND :periodEnd OR lr.endDate BETWEEN :periodStart AND :periodEnd OR (lr.startDate <= :periodStart AND lr.endDate >= :periodEnd))',
        { periodStart, periodEnd },
      )
      .getMany();

    const deductions: PayrollDeduction[] = [];

    for (const request of requests) {
      const leaveType = request.leaveType as any;
      
      // Get segments within payroll period
      const segments = (request.segments as any[]).filter(seg => {
        const segDate = new Date(seg.date);
        return segDate >= periodStart && segDate <= periodEnd && seg.status === 'APPROVED';
      });

      const totalMinutes = segments.reduce((sum, seg) => sum + seg.minutesDeducted, 0);
      const totalDays = segments.filter(seg => seg.isWorkingDay).length;

      // Calculate paid vs unpaid hours
      let paidHours = 0;
      let unpaidHours = 0;
      let payRate = 1.0;

      if (leaveType.code === 'SICK' && leaveType.paidStages) {
        // Calculate sick pay based on stages
        const sickCalc = this.calculateSickPay(request, segments, leaveType);
        paidHours = (sickCalc.fullPayAmount + sickCalc.halfPayAmount) / 8; // Assuming 8h day
        unpaidHours = (totalMinutes / 60) - paidHours;
        payRate = paidHours > 0 ? paidHours / (totalMinutes / 60) : 0;
      } else if (leaveType.affectsPayroll === false) {
        // Unpaid leave (FMLA, sabbatical, etc.)
        unpaidHours = totalMinutes / 60;
        payRate = 0;
      } else {
        // Paid leave (annual leave, TOIL, etc.)
        paidHours = totalMinutes / 60;
        payRate = 1.0;
      }

      deductions.push({
        employeeId: request.employeeId,
        leaveTypeCode: leaveType.code,
        leaveTypeName: leaveType.name,
        payrollCode: leaveType.payrollCode || `LEAVE_${leaveType.code}`,
        startDate: request.startDate.toISOString().split('T')[0],
        endDate: request.endDate.toISOString().split('T')[0],
        totalDays,
        totalHours: totalMinutes / 60,
        paidHours,
        unpaidHours,
        payRate,
        leaveRequestId: request.id,
        status: 'READY_FOR_EXPORT',
        notes: request.reason,
      });
    }

    this.logger.log(
      `Exported ${deductions.length} leave deductions for period ${periodStart.toISOString()} - ${periodEnd.toISOString()}`,
    );

    return deductions;
  }

  /**
   * Calculate sick pay based on stages
   */
  private calculateSickPay(
    request: LeaveRequest,
    segments: any[],
    leaveType: any,
  ): SickPayCalculation {
    const paidStages = leaveType.paidStages || [];
    
    // Get previous sick leave to determine current stage
    // Simplified - in real system, query sick leave history
    const totalSickDays = segments.length;
    
    let fullPayDays = 0;
    let halfPayDays = 0;
    let unpaidDays = 0;
    let currentDay = 0;

    for (const segment of segments) {
      currentDay++;
      
      // Determine pay rate for this day
      let payRate = 0;
      for (const stage of paidStages) {
        if (currentDay <= stage.days) {
          payRate = stage.payRate;
          break;
        }
      }

      if (payRate === 1.0) {
        fullPayDays++;
      } else if (payRate === 0.5) {
        halfPayDays++;
      } else {
        unpaidDays++;
      }
    }

    // Assume 8-hour days and hourly rate (would be employee-specific in real system)
    const hourlyRate = 25; // Mock - get from employee record
    const fullPayAmount = fullPayDays * 8 * hourlyRate;
    const halfPayAmount = halfPayDays * 8 * hourlyRate * 0.5;
    const totalDeduction = (unpaidDays * 8 * hourlyRate) + (halfPayDays * 8 * hourlyRate * 0.5);

    let stage = 'FULL';
    if (unpaidDays > 0) stage = 'UNPAID';
    else if (halfPayDays > 0) stage = 'HALF';

    return {
      employeeId: request.employeeId,
      sickDays: totalSickDays,
      fullPayDays,
      halfPayDays,
      unpaidDays,
      fullPayAmount,
      halfPayAmount,
      totalDeduction,
      stage,
    };
  }

  /**
   * Mark requests as exported (lock them)
   */
  async markAsExported(
    leaveRequestIds: string[],
    payrollBatchId: string,
  ): Promise<number> {
    const result = await this.requestRepo.update(
      { id: { $in: leaveRequestIds } as any },
      {
        exportedToPayroll: true,
        payrollBatchId,
        payrollExportedAt: new Date(),
        isLocked: true,
      },
    );

    this.logger.log(
      `Marked ${leaveRequestIds.length} requests as exported (batch: ${payrollBatchId})`,
    );

    return leaveRequestIds.length;
  }

  /**
   * Generate payroll file (CSV format)
   */
  async generatePayrollCSV(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<string> {
    const deductions = await this.exportLeaveDeductions(
      organizationId,
      periodStart,
      periodEnd,
    );

    // CSV header
    let csv = 'EmployeeID,LeaveType,PayrollCode,StartDate,EndDate,Days,Hours,PaidHours,UnpaidHours,PayRate,Status,Notes\n';

    // CSV rows
    for (const deduction of deductions) {
      csv += [
        deduction.employeeId,
        deduction.leaveTypeName,
        deduction.payrollCode,
        deduction.startDate,
        deduction.endDate,
        deduction.totalDays,
        deduction.totalHours.toFixed(2),
        deduction.paidHours.toFixed(2),
        deduction.unpaidHours.toFixed(2),
        deduction.payRate.toFixed(2),
        deduction.status,
        `"${deduction.notes || ''}"`,
      ].join(',') + '\n';
    }

    return csv;
  }

  /**
   * Generate payroll JSON (for API integration)
   */
  async generatePayrollJSON(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<{
    organizationId: string;
    period: { start: string; end: string };
    deductions: PayrollDeduction[];
    summary: {
      totalEmployees: number;
      totalRequests: number;
      totalHours: number;
      totalPaidHours: number;
      totalUnpaidHours: number;
    };
  }> {
    const deductions = await this.exportLeaveDeductions(
      organizationId,
      periodStart,
      periodEnd,
    );

    const uniqueEmployees = new Set(deductions.map(d => d.employeeId));
    const totalHours = deductions.reduce((sum, d) => sum + d.totalHours, 0);
    const totalPaidHours = deductions.reduce((sum, d) => sum + d.paidHours, 0);
    const totalUnpaidHours = deductions.reduce((sum, d) => sum + d.unpaidHours, 0);

    return {
      organizationId,
      period: {
        start: periodStart.toISOString().split('T')[0],
        end: periodEnd.toISOString().split('T')[0],
      },
      deductions,
      summary: {
        totalEmployees: uniqueEmployees.size,
        totalRequests: deductions.length,
        totalHours,
        totalPaidHours,
        totalUnpaidHours,
      },
    };
  }

  /**
   * Get payroll export history
   */
  async getExportHistory(
    organizationId: string,
    limit: number = 10,
  ): Promise<any[]> {
    const exports = await this.requestRepo
      .createQueryBuilder('lr')
      .select('lr.payrollBatchId', 'batchId')
      .addSelect('MIN(lr.payrollExportedAt)', 'exportedAt')
      .addSelect('COUNT(*)', 'requestCount')
      .addSelect('SUM(lr.totalMinutesDeducted)', 'totalMinutes')
      .where('lr.organizationId = :organizationId', { organizationId })
      .andWhere('lr.exportedToPayroll = true')
      .groupBy('lr.payrollBatchId')
      .orderBy('MIN(lr.payrollExportedAt)', 'DESC')
      .limit(limit)
      .getRawMany();

    return exports.map(e => ({
      batchId: e.batchId,
      exportedAt: e.exportedAt,
      requestCount: parseInt(e.requestCount),
      totalHours: (parseInt(e.totalMinutes) / 60).toFixed(2),
    }));
  }

  /**
   * Rollback payroll export (unlock requests)
   */
  async rollbackExport(payrollBatchId: string): Promise<number> {
    const result = await this.requestRepo.update(
      { payrollBatchId },
      {
        exportedToPayroll: false,
        payrollBatchId: null,
        payrollExportedAt: null,
        isLocked: false,
      },
    );

    this.logger.warn(
      `Rolled back payroll export for batch ${payrollBatchId}`,
    );

    return result.affected || 0;
  }
}
