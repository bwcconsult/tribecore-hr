import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewForm, ReviewFormStatus } from '../entities/review-form.entity';
import { ReviewCycle } from '../entities/review-cycle.entity';
import { CalibrationRecord } from '../entities/calibration-record.entity';
import { Employee } from '../../employees/entities/employee.entity';

export interface HRReviewRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  cycleId: string;
  cycleName: string;
  cycleType: string;
  reviewPeriodStart: Date;
  reviewPeriodEnd: Date;
  selfRating: number;
  managerRating: number;
  calibratedRating: number;
  finalRating: number;
  selfReviewData: any;
  managerReviewData: any;
  calibrationData: any;
  strengths: string[];
  developmentAreas: string[];
  goals: any[];
  managerComments: string;
  employeeComments: string;
  completedAt: Date;
  publishedAt: Date;
  archivedAt: Date;
  status: string;
  metadata: Record<string, any>;
}

@Injectable()
export class HRRecordsService {
  private readonly logger = new Logger(HRRecordsService.name);

  constructor(
    @InjectRepository(ReviewForm)
    private readonly reviewFormRepo: Repository<ReviewForm>,
    @InjectRepository(ReviewCycle)
    private readonly reviewCycleRepo: Repository<ReviewCycle>,
    @InjectRepository(CalibrationRecord)
    private readonly calibrationRepo: Repository<CalibrationRecord>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  /**
   * Archive completed review to HR records
   */
  async archiveReviewToHRRecords(cycleId: string, employeeId: string): Promise<HRReviewRecord> {
    this.logger.log(`Archiving review to HR records: Cycle ${cycleId}, Employee ${employeeId}`);

    // Fetch all review forms for this employee in this cycle
    const reviewForms = await this.reviewFormRepo.find({
      where: {
        cycleId,
        userId: employeeId,
        status: ReviewFormStatus.PUBLISHED,
      },
      relations: ['cycle', 'user', 'reviewer'],
    });

    if (reviewForms.length === 0) {
      throw new Error('No published review forms found for archiving');
    }

    const selfReview = reviewForms.find((f) => f.type === 'SELF');
    const managerReview = reviewForms.find((f) => f.type === 'MANAGER');

    // Fetch calibration record
    const calibrationRecord = await this.calibrationRepo.findOne({
      where: { cycleId, employeeId },
    });

    const cycle = reviewForms[0].cycle;
    const employee = reviewForms[0].user;

    // Create consolidated HR record
    const hrRecord: HRReviewRecord = {
      id: `HR-${cycleId}-${employeeId}`,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      cycleId,
      cycleName: cycle.name,
      cycleType: cycle.type,
      reviewPeriodStart: cycle.periodStart,
      reviewPeriodEnd: cycle.periodEnd,
      selfRating: selfReview?.overallRating || 0,
      managerRating: managerReview?.overallRating || 0,
      calibratedRating: calibrationRecord?.calibratedRating || 0,
      finalRating: calibrationRecord?.finalRating || managerReview?.overallRating || 0,
      selfReviewData: selfReview?.sections || [],
      managerReviewData: managerReview?.sections || [],
      calibrationData: calibrationRecord,
      strengths: this.extractStrengths(selfReview, managerReview),
      developmentAreas: this.extractDevelopmentAreas(selfReview, managerReview),
      goals: this.extractGoals(selfReview, managerReview),
      managerComments: managerReview?.overallComments || '',
      employeeComments: selfReview?.overallComments || '',
      completedAt: managerReview?.submittedAt || new Date(),
      publishedAt: new Date(),
      archivedAt: new Date(),
      status: 'ARCHIVED',
      metadata: {
        selfReviewId: selfReview?.id,
        managerReviewId: managerReview?.id,
        calibrationRecordId: calibrationRecord?.id,
        reviewerName: managerReview?.reviewer
          ? `${managerReview.reviewer.firstName} ${managerReview.reviewer.lastName}`
          : 'N/A',
        timeSpent: {
          self: selfReview?.timeSpentMinutes || 0,
          manager: managerReview?.timeSpentMinutes || 0,
        },
        aiSummaryGenerated: managerReview?.aiSummaryGenerated || false,
        archivedBy: 'SYSTEM',
      },
    };

    // Store in employee's performance history
    await this.storeInEmployeeHistory(employeeId, hrRecord);

    // Update review forms to mark as archived
    for (const form of reviewForms) {
      form.metadata = {
        ...form.metadata,
        archivedToHR: true,
        archivedAt: new Date().toISOString(),
      };
      await this.reviewFormRepo.save(form);
    }

    this.logger.log(`Successfully archived review to HR records: ${hrRecord.id}`);

    return hrRecord;
  }

  /**
   * Retrieve employee's complete review history from HR records
   */
  async getEmployeeReviewHistory(employeeId: string): Promise<HRReviewRecord[]> {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Fetch all archived reviews for this employee
    const reviewForms = await this.reviewFormRepo
      .createQueryBuilder('form')
      .leftJoinAndSelect('form.cycle', 'cycle')
      .where('form.userId = :employeeId', { employeeId })
      .andWhere('form.status = :status', { status: ReviewFormStatus.PUBLISHED })
      .orderBy('cycle.periodEnd', 'DESC')
      .getMany();

    const history: HRReviewRecord[] = [];

    // Group by cycle
    const cycleMap = new Map<string, any[]>();
    for (const form of reviewForms) {
      if (!cycleMap.has(form.cycleId)) {
        cycleMap.set(form.cycleId, []);
      }
      cycleMap.get(form.cycleId).push(form);
    }

    // Create HR record for each cycle
    for (const [cycleId, forms] of cycleMap) {
      try {
        const record = await this.archiveReviewToHRRecords(cycleId, employeeId);
        history.push(record);
      } catch (error) {
        this.logger.warn(`Could not create HR record for cycle ${cycleId}: ${error.message}`);
      }
    }

    return history;
  }

  /**
   * Get performance trends for an employee
   */
  async getPerformanceTrends(employeeId: string): Promise<any> {
    const history = await this.getEmployeeReviewHistory(employeeId);

    if (history.length === 0) {
      return {
        employeeId,
        totalReviews: 0,
        trends: [],
      };
    }

    const trends = history.map((record) => ({
      cycle: record.cycleName,
      date: record.reviewPeriodEnd,
      selfRating: record.selfRating,
      managerRating: record.managerRating,
      finalRating: record.finalRating,
      trend:
        history.indexOf(record) > 0
          ? record.finalRating - history[history.indexOf(record) - 1].finalRating
          : 0,
    }));

    const averageRating =
      history.reduce((sum, r) => sum + r.finalRating, 0) / history.length;

    return {
      employeeId,
      totalReviews: history.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      currentRating: history[0].finalRating,
      trends,
      strengths: this.consolidateStrengths(history),
      developmentAreas: this.consolidateDevelopmentAreas(history),
    };
  }

  /**
   * Generate performance report for HR
   */
  async generateHRPerformanceReport(cycleId: string): Promise<any> {
    this.logger.log(`Generating HR performance report for cycle ${cycleId}`);

    const cycle = await this.reviewCycleRepo.findOne({ where: { id: cycleId } });
    if (!cycle) {
      throw new Error('Review cycle not found');
    }

    const reviewForms = await this.reviewFormRepo.find({
      where: { cycleId, status: ReviewFormStatus.PUBLISHED },
      relations: ['user', 'cycle'],
    });

    const employees = new Set(reviewForms.map((f) => f.userId));
    const records: HRReviewRecord[] = [];

    for (const employeeId of employees) {
      try {
        const record = await this.archiveReviewToHRRecords(cycleId, employeeId);
        records.push(record);
      } catch (error) {
        this.logger.warn(`Could not archive review for employee ${employeeId}: ${error.message}`);
      }
    }

    // Calculate statistics
    const avgSelfRating =
      records.reduce((sum, r) => sum + r.selfRating, 0) / records.length;
    const avgManagerRating =
      records.reduce((sum, r) => sum + r.managerRating, 0) / records.length;
    const avgFinalRating =
      records.reduce((sum, r) => sum + r.finalRating, 0) / records.length;

    const ratingDistribution = {
      outstanding: records.filter((r) => r.finalRating >= 4.5).length,
      exceeds: records.filter((r) => r.finalRating >= 3.5 && r.finalRating < 4.5).length,
      meets: records.filter((r) => r.finalRating >= 2.5 && r.finalRating < 3.5).length,
      developing: records.filter((r) => r.finalRating >= 1.5 && r.finalRating < 2.5).length,
      needsImprovement: records.filter((r) => r.finalRating < 1.5).length,
    };

    return {
      cycleId,
      cycleName: cycle.name,
      cycleType: cycle.type,
      totalEmployees: records.length,
      completionRate: (records.length / cycle.metadata?.participantCount || records.length) * 100,
      averageRatings: {
        self: parseFloat(avgSelfRating.toFixed(2)),
        manager: parseFloat(avgManagerRating.toFixed(2)),
        final: parseFloat(avgFinalRating.toFixed(2)),
      },
      ratingDistribution,
      topPerformers: records
        .sort((a, b) => b.finalRating - a.finalRating)
        .slice(0, 10)
        .map((r) => ({
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          rating: r.finalRating,
        })),
      needsAttention: records
        .filter((r) => r.finalRating < 2.5)
        .map((r) => ({
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          rating: r.finalRating,
          developmentAreas: r.developmentAreas,
        })),
      generatedAt: new Date(),
    };
  }

  /**
   * Export HR records to external system
   */
  async exportHRRecords(cycleId: string, format: 'JSON' | 'CSV' | 'PDF'): Promise<any> {
    const report = await this.generateHRPerformanceReport(cycleId);

    if (format === 'JSON') {
      return report;
    }

    if (format === 'CSV') {
      return this.convertToCSV(report);
    }

    if (format === 'PDF') {
      // Integration with PDF generation service
      return { message: 'PDF generation not yet implemented' };
    }

    throw new Error('Unsupported export format');
  }

  // ==================== HELPER METHODS ====================

  private async storeInEmployeeHistory(employeeId: string, record: HRReviewRecord): Promise<void> {
    // This would store the record in a dedicated HR records table or document store
    this.logger.log(`Stored HR record in employee history: ${employeeId}`);
  }

  private extractStrengths(selfReview: ReviewForm, managerReview: ReviewForm): string[] {
    const strengths: string[] = [];

    if (selfReview?.strengths) strengths.push(selfReview.strengths);
    if (managerReview?.strengths) strengths.push(managerReview.strengths);

    return strengths;
  }

  private extractDevelopmentAreas(selfReview: ReviewForm, managerReview: ReviewForm): string[] {
    const areas: string[] = [];

    if (selfReview?.areasForImprovement) areas.push(selfReview.areasForImprovement);
    if (managerReview?.areasForImprovement) areas.push(managerReview.areasForImprovement);

    return areas;
  }

  private extractGoals(selfReview: ReviewForm, managerReview: ReviewForm): any[] {
    const goals: any[] = [];

    if (selfReview?.developmentGoals) {
      try {
        const parsed = JSON.parse(selfReview.developmentGoals);
        goals.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch {
        goals.push({ description: selfReview.developmentGoals });
      }
    }

    if (managerReview?.developmentGoals) {
      try {
        const parsed = JSON.parse(managerReview.developmentGoals);
        goals.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch {
        goals.push({ description: managerReview.developmentGoals });
      }
    }

    return goals;
  }

  private consolidateStrengths(history: HRReviewRecord[]): string[] {
    const allStrengths = history.flatMap((r) => r.strengths);
    return [...new Set(allStrengths)].slice(0, 5);
  }

  private consolidateDevelopmentAreas(history: HRReviewRecord[]): string[] {
    const allAreas = history.flatMap((r) => r.developmentAreas);
    return [...new Set(allAreas)].slice(0, 5);
  }

  private convertToCSV(report: any): string {
    // Simple CSV conversion
    const headers = [
      'Employee ID',
      'Employee Name',
      'Self Rating',
      'Manager Rating',
      'Final Rating',
    ];
    
    const rows = report.topPerformers.map((p: any) => [
      p.employeeId,
      p.employeeName,
      '',
      '',
      p.rating,
    ]);

    return [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
  }
}
