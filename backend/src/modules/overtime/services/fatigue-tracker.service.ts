import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Shift, ShiftType } from '../entities/shift.entity';
import { WorkRuleSet } from '../entities/work-rule-set.entity';

export interface FatigueScore {
  score: number; // 0-100 (0 = no fatigue, 100 = extreme fatigue)
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: {
    hoursWorked: number;
    nightShifts: number;
    consecutiveDays: number;
    overtimeHours: number;
    restDeficit: number;
    shiftLength: number;
  };
  recommendations: string[];
  breaches: Array<{
    type: string;
    severity: 'WARNING' | 'ERROR';
    message: string;
  }>;
}

export interface RestBreachResult {
  hasBreach: boolean;
  hoursSinceLastShift: number;
  minimumRequired: number;
  deficit: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * FatigueTracker
 * Monitors employee fatigue levels and rest compliance
 * Provides safety alerts and recommendations
 */
@Injectable()
export class FatigueTrackerService {
  private readonly logger = new Logger(FatigueTrackerService.name);

  // Fatigue scoring weights
  private readonly WEIGHTS = {
    HOURS_WORKED: 0.25,
    NIGHT_SHIFTS: 0.20,
    CONSECUTIVE_DAYS: 0.20,
    OVERTIME: 0.15,
    REST_DEFICIT: 0.15,
    SHIFT_LENGTH: 0.05,
  };

  constructor(
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
  ) {}

  /**
   * Calculate fatigue score for employee
   * Based on rolling 7-day window
   */
  async calculateFatigueScore(
    employeeId: string,
    asOfDate: Date = new Date(),
  ): Promise<FatigueScore> {
    // Get shifts from last 7 days
    const startDate = new Date(asOfDate);
    startDate.setDate(startDate.getDate() - 7);

    const recentShifts = await this.shiftRepository.find({
      where: {
        employeeId,
        actualStart: Between(startDate, asOfDate),
        status: 'COMPLETED',
      },
      order: { actualStart: 'ASC' },
    });

    // Calculate factors
    const factors = this.calculateFatigueFactors(recentShifts);

    // Calculate weighted score
    const score = this.calculateWeightedScore(factors);

    // Determine level
    const level = this.getFatigueLevel(score);

    // Generate recommendations
    const recommendations = this.generateRecommendations(score, factors);

    // Check for breaches
    const breaches = this.checkBreaches(factors, recentShifts);

    return {
      score,
      level,
      factors,
      recommendations,
      breaches,
    };
  }

  /**
   * Calculate fatigue factors from shifts
   */
  private calculateFatigueFactors(shifts: Shift[]): FatigueScore['factors'] {
    let totalHours = 0;
    let nightShifts = 0;
    let overtimeHours = 0;
    let longestShift = 0;
    let restDeficit = 0;

    // Calculate metrics
    for (let i = 0; i < shifts.length; i++) {
      const shift = shifts[i];
      const hours = shift.actualHours || 0;
      
      totalHours += hours;
      
      if (shift.shiftType === ShiftType.NIGHT) {
        nightShifts++;
      }
      
      if (shift.overtimeHours) {
        overtimeHours += shift.overtimeHours;
      }
      
      if (hours > longestShift) {
        longestShift = hours;
      }

      // Check rest between shifts
      if (i > 0) {
        const prevShift = shifts[i - 1];
        const restHours = (shift.actualStart.getTime() - prevShift.actualEnd.getTime()) / (1000 * 60 * 60);
        
        if (restHours < 11) { // EU WTD minimum
          restDeficit += (11 - restHours);
        }
      }
    }

    return {
      hoursWorked: totalHours,
      nightShifts,
      consecutiveDays: this.countConsecutiveDays(shifts),
      overtimeHours,
      restDeficit,
      shiftLength: longestShift,
    };
  }

  /**
   * Calculate weighted fatigue score (0-100)
   */
  private calculateWeightedScore(factors: FatigueScore['factors']): number {
    // Normalize each factor to 0-100 scale
    const hoursScore = Math.min((factors.hoursWorked / 60) * 100, 100); // 60h = max
    const nightScore = Math.min((factors.nightShifts / 5) * 100, 100); // 5 nights = max
    const consecutiveScore = Math.min((factors.consecutiveDays / 10) * 100, 100); // 10 days = max
    const overtimeScore = Math.min((factors.overtimeHours / 20) * 100, 100); // 20h OT = max
    const restScore = Math.min((factors.restDeficit / 10) * 100, 100); // 10h deficit = max
    const lengthScore = Math.min((factors.shiftLength / 16) * 100, 100); // 16h shift = max

    // Calculate weighted average
    const score = 
      hoursScore * this.WEIGHTS.HOURS_WORKED +
      nightScore * this.WEIGHTS.NIGHT_SHIFTS +
      consecutiveScore * this.WEIGHTS.CONSECUTIVE_DAYS +
      overtimeScore * this.WEIGHTS.OVERTIME +
      restScore * this.WEIGHTS.REST_DEFICIT +
      lengthScore * this.WEIGHTS.SHIFT_LENGTH;

    return Math.round(score);
  }

  /**
   * Determine fatigue level from score
   */
  private getFatigueLevel(score: number): FatigueScore['level'] {
    if (score < 30) return 'LOW';
    if (score < 60) return 'MODERATE';
    if (score < 85) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Generate recommendations based on fatigue
   */
  private generateRecommendations(score: number, factors: FatigueScore['factors']): string[] {
    const recommendations: string[] = [];

    if (score >= 85) {
      recommendations.push('CRITICAL: Mandatory rest period required before next shift');
      recommendations.push('Consider reassigning upcoming shifts to other staff');
    } else if (score >= 60) {
      recommendations.push('High fatigue detected - recommend 2+ days off');
      recommendations.push('Avoid night shifts and overtime for next 7 days');
    } else if (score >= 30) {
      recommendations.push('Moderate fatigue - ensure adequate rest between shifts');
    }

    if (factors.nightShifts >= 3) {
      recommendations.push(`${factors.nightShifts} night shifts in 7 days - recommend day shifts`);
    }

    if (factors.consecutiveDays >= 7) {
      recommendations.push(`${factors.consecutiveDays} consecutive days worked - mandatory rest day required`);
    }

    if (factors.restDeficit > 0) {
      recommendations.push(`Rest deficit of ${factors.restDeficit.toFixed(1)}h - prioritize recovery`);
    }

    if (factors.shiftLength > 12) {
      recommendations.push(`Recent ${factors.shiftLength}h shift - avoid long shifts for 48h`);
    }

    return recommendations;
  }

  /**
   * Check for regulatory breaches
   */
  private checkBreaches(factors: FatigueScore['factors'], shifts: Shift[]): FatigueScore['breaches'] {
    const breaches: FatigueScore['breaches'] = [];

    // Consecutive days breach
    if (factors.consecutiveDays > 7) {
      breaches.push({
        type: 'CONSECUTIVE_DAYS',
        severity: 'ERROR',
        message: `${factors.consecutiveDays} consecutive days exceeds 7-day maximum`,
      });
    } else if (factors.consecutiveDays >= 6) {
      breaches.push({
        type: 'CONSECUTIVE_DAYS',
        severity: 'WARNING',
        message: `${factors.consecutiveDays} consecutive days - approaching limit`,
      });
    }

    // Rest deficit breach
    if (factors.restDeficit > 5) {
      breaches.push({
        type: 'REST_DEFICIT',
        severity: 'ERROR',
        message: `Cumulative rest deficit of ${factors.restDeficit.toFixed(1)}h`,
      });
    } else if (factors.restDeficit > 0) {
      breaches.push({
        type: 'REST_DEFICIT',
        severity: 'WARNING',
        message: `Rest deficit of ${factors.restDeficit.toFixed(1)}h detected`,
      });
    }

    // Weekly hours breach
    if (factors.hoursWorked > 60) {
      breaches.push({
        type: 'WEEKLY_HOURS',
        severity: 'ERROR',
        message: `${factors.hoursWorked}h in 7 days exceeds safe limit`,
      });
    } else if (factors.hoursWorked > 48) {
      breaches.push({
        type: 'WEEKLY_HOURS',
        severity: 'WARNING',
        message: `${factors.hoursWorked}h in 7 days approaches EU WTD limit`,
      });
    }

    // Shift length breach
    if (factors.shiftLength > 13) {
      breaches.push({
        type: 'SHIFT_LENGTH',
        severity: 'ERROR',
        message: `${factors.shiftLength}h shift exceeds safe maximum`,
      });
    }

    return breaches;
  }

  /**
   * Count consecutive days worked
   */
  private countConsecutiveDays(shifts: Shift[]): number {
    if (shifts.length === 0) return 0;

    let consecutive = 1;
    let maxConsecutive = 1;

    for (let i = 1; i < shifts.length; i++) {
      const prevDate = new Date(shifts[i - 1].actualStart);
      const currDate = new Date(shifts[i].actualStart);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else if (dayDiff > 1) {
        consecutive = 1;
      }
    }

    return maxConsecutive;
  }

  /**
   * Check rest period compliance
   */
  async checkRestCompliance(
    employeeId: string,
    proposedShiftStart: Date,
    policy: WorkRuleSet,
  ): Promise<RestBreachResult> {
    // Get most recent completed shift
    const lastShift = await this.shiftRepository.findOne({
      where: {
        employeeId,
        status: 'COMPLETED',
      },
      order: { actualEnd: 'DESC' },
    });

    if (!lastShift || !lastShift.actualEnd) {
      return {
        hasBreach: false,
        hoursSinceLastShift: 999,
        minimumRequired: policy.minimumRestHours || 11,
        deficit: 0,
        severity: 'LOW',
      };
    }

    const hoursSinceLastShift = 
      (proposedShiftStart.getTime() - lastShift.actualEnd.getTime()) / (1000 * 60 * 60);

    const minimumRequired = policy.minimumRestHours || 11;
    const hasBreach = hoursSinceLastShift < minimumRequired;
    const deficit = hasBreach ? minimumRequired - hoursSinceLastShift : 0;

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (deficit > 4) severity = 'HIGH';
    else if (deficit > 2) severity = 'MEDIUM';

    return {
      hasBreach,
      hoursSinceLastShift,
      minimumRequired,
      deficit,
      severity,
    };
  }

  /**
   * Get fatigue trend (improving or worsening)
   */
  async getFatigueTrend(employeeId: string): Promise<{
    current: number;
    previous: number;
    trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
    changePercent: number;
  }> {
    const current = await this.calculateFatigueScore(employeeId);
    
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 7);
    const previous = await this.calculateFatigueScore(employeeId, previousDate);

    const changePercent = ((current.score - previous.score) / previous.score) * 100;

    let trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
    if (changePercent < -10) trend = 'IMPROVING';
    else if (changePercent > 10) trend = 'WORSENING';
    else trend = 'STABLE';

    return {
      current: current.score,
      previous: previous.score,
      trend,
      changePercent,
    };
  }

  /**
   * Check if employee is fit for shift
   */
  async isFitForShift(
    employeeId: string,
    shiftStart: Date,
    shiftDuration: number,
    policy: WorkRuleSet,
  ): Promise<{
    fit: boolean;
    score: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    
    // Check fatigue
    const fatigue = await this.calculateFatigueScore(employeeId);
    if (fatigue.score >= 85) {
      reasons.push(`Critical fatigue level (${fatigue.score}/100)`);
    }

    // Check rest compliance
    const restCheck = await this.checkRestCompliance(employeeId, shiftStart, policy);
    if (restCheck.hasBreach) {
      reasons.push(`Insufficient rest: ${restCheck.hoursSinceLastShift.toFixed(1)}h (${restCheck.minimumRequired}h required)`);
    }

    // Check shift duration
    if (shiftDuration > 12) {
      const recent = await this.shiftRepository.findOne({
        where: { employeeId, status: 'COMPLETED' },
        order: { actualEnd: 'DESC' },
      });
      
      if (recent && recent.actualHours > 10) {
        reasons.push(`Previous shift was ${recent.actualHours}h, avoid long shifts`);
      }
    }

    const fit = reasons.length === 0 && fatigue.score < 70;

    return {
      fit,
      score: fatigue.score,
      reasons,
    };
  }
}
