import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveSegment } from '../entities/leave-segment.entity';
import { WorkingPattern } from '../entities/working-pattern.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { PublicHoliday } from '../entities/public-holiday.entity';

interface SegmentInput {
  date: Date;
  partialStartTime?: string;
  partialEndTime?: string;
  partialMinutes?: number;
}

/**
 * DeductionEngineService
 * Calculates leave deductions based on working patterns
 * Handles public holidays, weekends, partial days, shift patterns
 */
@Injectable()
export class DeductionEngineService {
  private readonly logger = new Logger(DeductionEngineService.name);

  constructor(
    @InjectRepository(LeaveSegment)
    private segmentRepo: Repository<LeaveSegment>,
  ) {}

  /**
   * Calculate deductions for a leave request
   * Returns segments with accurate minutes per day
   */
  async calculateDeductions(
    leaveRequestId: string,
    employeeId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date,
    workingPattern: WorkingPattern,
    leaveType: LeaveType,
    publicHolidays: PublicHoliday[],
    partialDays?: SegmentInput[],
  ): Promise<{
    segments: LeaveSegment[];
    totalMinutesDeducted: number;
    workingDaysCount: number;
    calendarDaysCount: number;
    publicHolidaysInRange: number;
  }> {
    const segments: LeaveSegment[] = [];
    const publicHolidayDates = new Set(publicHolidays.map(ph => ph.date.toISOString().split('T')[0]));
    const partialDayMap = new Map(
      partialDays?.map(pd => [pd.date.toISOString().split('T')[0], pd]),
    );

    let totalMinutesDeducted = 0;
    let workingDaysCount = 0;
    let publicHolidaysInRange = 0;

    // Iterate through each date in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = this.getDayOfWeekString(currentDate);

      // Check if working day on pattern
      const patternHours = workingPattern.getHoursForDate(currentDate);
      const isWorkingDay = workingPattern.isWorkingDay(currentDate);

      // Check if public holiday
      const isPublicHoliday = publicHolidayDates.has(dateStr);
      const publicHoliday = isPublicHoliday
        ? publicHolidays.find(ph => ph.date.toISOString().split('T')[0] === dateStr)
        : null;

      // Check if weekend
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      // Determine deduction
      let minutesDeducted = 0;
      let shouldDeduct = false;
      let handlePublicHoliday = 'DEDUCTED';

      if (isWorkingDay) {
        shouldDeduct = true;
        const patternMinutes = patternHours * 60;

        // Check for partial day
        const partialDay = partialDayMap.get(dateStr);
        if (partialDay && leaveType.allowPartialDays) {
          minutesDeducted = partialDay.partialMinutes || this.calculatePartialMinutes(
            partialDay.partialStartTime,
            partialDay.partialEndTime,
          );
        } else {
          minutesDeducted = patternMinutes;
        }

        // Handle public holidays
        if (isPublicHoliday) {
          publicHolidaysInRange++;

          if (leaveType.deductPublicHolidays) {
            // Deduct as normal leave day
            handlePublicHoliday = 'DEDUCTED';
          } else {
            // Don't deduct - give day back
            minutesDeducted = 0;
            shouldDeduct = false;
            handlePublicHoliday = 'IGNORED';
          }

          // Some patterns grant in-lieu for shift workers
          if (workingPattern.publicHolidayHandling === 'GRANT_IN_LIEU' && workingPattern.isShiftPattern) {
            handlePublicHoliday = 'IN_LIEU_GRANTED';
            minutesDeducted = 0;
            shouldDeduct = false;
          }
        }

        // Handle weekends
        if (isWeekend && !leaveType.deductWeekends && !workingPattern.includesWeekends) {
          minutesDeducted = 0;
          shouldDeduct = false;
        }
      }

      // Create segment
      if (shouldDeduct || isPublicHoliday) {
        const segment = this.segmentRepo.create({
          leaveRequestId,
          employeeId,
          organizationId,
          date: new Date(currentDate),
          dayOfWeek,
          minutesDeducted,
          scheduledMinutes: patternHours * 60,
          isWorkingDay,
          isPublicHoliday,
          publicHolidayName: publicHoliday?.name,
          isWeekend,
          isPartialDay: partialDayMap.has(dateStr),
          partialStartTime: partialDayMap.get(dateStr)?.partialStartTime,
          partialEndTime: partialDayMap.get(dateStr)?.partialEndTime,
          status: 'PENDING',
          metadata: {
            publicHolidayHandling: isPublicHoliday ? handlePublicHoliday : undefined,
          },
        });

        segments.push(segment);
        totalMinutesDeducted += minutesDeducted;

        if (isWorkingDay && minutesDeducted > 0) {
          workingDaysCount++;
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate calendar days
    const calendarDaysCount = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

    this.logger.log(
      `Calculated ${segments.length} segments, ${(totalMinutesDeducted / 60).toFixed(2)}h deducted over ${workingDaysCount} working days`,
    );

    return {
      segments,
      totalMinutesDeducted,
      workingDaysCount,
      calendarDaysCount,
      publicHolidaysInRange,
    };
  }

  /**
   * Save segments to database
   */
  async saveSegments(segments: LeaveSegment[]): Promise<LeaveSegment[]> {
    return this.segmentRepo.save(segments);
  }

  /**
   * Update segment status (e.g., when request is approved)
   */
  async updateSegmentStatus(leaveRequestId: string, status: string): Promise<void> {
    await this.segmentRepo.update(
      { leaveRequestId },
      { status },
    );
  }

  /**
   * Delete segments (e.g., when request is cancelled)
   */
  async deleteSegments(leaveRequestId: string): Promise<void> {
    await this.segmentRepo.delete({ leaveRequestId });
  }

  /**
   * Get segments for a leave request
   */
  async getSegments(leaveRequestId: string): Promise<LeaveSegment[]> {
    return this.segmentRepo.find({
      where: { leaveRequestId },
      order: { date: 'ASC' },
    });
  }

  /**
   * Get segments for employee in date range
   */
  async getSegmentsForDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LeaveSegment[]> {
    return this.segmentRepo
      .createQueryBuilder('seg')
      .where('seg.employeeId = :employeeId', { employeeId })
      .andWhere('seg.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('seg.status IN (:...statuses)', { statuses: ['PENDING', 'APPROVED'] })
      .orderBy('seg.date', 'ASC')
      .getMany();
  }

  /**
   * Calculate overlap with existing leave
   */
  async checkOverlap(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string,
  ): Promise<{ hasOverlap: boolean; overlappingDates: Date[] }> {
    const query = this.segmentRepo
      .createQueryBuilder('seg')
      .where('seg.employeeId = :employeeId', { employeeId })
      .andWhere('seg.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('seg.status IN (:...statuses)', { statuses: ['PENDING', 'APPROVED'] })
      .andWhere('seg.minutesDeducted > 0');

    if (excludeRequestId) {
      query.andWhere('seg.leaveRequestId != :excludeRequestId', { excludeRequestId });
    }

    const overlapping = await query.getMany();

    return {
      hasOverlap: overlapping.length > 0,
      overlappingDates: overlapping.map(seg => seg.date),
    };
  }

  /**
   * Get stats for a date range
   */
  async getDeductionStats(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalDays: number;
    workingDays: number;
    publicHolidays: number;
    weekends: number;
    totalMinutes: number;
  }> {
    const segments = await this.getSegmentsForDateRange(employeeId, startDate, endDate);

    const stats = {
      totalDays: segments.length,
      workingDays: segments.filter(s => s.isWorkingDay && s.minutesDeducted > 0).length,
      publicHolidays: segments.filter(s => s.isPublicHoliday).length,
      weekends: segments.filter(s => s.isWeekend).length,
      totalMinutes: segments.reduce((sum, s) => sum + s.minutesDeducted, 0),
    };

    return stats;
  }

  // Helper methods

  private getDayOfWeekString(date: Date): string {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  }

  private calculatePartialMinutes(startTime?: string, endTime?: string): number {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    return endTotalMin - startTotalMin;
  }
}
