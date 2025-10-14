import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entitlement } from '../entities/entitlement.entity';
import { AccrualLog } from '../entities/accrual-log.entity';
import { LeaveType } from '../entities/leave-type.entity';

/**
 * AccrualCalculationService
 * Calculates monthly accruals, pro-rating, and carryovers
 * Implements UK/US/SA/NG accrual methods
 */
@Injectable()
export class AccrualCalculationService {
  private readonly logger = new Logger(AccrualCalculationService.name);

  constructor(
    @InjectRepository(Entitlement)
    private entitlementRepo: Repository<Entitlement>,
    @InjectRepository(AccrualLog)
    private accrualLogRepo: Repository<AccrualLog>,
  ) {}

  /**
   * Calculate monthly accrual for employee
   * Formula: (annualEntitlement * FTE%) / 12
   */
  async calculateMonthlyAccrual(
    employeeId: string,
    organizationId: string,
    leaveType: LeaveType,
    ftePercentage: number,
    period: Date,
    joinedMidPeriod?: Date,
  ): Promise<{ minutesAdded: number; calculation: any }> {
    if (leaveType.accrual.method !== 'MONTHLY_PRORATA') {
      return { minutesAdded: 0, calculation: { method: leaveType.accrual.method } };
    }

    // Get annual entitlement in minutes
    const annualHours = leaveType.calculateEntitlement(ftePercentage);
    const annualMinutes = annualHours * 60;

    // Monthly rate
    let monthlyMinutes = annualMinutes / 12;

    // Pro-rate if joined mid-month
    let proRataFactor = 1.0;
    let daysWorked = this.getDaysInMonth(period);
    const daysInMonth = daysWorked;

    if (joinedMidPeriod && leaveType.proRataOnJoin) {
      const joinDate = new Date(joinedMidPeriod);
      if (joinDate.getMonth() === period.getMonth() && joinDate.getFullYear() === period.getFullYear()) {
        daysWorked = daysInMonth - joinDate.getDate() + 1;
        proRataFactor = daysWorked / daysInMonth;
        monthlyMinutes *= proRataFactor;
      }
    }

    // Apply rounding
    monthlyMinutes = this.applyRounding(monthlyMinutes, leaveType.accrual.rounding);

    const calculation = {
      annualEntitlement: annualHours,
      ftePercentage,
      monthlyRate: monthlyMinutes / 60,
      proRataFactor,
      daysInMonth,
      daysWorked,
      roundingApplied: leaveType.accrual.rounding,
      formula: `(${annualHours}h * ${ftePercentage}) / 12 * ${proRataFactor}`,
    };

    return { minutesAdded: Math.round(monthlyMinutes), calculation };
  }

  /**
   * Process monthly accrual for an entitlement
   */
  async processMonthlyAccrual(
    entitlementId: string,
    period: Date,
    processedBy: string = 'SYSTEM',
  ): Promise<{ entitlement: Entitlement; accrualLog: AccrualLog }> {
    const entitlement = await this.entitlementRepo.findOne({
      where: { id: entitlementId },
      relations: ['leaveType'],
    });

    if (!entitlement) {
      throw new Error(`Entitlement ${entitlementId} not found`);
    }

    // Check if already accrued for this period
    const existingLog = await this.accrualLogRepo.findOne({
      where: {
        employeeId: entitlement.employeeId,
        leaveTypeId: entitlement.leaveTypeId,
        period,
      },
    });

    if (existingLog) {
      this.logger.warn(`Accrual already processed for ${entitlementId} in ${period.toISOString()}`);
      return { entitlement, accrualLog: existingLog };
    }

    const leaveType = entitlement.leaveType as any;

    // Calculate accrual
    const { minutesAdded, calculation } = await this.calculateMonthlyAccrual(
      entitlement.employeeId,
      entitlement.organizationId,
      leaveType,
      entitlement.ftePercentage,
      period,
      entitlement.joinDateForPeriod,
    );

    // Update entitlement
    entitlement.minutesAccrued += minutesAdded;
    entitlement.recalculateAvailable();
    entitlement.lastCalculatedAt = new Date();
    entitlement.lastCalculatedBy = processedBy;

    const savedEntitlement = await this.entitlementRepo.save(entitlement);

    // Create accrual log
    const accrualLog = this.accrualLogRepo.create({
      employeeId: entitlement.employeeId,
      organizationId: entitlement.organizationId,
      leaveTypeId: entitlement.leaveTypeId,
      period,
      minutesAdded,
      ftePercentage: entitlement.ftePercentage,
      daysInMonth: calculation.daysInMonth,
      daysWorked: calculation.daysWorked,
      source: 'MONTHLY_PRORATA',
      calculation,
      processedBy,
    });

    const savedLog = await this.accrualLogRepo.save(accrualLog);

    this.logger.log(
      `Accrued ${(minutesAdded / 60).toFixed(2)}h for employee ${entitlement.employeeId} (${leaveType.code})`,
    );

    return { entitlement: savedEntitlement, accrualLog: savedLog };
  }

  /**
   * Process upfront accrual (grant all at start of year)
   */
  async processUpfrontAccrual(
    entitlementId: string,
    processedBy: string = 'SYSTEM',
  ): Promise<Entitlement> {
    const entitlement = await this.entitlementRepo.findOne({
      where: { id: entitlementId },
      relations: ['leaveType'],
    });

    if (!entitlement) {
      throw new Error(`Entitlement ${entitlementId} not found`);
    }

    const leaveType = entitlement.leaveType as any;

    if (leaveType.accrual.method !== 'UPFRONT') {
      throw new Error(`Leave type ${leaveType.code} is not UPFRONT accrual`);
    }

    // Grant full entitlement upfront
    entitlement.minutesAccrued = entitlement.minutesEntitled;
    entitlement.recalculateAvailable();
    entitlement.lastCalculatedAt = new Date();
    entitlement.lastCalculatedBy = processedBy;

    const saved = await this.entitlementRepo.save(entitlement);

    // Create log
    const accrualLog = this.accrualLogRepo.create({
      employeeId: entitlement.employeeId,
      organizationId: entitlement.organizationId,
      leaveTypeId: entitlement.leaveTypeId,
      period: entitlement.periodStart,
      minutesAdded: entitlement.minutesEntitled,
      ftePercentage: entitlement.ftePercentage,
      source: 'UPFRONT',
      processedBy,
      notes: 'Full annual entitlement granted upfront',
    });

    await this.accrualLogRepo.save(accrualLog);

    this.logger.log(
      `Granted upfront ${(entitlement.minutesEntitled / 60).toFixed(2)}h for employee ${entitlement.employeeId}`,
    );

    return saved;
  }

  /**
   * Process carryover from previous period
   */
  async processCarryover(
    entitlementId: string,
    previousPeriodId: string,
    processedBy: string = 'SYSTEM',
  ): Promise<{ current: Entitlement; minutesCarried: number }> {
    const currentEntitlement = await this.entitlementRepo.findOne({
      where: { id: entitlementId },
      relations: ['leaveType'],
    });

    const previousEntitlement = await this.entitlementRepo.findOne({
      where: { id: previousPeriodId },
    });

    if (!currentEntitlement || !previousEntitlement) {
      throw new Error('Entitlements not found');
    }

    const leaveType = currentEntitlement.leaveType as any;
    const carryoverRules = leaveType.carryover;

    if (!carryoverRules?.enabled) {
      return { current: currentEntitlement, minutesCarried: 0 };
    }

    // Calculate unused balance from previous period
    const unusedMinutes = previousEntitlement.minutesAvailable;

    if (unusedMinutes <= 0) {
      return { current: currentEntitlement, minutesCarried: 0 };
    }

    // Apply carryover limit
    const maxCarryoverMinutes = carryoverRules.maxHours
      ? carryoverRules.maxHours * 60
      : carryoverRules.maxDays
      ? carryoverRules.maxDays * leaveType.unit === 'HOURS' ? 8 * 60 : 24 * 60
      : unusedMinutes;

    const minutesCarried = Math.min(unusedMinutes, maxCarryoverMinutes);
    const minutesForfeited = unusedMinutes - minutesCarried;

    // Apply to current period
    currentEntitlement.minutesCarriedOver = minutesCarried;

    // Set expiry date if configured
    if (carryoverRules.expiresOn) {
      const [month, day] = carryoverRules.expiresOn.split('-').map(Number);
      const expiryDate = new Date(currentEntitlement.periodStart);
      expiryDate.setMonth(month - 1);
      expiryDate.setDate(day);
      
      // If expiry date is before period start, add 1 year
      if (expiryDate < currentEntitlement.periodStart) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      currentEntitlement.carryoverExpiryDate = expiryDate;
      currentEntitlement.minutesExpiringSoon = minutesCarried;
    }

    currentEntitlement.recalculateAvailable();
    currentEntitlement.lastAdjustedAt = new Date();
    currentEntitlement.lastAdjustedBy = processedBy;

    const saved = await this.entitlementRepo.save(currentEntitlement);

    // Create log
    const accrualLog = this.accrualLogRepo.create({
      employeeId: currentEntitlement.employeeId,
      organizationId: currentEntitlement.organizationId,
      leaveTypeId: currentEntitlement.leaveTypeId,
      period: currentEntitlement.periodStart,
      minutesAdded: minutesCarried,
      ftePercentage: currentEntitlement.ftePercentage,
      source: 'MANUAL_ADJUSTMENT',
      processedBy,
      notes: `Carryover: ${(minutesCarried / 60).toFixed(2)}h carried, ${(minutesForfeited / 60).toFixed(2)}h forfeited`,
    });

    await this.accrualLogRepo.save(accrualLog);

    this.logger.log(
      `Carried over ${(minutesCarried / 60).toFixed(2)}h (forfeited ${(minutesForfeited / 60).toFixed(2)}h) for employee ${currentEntitlement.employeeId}`,
    );

    return { current: saved, minutesCarried };
  }

  /**
   * Expire old carryover balance
   */
  async expireCarryover(entitlementId: string): Promise<{ expired: number }> {
    const entitlement = await this.entitlementRepo.findOne({
      where: { id: entitlementId },
    });

    if (!entitlement || !entitlement.carryoverExpiryDate) {
      return { expired: 0 };
    }

    const now = new Date();
    if (now < entitlement.carryoverExpiryDate) {
      // Not yet expired
      const daysUntilExpiry = Math.ceil(
        (entitlement.carryoverExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= 30) {
        entitlement.minutesExpiringSoon = entitlement.minutesCarriedOver;
      }

      await this.entitlementRepo.save(entitlement);
      return { expired: 0 };
    }

    // Expire carried over balance
    const minutesExpired = entitlement.minutesCarriedOver;
    entitlement.minutesCarriedOver = 0;
    entitlement.minutesExpiringSoon = 0;
    entitlement.hasCarryoverExpired = true;
    entitlement.recalculateAvailable();

    await this.entitlementRepo.save(entitlement);

    this.logger.warn(
      `Expired ${(minutesExpired / 60).toFixed(2)}h carryover for employee ${entitlement.employeeId}`,
    );

    return { expired: minutesExpired };
  }

  // Helper methods

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private applyRounding(minutes: number, rounding: string): number {
    switch (rounding) {
      case 'UP':
        return Math.ceil(minutes);
      case 'DOWN':
        return Math.floor(minutes);
      case 'NEAREST_0_5H':
        return Math.round(minutes / 30) * 30; // 30 min = 0.5h
      case 'NEAREST_1H':
        return Math.round(minutes / 60) * 60;
      default:
        return Math.round(minutes);
    }
  }
}
