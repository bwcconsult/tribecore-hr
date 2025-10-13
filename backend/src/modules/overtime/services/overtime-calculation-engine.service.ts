import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift, ShiftType } from '../entities/shift.entity';
import { TimeBlock, WorkType } from '../entities/time-block.entity';
import { OvertimeLine, RateClass, OvertimeBasis } from '../entities/overtime-line.entity';
import { WorkRuleSet, StackingStrategy, RoundingMethod } from '../entities/work-rule-set.entity';

interface CalculationContext {
  shift: Shift;
  timeBlocks: TimeBlock[];
  ruleSet: WorkRuleSet;
  employeeBaseRate: number;
  weeklyHoursWorked: number; // Total hours in week before this shift
  consecutiveDaysWorked: number;
  periodStart: Date;
  periodEnd: Date;
}

interface PremiumResult {
  rateClass: RateClass;
  basis: OvertimeBasis;
  hours: number;
  multiplier: number;
  amount: number;
  earningCode: string;
  explainTrace: any;
}

/**
 * OvertimeCalculationEngine
 * Core engine for calculating overtime premiums
 * Handles multi-country rules, stacking, rounding, and explainability
 */
@Injectable()
export class OvertimeCalculationEngineService {
  private readonly logger = new Logger(OvertimeCalculationEngineService.name);

  constructor(
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
    @InjectRepository(TimeBlock)
    private timeBlockRepository: Repository<TimeBlock>,
    @InjectRepository(OvertimeLine)
    private overtimeLineRepository: Repository<OvertimeLine>,
    @InjectRepository(WorkRuleSet)
    private workRuleSetRepository: Repository<WorkRuleSet>,
  ) {}

  /**
   * Calculate overtime for a shift
   * Returns array of OvertimeLines (one per premium type)
   */
  async calculateShiftOvertime(
    shiftId: string,
    context: Partial<CalculationContext>,
  ): Promise<OvertimeLine[]> {
    this.logger.log(`Calculating overtime for shift ${shiftId}`);

    // Load shift and time blocks
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['timeBlocks'],
    });

    if (!shift) {
      throw new Error(`Shift ${shiftId} not found`);
    }

    const timeBlocks = shift.timeBlocks || [];
    
    // Build full context
    const fullContext: CalculationContext = {
      shift,
      timeBlocks,
      ruleSet: context.ruleSet,
      employeeBaseRate: context.employeeBaseRate || 25, // Default for testing
      weeklyHoursWorked: context.weeklyHoursWorked || 0,
      consecutiveDaysWorked: context.consecutiveDaysWorked || 0,
      periodStart: context.periodStart || this.getWeekStart(shift.actualStart),
      periodEnd: context.periodEnd || this.getWeekEnd(shift.actualStart),
    };

    // Calculate worked hours (with rounding)
    const workedHours = this.calculateWorkedHours(fullContext);

    // Run calculation pipeline
    const premiums = await this.calculatePremiums(workedHours, fullContext);

    // Apply stacking strategy
    const stackedPremiums = this.applyStackingStrategy(premiums, fullContext.ruleSet);

    // Create OvertimeLine entities
    const overtimeLines: OvertimeLine[] = [];
    for (const premium of stackedPremiums) {
      const line = this.overtimeLineRepository.create({
        shiftId: shift.id,
        employeeId: shift.employeeId,
        organizationId: shift.organizationId,
        workRuleSetId: fullContext.ruleSet.id,
        policyCode: `${fullContext.ruleSet.country}-${premium.rateClass}`,
        rateClass: premium.rateClass,
        basis: premium.basis,
        periodStart: fullContext.periodStart,
        periodEnd: fullContext.periodEnd,
        quantityHours: premium.hours,
        multiplier: premium.multiplier,
        baseHourlyRate: fullContext.employeeBaseRate,
        effectiveRate: fullContext.employeeBaseRate * premium.multiplier,
        calculatedAmount: premium.amount,
        currency: 'USD', // From employee record
        earningCode: premium.earningCode,
        explainTrace: premium.explainTrace,
        status: 'PENDING',
      });

      overtimeLines.push(line);
    }

    this.logger.log(`Generated ${overtimeLines.length} overtime lines for shift ${shiftId}`);
    return overtimeLines;
  }

  /**
   * Calculate worked hours with rounding and breaks
   */
  private calculateWorkedHours(context: CalculationContext): number {
    const { shift, ruleSet } = context;

    if (!shift.actualStart || !shift.actualEnd) {
      return 0;
    }

    // Calculate raw hours
    const totalMs = shift.actualEnd.getTime() - shift.actualStart.getTime();
    let totalHours = totalMs / (1000 * 60 * 60);

    // Subtract unpaid breaks
    if (shift.unpaidBreakHours) {
      totalHours -= shift.unpaidBreakHours;
    }

    // Apply rounding
    totalHours = this.applyRounding(totalHours, ruleSet.roundingMethod, ruleSet.graceMinutes);

    return totalHours;
  }

  /**
   * Calculate all applicable premiums
   * Returns array of premium results before stacking
   */
  private async calculatePremiums(
    workedHours: number,
    context: CalculationContext,
  ): Promise<PremiumResult[]> {
    const premiums: PremiumResult[] = [];
    const { shift, ruleSet, employeeBaseRate, weeklyHoursWorked, consecutiveDaysWorked } = context;

    // 1. DAILY OVERTIME (if configured)
    if (ruleSet.dailyHoursThreshold && workedHours > ruleSet.dailyHoursThreshold) {
      const dailyOTResults = this.calculateDailyOT(workedHours, ruleSet, employeeBaseRate);
      premiums.push(...dailyOTResults);
    }

    // 2. WEEKLY OVERTIME
    const totalWeeklyHours = weeklyHoursWorked + workedHours;
    if (totalWeeklyHours > ruleSet.weeklyHoursThreshold) {
      const weeklyOTResults = this.calculateWeeklyOT(
        workedHours,
        weeklyHoursWorked,
        ruleSet,
        employeeBaseRate,
      );
      premiums.push(...weeklyOTResults);
    }

    // 3. NIGHT DIFFERENTIAL
    if (ruleSet.premiumLadders.night && this.isNightShift(shift)) {
      const nightPremium = this.calculateNightPremium(workedHours, ruleSet, employeeBaseRate);
      if (nightPremium) premiums.push(nightPremium);
    }

    // 4. WEEKEND PREMIUM
    if (ruleSet.premiumLadders.weekend && this.isWeekend(shift.actualStart)) {
      const weekendPremium = this.calculateWeekendPremium(workedHours, ruleSet, employeeBaseRate);
      if (weekendPremium) premiums.push(weekendPremium);
    }

    // 5. HOLIDAY PREMIUM
    if (ruleSet.premiumLadders.holiday && this.isHoliday(shift.actualStart, ruleSet)) {
      const holidayPremium = this.calculateHolidayPremium(workedHours, ruleSet, employeeBaseRate);
      if (holidayPremium) premiums.push(holidayPremium);
    }

    // 6. CONSECUTIVE DAY PREMIUM
    if (consecutiveDaysWorked >= 7 && ruleSet.premiumLadders.consecutiveDay7) {
      const consecutivePremium = this.calculateConsecutiveDayPremium(
        workedHours,
        consecutiveDaysWorked,
        ruleSet,
        employeeBaseRate,
      );
      if (consecutivePremium) premiums.push(consecutivePremium);
    }

    // 7. SPLIT SHIFT PENALTY (if breaks indicate split shift)
    if (ruleSet.premiumLadders.splitShift && this.hasSplitShift(shift, ruleSet)) {
      const splitPremium = this.calculateSplitShiftPenalty(ruleSet, employeeBaseRate);
      if (splitPremium) premiums.push(splitPremium);
    }

    // 8. MEAL/REST PENALTIES
    const penalties = this.calculateBreakPenalties(shift, ruleSet, employeeBaseRate);
    premiums.push(...penalties);

    return premiums;
  }

  /**
   * Calculate daily overtime (e.g., CA >8h @ 1.5x, >12h @ 2.0x)
   */
  private calculateDailyOT(
    workedHours: number,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult[] {
    const results: PremiumResult[] = [];
    const ladder = ruleSet.premiumLadders;

    // Tier 1 (e.g., hours 8-12 @ 1.5x)
    if (ladder.dailyOT1 && workedHours > ladder.dailyOT1.afterHours) {
      const tier1Hours = ladder.dailyOT2
        ? Math.min(workedHours - ladder.dailyOT1.afterHours, ladder.dailyOT2.afterHours - ladder.dailyOT1.afterHours)
        : workedHours - ladder.dailyOT1.afterHours;

      results.push({
        rateClass: RateClass.OT150,
        basis: OvertimeBasis.DAILY,
        hours: tier1Hours,
        multiplier: ladder.dailyOT1.multiplier,
        amount: tier1Hours * baseRate * ladder.dailyOT1.multiplier,
        earningCode: ladder.dailyOT1.earningCode,
        explainTrace: {
          ruleName: `Daily Overtime Tier 1 (${ruleSet.country})`,
          ruleDescription: `Hours worked beyond ${ladder.dailyOT1.afterHours}h in a day`,
          legislationRef: ruleSet.country === 'US' ? 'California Labor Code Section 510' : undefined,
          steps: [
            {
              step: 1,
              description: `Total hours worked: ${workedHours}h`,
              inputs: { workedHours },
            },
            {
              step: 2,
              description: `Daily threshold: ${ladder.dailyOT1.afterHours}h`,
              inputs: { threshold: ladder.dailyOT1.afterHours },
            },
            {
              step: 3,
              description: `Overtime hours: ${tier1Hours}h`,
              formula: `${workedHours}h - ${ladder.dailyOT1.afterHours}h = ${tier1Hours}h`,
              output: tier1Hours,
            },
            {
              step: 4,
              description: `Calculate premium pay`,
              formula: `${tier1Hours}h × $${baseRate}/h × ${ladder.dailyOT1.multiplier}`,
              output: tier1Hours * baseRate * ladder.dailyOT1.multiplier,
            },
          ],
          calculation: {
            hoursWorked: workedHours,
            thresholdHours: ladder.dailyOT1.afterHours,
            overtimeHours: tier1Hours,
            baseRate,
            multiplier: ladder.dailyOT1.multiplier,
            finalAmount: tier1Hours * baseRate * ladder.dailyOT1.multiplier,
          },
        },
      });
    }

    // Tier 2 (e.g., hours >12 @ 2.0x)
    if (ladder.dailyOT2 && workedHours > ladder.dailyOT2.afterHours) {
      const tier2Hours = workedHours - ladder.dailyOT2.afterHours;

      results.push({
        rateClass: RateClass.OT200,
        basis: OvertimeBasis.DAILY,
        hours: tier2Hours,
        multiplier: ladder.dailyOT2.multiplier,
        amount: tier2Hours * baseRate * ladder.dailyOT2.multiplier,
        earningCode: ladder.dailyOT2.earningCode,
        explainTrace: {
          ruleName: `Daily Overtime Tier 2 (${ruleSet.country})`,
          ruleDescription: `Hours worked beyond ${ladder.dailyOT2.afterHours}h in a day`,
          legislationRef: ruleSet.country === 'US' ? 'California Labor Code Section 510' : undefined,
          steps: [
            {
              step: 1,
              description: `Overtime hours: ${workedHours}h - ${ladder.dailyOT2.afterHours}h = ${tier2Hours}h`,
              formula: `${workedHours} - ${ladder.dailyOT2.afterHours} = ${tier2Hours}`,
            },
            {
              step: 2,
              description: `Calculate premium at ${ladder.dailyOT2.multiplier}×`,
              formula: `${tier2Hours}h × $${baseRate}/h × ${ladder.dailyOT2.multiplier}`,
              output: tier2Hours * baseRate * ladder.dailyOT2.multiplier,
            },
          ],
          calculation: {
            hoursWorked: workedHours,
            thresholdHours: ladder.dailyOT2.afterHours,
            overtimeHours: tier2Hours,
            baseRate,
            multiplier: ladder.dailyOT2.multiplier,
            finalAmount: tier2Hours * baseRate * ladder.dailyOT2.multiplier,
          },
        },
      });
    }

    return results;
  }

  /**
   * Calculate weekly overtime (FLSA standard >40h)
   */
  private calculateWeeklyOT(
    currentShiftHours: number,
    previousWeeklyHours: number,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult[] {
    const results: PremiumResult[] = [];
    const totalWeeklyHours = previousWeeklyHours + currentShiftHours;
    const threshold = ruleSet.weeklyHoursThreshold;

    if (totalWeeklyHours <= threshold) {
      return results; // No weekly OT
    }

    // Calculate how much of this shift is OT
    const weeklyOTHours = Math.min(
      currentShiftHours,
      totalWeeklyHours - threshold,
    );

    const ladder = ruleSet.premiumLadders;
    if (!ladder.weeklyOT1) return results;

    results.push({
      rateClass: RateClass.OT150,
      basis: OvertimeBasis.WEEKLY,
      hours: weeklyOTHours,
      multiplier: ladder.weeklyOT1.multiplier,
      amount: weeklyOTHours * baseRate * ladder.weeklyOT1.multiplier,
      earningCode: ladder.weeklyOT1.earningCode,
      explainTrace: {
        ruleName: `Weekly Overtime (${ruleSet.country})`,
        ruleDescription: `Hours worked beyond ${threshold}h in a week`,
        legislationRef: ruleSet.country === 'US' ? 'FLSA 29 USC 207(a)(1)' : 'EU Working Time Directive',
        steps: [
          {
            step: 1,
            description: `Hours worked before this shift: ${previousWeeklyHours}h`,
          },
          {
            step: 2,
            description: `Current shift hours: ${currentShiftHours}h`,
          },
          {
            step: 3,
            description: `Total weekly hours: ${totalWeeklyHours}h`,
            formula: `${previousWeeklyHours}h + ${currentShiftHours}h = ${totalWeeklyHours}h`,
          },
          {
            step: 4,
            description: `Weekly threshold: ${threshold}h`,
          },
          {
            step: 5,
            description: `Overtime hours from this shift: ${weeklyOTHours}h`,
            formula: `min(${currentShiftHours}h, ${totalWeeklyHours}h - ${threshold}h)`,
          },
          {
            step: 6,
            description: `Calculate premium pay`,
            formula: `${weeklyOTHours}h × $${baseRate}/h × ${ladder.weeklyOT1.multiplier}`,
            output: weeklyOTHours * baseRate * ladder.weeklyOT1.multiplier,
          },
        ],
        calculation: {
          hoursWorked: totalWeeklyHours,
          thresholdHours: threshold,
          overtimeHours: weeklyOTHours,
          baseRate,
          multiplier: ladder.weeklyOT1.multiplier,
          finalAmount: weeklyOTHours * baseRate * ladder.weeklyOT1.multiplier,
        },
      },
    });

    return results;
  }

  /**
   * Calculate night shift differential
   */
  private calculateNightPremium(
    hours: number,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult | null {
    const night = ruleSet.premiumLadders.night;
    if (!night) return null;

    return {
      rateClass: RateClass.NIGHT,
      basis: OvertimeBasis.TIME_OF_DAY,
      hours,
      multiplier: night.multiplier,
      amount: hours * baseRate * night.multiplier,
      earningCode: night.earningCode,
      explainTrace: {
        ruleName: 'Night Shift Differential',
        ruleDescription: `Premium for working ${night.startTime} to ${night.endTime}`,
        steps: [
          {
            step: 1,
            description: `Night shift hours: ${hours}h`,
          },
          {
            step: 2,
            description: `Apply night differential of ${night.multiplier}×`,
            formula: `${hours}h × $${baseRate}/h × ${night.multiplier}`,
            output: hours * baseRate * night.multiplier,
          },
        ],
        calculation: {
          hoursWorked: hours,
          baseRate,
          multiplier: night.multiplier,
          finalAmount: hours * baseRate * night.multiplier,
        },
      },
    };
  }

  /**
   * Calculate weekend premium
   */
  private calculateWeekendPremium(
    hours: number,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult | null {
    const weekend = ruleSet.premiumLadders.weekend;
    if (!weekend) return null;

    return {
      rateClass: RateClass.WEEKEND,
      basis: OvertimeBasis.DAY_OF_WEEK,
      hours,
      multiplier: weekend.multiplier,
      amount: hours * baseRate * weekend.multiplier,
      earningCode: weekend.earningCode,
      explainTrace: {
        ruleName: 'Weekend Premium',
        ruleDescription: 'Premium for working on Saturday or Sunday',
        calculation: {
          hoursWorked: hours,
          baseRate,
          multiplier: weekend.multiplier,
          finalAmount: hours * baseRate * weekend.multiplier,
        },
      },
    };
  }

  /**
   * Calculate holiday premium
   */
  private calculateHolidayPremium(
    hours: number,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult | null {
    const holiday = ruleSet.premiumLadders.holiday;
    if (!holiday) return null;

    return {
      rateClass: RateClass.HOLIDAY,
      basis: OvertimeBasis.HOLIDAY,
      hours,
      multiplier: holiday.multiplier,
      amount: hours * baseRate * holiday.multiplier,
      earningCode: holiday.earningCode,
      explainTrace: {
        ruleName: 'Holiday Premium',
        ruleDescription: 'Premium for working on public holiday',
        calculation: {
          hoursWorked: hours,
          baseRate,
          multiplier: holiday.multiplier,
          finalAmount: hours * baseRate * holiday.multiplier,
        },
      },
    };
  }

  /**
   * Calculate consecutive day premium (7th day double-time)
   */
  private calculateConsecutiveDayPremium(
    hours: number,
    consecutiveDays: number,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult | null {
    const consecutive = ruleSet.premiumLadders.consecutiveDay7;
    if (!consecutive) return null;

    return {
      rateClass: RateClass.OT200,
      basis: OvertimeBasis.CONSECUTIVE,
      hours,
      multiplier: consecutive.multiplier,
      amount: hours * baseRate * consecutive.multiplier,
      earningCode: consecutive.earningCode,
      explainTrace: {
        ruleName: 'Consecutive Day Premium',
        ruleDescription: `Premium for working ${consecutiveDays} consecutive days`,
        legislationRef: 'California Labor Code Section 510',
        calculation: {
          hoursWorked: hours,
          consecutiveDays,
          baseRate,
          multiplier: consecutive.multiplier,
          finalAmount: hours * baseRate * consecutive.multiplier,
        },
      },
    };
  }

  /**
   * Calculate split shift penalty
   */
  private calculateSplitShiftPenalty(
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult | null {
    const splitShift = ruleSet.premiumLadders.splitShift;
    if (!splitShift) return null;

    return {
      rateClass: RateClass.SPLIT_PENALTY,
      basis: OvertimeBasis.PENALTY,
      hours: 1, // Usually flat payment
      multiplier: 1,
      amount: splitShift.premium,
      earningCode: splitShift.earningCode,
      explainTrace: {
        ruleName: 'Split Shift Penalty',
        ruleDescription: 'Penalty for split shift exceeding minimum gap',
        legislationRef: 'California IWC Order',
        calculation: {
          baseRate,
          penaltyAmount: splitShift.premium,
          finalAmount: splitShift.premium,
        },
      },
    };
  }

  /**
   * Calculate break penalties (meal/rest)
   */
  private calculateBreakPenalties(
    shift: Shift,
    ruleSet: WorkRuleSet,
    baseRate: number,
  ): PremiumResult[] {
    const penalties: PremiumResult[] = [];

    // Meal penalty (if worked >5h without meal break)
    if (ruleSet.premiumLadders.mealPenalty) {
      const workedHours = this.calculateWorkedHours({ shift, ruleSet } as any);
      const hasMealBreak = shift.breaks?.some(b => b.type === 'MEAL') || false;
      
      if (workedHours > ruleSet.premiumLadders.mealPenalty.afterHours && !hasMealBreak) {
        penalties.push({
          rateClass: RateClass.MEAL_PENALTY,
          basis: OvertimeBasis.PENALTY,
          hours: 1,
          multiplier: 1,
          amount: ruleSet.premiumLadders.mealPenalty.penalty,
          earningCode: ruleSet.premiumLadders.mealPenalty.earningCode,
          explainTrace: {
            ruleName: 'Meal Break Penalty',
            ruleDescription: `Required meal break not provided after ${ruleSet.premiumLadders.mealPenalty.afterHours}h`,
            legislationRef: 'California Labor Code Section 512',
            calculation: {
              penaltyAmount: ruleSet.premiumLadders.mealPenalty.penalty,
              finalAmount: ruleSet.premiumLadders.mealPenalty.penalty,
            },
          },
        });
      }
    }

    return penalties;
  }

  /**
   * Apply stacking strategy
   * Determines how multiple premiums combine
   */
  private applyStackingStrategy(
    premiums: PremiumResult[],
    ruleSet: WorkRuleSet,
  ): PremiumResult[] {
    if (premiums.length <= 1) return premiums;

    const strategy = ruleSet.stackingStrategy;

    switch (strategy) {
      case StackingStrategy.HIGHEST:
        // Keep only highest premium
        return [premiums.reduce((highest, current) =>
          current.multiplier > highest.multiplier ? current : highest
        )];

      case StackingStrategy.ADD_ON:
        // Stack all premiums
        return premiums;

      case StackingStrategy.REPLACE:
        // Replace base with highest premium
        const highest = premiums.reduce((max, current) =>
          current.multiplier > max.multiplier ? current : max
        );
        return [highest];

      default:
        return premiums;
    }
  }

  /**
   * Apply rounding to hours
   */
  private applyRounding(hours: number, method: RoundingMethod, graceMinutes: number): number {
    const totalMinutes = hours * 60;
    
    // Apply grace period
    const adjustedMinutes = totalMinutes - graceMinutes;
    if (adjustedMinutes <= 0) return 0;

    switch (method) {
      case RoundingMethod.NEAREST_6MIN:
        return Math.round(adjustedMinutes / 6) * 6 / 60;
      
      case RoundingMethod.NEAREST_15MIN:
        return Math.round(adjustedMinutes / 15) * 15 / 60;
      
      case RoundingMethod.NEAREST_30MIN:
        return Math.round(adjustedMinutes / 30) * 30 / 60;
      
      case RoundingMethod.UP_15MIN:
        return Math.ceil(adjustedMinutes / 15) * 15 / 60;
      
      case RoundingMethod.DOWN_6MIN:
        return Math.floor(adjustedMinutes / 6) * 6 / 60;
      
      case RoundingMethod.NONE:
      default:
        return hours;
    }
  }

  // === HELPER METHODS ===

  private isNightShift(shift: Shift): boolean {
    const hour = shift.actualStart.getHours();
    return hour >= 22 || hour < 6; // 10 PM to 6 AM
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  private isHoliday(date: Date, ruleSet: WorkRuleSet): boolean {
    if (!ruleSet.holidayCalendar) return false;
    const dateStr = date.toISOString().split('T')[0];
    return ruleSet.holidayCalendar.some(h => h.date === dateStr);
  }

  private hasSplitShift(shift: Shift, ruleSet: WorkRuleSet): boolean {
    if (!shift.breaks || !ruleSet.premiumLadders.splitShift) return false;
    
    const minGap = ruleSet.premiumLadders.splitShift.minimumGapHours;
    return shift.breaks.some(b => (b.durationMinutes / 60) >= minGap);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  }
}
