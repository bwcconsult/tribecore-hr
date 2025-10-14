import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CoverageSnapshot } from '../entities/coverage-snapshot.entity';
import { LeaveSegment } from '../entities/leave-segment.entity';

interface CoverageRule {
  scope: string; // WARD:ICU, DEPT:ENGINEERING, LOCATION:LONDON
  role?: string;
  skill?: string;
  minOnShift: number;
  optimalLevel?: number;
}

interface CoverageCheckResult {
  isSafe: boolean;
  breaches: Array<{
    date: Date;
    scope: string;
    role?: string;
    scheduled: number;
    onLeave: number;
    remaining: number;
    minRequired: number;
    status: 'OK' | 'WARNING' | 'BREACH' | 'CRITICAL';
    coveragePercent: number;
  }>;
  warnings: string[];
  requiresBackfill: boolean;
  backfillCount: number;
  suggestedAlternatives?: Date[];
}

/**
 * CoverageValidationService
 * Validates staffing levels and safe staffing for 24/7 operations
 * Critical for hospitals, emergency services, manufacturing
 */
@Injectable()
export class CoverageValidationService {
  private readonly logger = new Logger(CoverageValidationService.name);

  constructor(
    @InjectRepository(CoverageSnapshot)
    private snapshotRepo: Repository<CoverageSnapshot>,
    @InjectRepository(LeaveSegment)
    private segmentRepo: Repository<LeaveSegment>,
  ) {}

  /**
   * Check coverage for a leave request
   */
  async checkCoverage(
    organizationId: string,
    employeeId: string,
    startDate: Date,
    endDate: Date,
    coverageRules: CoverageRule[],
    employeeScope?: {
      department?: string;
      location?: string;
      role?: string;
      skills?: string[];
    },
  ): Promise<CoverageCheckResult> {
    const breaches: CoverageCheckResult['breaches'] = [];
    const warnings: string[] = [];
    let requiresBackfill = false;
    let backfillCount = 0;

    // Iterate through each date in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Check each applicable coverage rule
      for (const rule of coverageRules) {
        // Check if rule applies to this employee
        if (!this.doesRuleApply(rule, employeeScope)) {
          continue;
        }

        // Get current staffing for this scope/date
        const staffing = await this.getStaffingForDate(
          organizationId,
          rule.scope,
          rule.role,
          rule.skill,
          currentDate,
        );

        // Calculate impact
        const remaining = staffing.scheduled - staffing.onLeave - 1; // -1 for this request
        const isBreach = remaining < rule.minOnShift;
        const isWarning = remaining < (rule.optimalLevel || rule.minOnShift + 2);

        let status: 'OK' | 'WARNING' | 'BREACH' | 'CRITICAL' = 'OK';
        if (isBreach) {
          status = remaining <= 0 ? 'CRITICAL' : 'BREACH';
          requiresBackfill = true;
          backfillCount++;
        } else if (isWarning) {
          status = 'WARNING';
        }

        const coveragePercent = (remaining / rule.minOnShift) * 100;

        if (status !== 'OK') {
          breaches.push({
            date: new Date(currentDate),
            scope: rule.scope,
            role: rule.role,
            scheduled: staffing.scheduled,
            onLeave: staffing.onLeave + 1,
            remaining,
            minRequired: rule.minOnShift,
            status,
            coveragePercent,
          });

          if (isBreach) {
            warnings.push(
              `${currentDate.toISOString().split('T')[0]}: ${rule.scope} - ` +
              `${remaining}/${rule.minOnShift} staff (${coveragePercent.toFixed(0)}% coverage)`,
            );
          }
        }

        // Create snapshot
        await this.createSnapshot({
          organizationId,
          scope: rule.scope,
          role: rule.role,
          skill: rule.skill,
          date: new Date(currentDate),
          scheduled: staffing.scheduled,
          onLeave: staffing.onLeave,
          remaining: staffing.scheduled - staffing.onLeave,
          minRequired: rule.minOnShift,
          optimalLevel: rule.optimalLevel,
          afterApproval: remaining,
          wouldCauseBreach: isBreach,
          status,
          coveragePercent: (staffing.scheduled - staffing.onLeave) / rule.minOnShift * 100,
          backfillRequired: isBreach,
          metadata: {
            requestImpact: true,
            employeeId,
          },
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Suggest alternative dates if breaches found
    const suggestedAlternatives = breaches.length > 0
      ? await this.findAlternativeDates(organizationId, startDate, endDate, coverageRules, employeeScope, 14)
      : undefined;

    const result: CoverageCheckResult = {
      isSafe: breaches.filter(b => b.status === 'BREACH' || b.status === 'CRITICAL').length === 0,
      breaches,
      warnings,
      requiresBackfill,
      backfillCount,
      suggestedAlternatives,
    };

    this.logger.log(
      `Coverage check: ${breaches.length} breaches, ${backfillCount} backfills required`,
    );

    return result;
  }

  /**
   * Get staffing levels for a specific date/scope
   */
  private async getStaffingForDate(
    organizationId: string,
    scope: string,
    role?: string,
    skill?: string,
    date?: Date,
  ): Promise<{ scheduled: number; onLeave: number }> {
    // This would query your roster/shift system
    // For now, return mock data
    // TODO: Integrate with actual roster system

    // Get approved leave count for this scope/date
    const segments = await this.segmentRepo
      .createQueryBuilder('seg')
      .where('seg.organizationId = :organizationId', { organizationId })
      .andWhere('seg.date = :date', { date })
      .andWhere('seg.status IN (:...statuses)', { statuses: ['APPROVED', 'PENDING'] })
      .andWhere('seg.minutesDeducted > 0')
      .getMany();

    // Filter by scope/role (would be more sophisticated in real system)
    const onLeave = segments.filter(seg => {
      // TODO: Match against employee's scope
      return true;
    }).length;

    // Mock scheduled count (in real system, query roster)
    const scheduled = 10; // Default team size

    return { scheduled, onLeave };
  }

  /**
   * Check if rule applies to employee
   */
  private doesRuleApply(
    rule: CoverageRule,
    employeeScope?: {
      department?: string;
      location?: string;
      role?: string;
      skills?: string[];
    },
  ): boolean {
    if (!employeeScope) return true;

    // Parse scope (e.g., "WARD:ICU" -> type: WARD, value: ICU)
    const [scopeType, scopeValue] = rule.scope.split(':');

    // Check scope match
    switch (scopeType) {
      case 'DEPT':
      case 'DEPARTMENT':
        if (employeeScope.department !== scopeValue) return false;
        break;
      case 'LOCATION':
        if (employeeScope.location !== scopeValue) return false;
        break;
      case 'WARD':
      case 'TEAM':
        // Would check against employee's assigned ward/team
        break;
    }

    // Check role match
    if (rule.role && employeeScope.role !== rule.role) {
      return false;
    }

    // Check skill match
    if (rule.skill && !employeeScope.skills?.includes(rule.skill)) {
      return false;
    }

    return true;
  }

  /**
   * Create coverage snapshot
   */
  private async createSnapshot(data: Partial<CoverageSnapshot>): Promise<CoverageSnapshot> {
    const snapshot = this.snapshotRepo.create(data);
    return this.snapshotRepo.save(snapshot);
  }

  /**
   * Find alternative dates with better coverage
   */
  private async findAlternativeDates(
    organizationId: string,
    originalStart: Date,
    originalEnd: Date,
    rules: CoverageRule[],
    employeeScope?: any,
    searchWindowDays: number = 14,
  ): Promise<Date[]> {
    const alternatives: Date[] = [];
    const duration = Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Search forward and backward
    for (let offset = 1; offset <= searchWindowDays; offset++) {
      // Try forward
      const forwardStart = new Date(originalStart);
      forwardStart.setDate(forwardStart.getDate() + offset);
      const forwardEnd = new Date(forwardStart);
      forwardEnd.setDate(forwardEnd.getDate() + duration - 1);

      const forwardCheck = await this.checkCoverage(
        organizationId,
        'temp',
        forwardStart,
        forwardEnd,
        rules,
        employeeScope,
      );

      if (forwardCheck.isSafe && alternatives.length < 3) {
        alternatives.push(forwardStart);
      }

      // Try backward
      const backwardStart = new Date(originalStart);
      backwardStart.setDate(backwardStart.getDate() - offset);
      const backwardEnd = new Date(backwardStart);
      backwardEnd.setDate(backwardEnd.getDate() + duration - 1);

      if (backwardStart >= new Date()) {
        const backwardCheck = await this.checkCoverage(
          organizationId,
          'temp',
          backwardStart,
          backwardEnd,
          rules,
          employeeScope,
        );

        if (backwardCheck.isSafe && alternatives.length < 3) {
          alternatives.push(backwardStart);
        }
      }

      if (alternatives.length >= 3) break;
    }

    return alternatives.sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Get coverage snapshots for date range
   */
  async getSnapshots(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    scope?: string,
  ): Promise<CoverageSnapshot[]> {
    const query = this.snapshotRepo
      .createQueryBuilder('cs')
      .where('cs.organizationId = :organizationId', { organizationId })
      .andWhere('cs.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (scope) {
      query.andWhere('cs.scope = :scope', { scope });
    }

    return query.orderBy('cs.date', 'ASC').orderBy('cs.scope', 'ASC').getMany();
  }

  /**
   * Get breach summary for period
   */
  async getBreachSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalDays: number;
    daysWithBreaches: number;
    criticalBreaches: number;
    warningDays: number;
    averageCoverage: number;
  }> {
    const snapshots = await this.getSnapshots(organizationId, startDate, endDate);

    const breaches = snapshots.filter(s => s.isBreach);
    const critical = snapshots.filter(s => s.status === 'CRITICAL');
    const warnings = snapshots.filter(s => s.status === 'WARNING');

    const uniqueDates = new Set(snapshots.map(s => s.date.toISOString().split('T')[0]));
    const breachDates = new Set(breaches.map(s => s.date.toISOString().split('T')[0]));

    const avgCoverage = snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + s.coveragePercent, 0) / snapshots.length
      : 100;

    return {
      totalDays: uniqueDates.size,
      daysWithBreaches: breachDates.size,
      criticalBreaches: critical.length,
      warningDays: warnings.length,
      averageCoverage: avgCoverage,
    };
  }

  /**
   * Check team off percentage
   */
  async checkTeamOffPercent(
    organizationId: string,
    teamId: string,
    date: Date,
    maxPercent: number,
  ): Promise<{ current: number; max: number; exceeded: boolean }> {
    // This would query team size and leave count
    // Mock implementation
    const teamSize = 20;
    const onLeave = 3;
    const currentPercent = (onLeave / teamSize) * 100;

    return {
      current: currentPercent,
      max: maxPercent,
      exceeded: currentPercent > maxPercent,
    };
  }
}
