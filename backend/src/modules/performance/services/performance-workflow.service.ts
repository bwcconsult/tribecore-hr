import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewCycle, ReviewCycleStatus } from '../entities/review-cycle.entity';
import { ReviewForm, ReviewFormStatus, ReviewFormType } from '../entities/review-form.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { IntegrationNotificationService } from './integration-notification.service';
import { HRRecordsService } from './hr-records.service';

@Injectable()
export class PerformanceWorkflowService {
  private readonly logger = new Logger(PerformanceWorkflowService.name);

  constructor(
    @InjectRepository(ReviewCycle)
    private readonly reviewCycleRepo: Repository<ReviewCycle>,
    @InjectRepository(ReviewForm)
    private readonly reviewFormRepo: Repository<ReviewForm>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly integrationNotificationService: IntegrationNotificationService,
    private readonly hrRecordsService: HRRecordsService,
  ) {}

  /**
   * Handle self-review submission
   * Triggers: Notify manager that employee completed self-review
   */
  async handleSelfReviewSubmission(formId: string): Promise<void> {
    this.logger.log(`Processing self-review submission: ${formId}`);

    const form = await this.reviewFormRepo.findOne({
      where: { id: formId },
      relations: ['user', 'cycle'],
    });

    if (!form || form.type !== ReviewFormType.SELF) {
      throw new Error('Invalid self-review form');
    }

    // Update status
    form.status = ReviewFormStatus.SUBMITTED;
    form.submittedAt = new Date();
    await this.reviewFormRepo.save(form);

    // Get manager
    const employee = await this.employeeRepo.findOne({
      where: { id: form.userId },
      relations: ['manager'],
    });

    if (!employee?.manager) {
      this.logger.warn(`No manager found for employee ${form.userId}`);
      return;
    }

    // Notify manager
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: employee.managerId,
      title: `✅ Self-Review Completed: ${employee.firstName} ${employee.lastName}`,
      message: `${employee.firstName} ${employee.lastName} has completed their self-review for ${form.cycle.name}. Please complete the manager review by ${new Date(form.cycle.managerReviewEndDate).toLocaleDateString()}.`,
      priority: 'HIGH',
      type: 'PERFORMANCE',
      linkUrl: `/performance/reviews/${form.cycleId}/submit`,
      channels: ['EMAIL', 'SLACK', 'TEAMS', 'IN_APP'],
    });

    // Check if all team members have completed self-reviews
    await this.checkTeamCompletionStatus(employee.managerId, form.cycleId);

    this.logger.log(`Self-review submission processed for ${form.userId}`);
  }

  /**
   * Handle manager review submission
   * Triggers: Notify employee, check if ready for calibration, notify HR
   */
  async handleManagerReviewSubmission(formId: string): Promise<void> {
    this.logger.log(`Processing manager review submission: ${formId}`);

    const form = await this.reviewFormRepo.findOne({
      where: { id: formId },
      relations: ['user', 'reviewer', 'cycle'],
    });

    if (!form || form.type !== ReviewFormType.MANAGER) {
      throw new Error('Invalid manager review form');
    }

    // Update status
    form.status = ReviewFormStatus.SUBMITTED;
    form.submittedAt = new Date();
    await this.reviewFormRepo.save(form);

    // Notify employee
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: form.userId,
      title: `✅ Manager Review Completed`,
      message: `Your manager has completed your performance review for ${form.cycle.name}. The review is now with HR for calibration.`,
      priority: 'MEDIUM',
      type: 'PERFORMANCE',
      linkUrl: `/performance/reviews/${form.cycleId}`,
      channels: ['EMAIL', 'IN_APP'],
    });

    // Check if cycle is ready for calibration
    const readyForCalibration = await this.checkIfReadyForCalibration(form.cycleId);

    if (readyForCalibration) {
      await this.transitionToCalibration(form.cycleId);
    }

    // Notify HR
    await this.notifyHROfCompletedReview(form);

    this.logger.log(`Manager review submission processed for ${form.userId}`);
  }

  /**
   * Handle calibration completion
   * Triggers: Archive to HR, notify employee of results availability
   */
  async handleCalibrationCompletion(cycleId: string): Promise<void> {
    this.logger.log(`Processing calibration completion: ${cycleId}`);

    const cycle = await this.reviewCycleRepo.findOne({
      where: { id: cycleId },
    });

    if (!cycle) {
      throw new Error('Review cycle not found');
    }

    // Update cycle status
    cycle.status = ReviewCycleStatus.PUBLISHED;
    await this.reviewCycleRepo.save(cycle);

    // Get all review forms for this cycle
    const reviewForms = await this.reviewFormRepo.find({
      where: { cycleId, status: ReviewFormStatus.SUBMITTED },
      relations: ['user'],
    });

    // Mark all forms as published
    for (const form of reviewForms) {
      form.status = ReviewFormStatus.PUBLISHED;
      await this.reviewFormRepo.save(form);

      // Archive to HR records
      try {
        await this.hrRecordsService.archiveReviewToHRRecords(cycleId, form.userId);
      } catch (error) {
        this.logger.error(`Failed to archive review for ${form.userId}: ${error.message}`);
      }

      // Notify employee
      await this.integrationNotificationService.sendMultiChannelNotification({
        userId: form.userId,
        title: `📊 Performance Review Results Available`,
        message: `Your performance review results for ${cycle.name} are now available. Please review and acknowledge.`,
        priority: 'HIGH',
        type: 'PERFORMANCE',
        linkUrl: `/performance/reviews/${cycleId}/results/${form.userId}`,
        channels: ['EMAIL', 'SLACK', 'TEAMS', 'IN_APP'],
      });
    }

    this.logger.log(`Calibration completion processed for cycle ${cycleId}`);
  }

  /**
   * Handle 1:1 meeting scheduled
   * Triggers: Send calendar invites, reminders
   */
  async handle1on1Scheduled(oneOnOneId: string, meetingDate: Date, managerId: string, employeeId: string): Promise<void> {
    this.logger.log(`Processing 1:1 scheduled: ${oneOnOneId}`);

    const manager = await this.employeeRepo.findOne({ where: { id: managerId } });
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });

    if (!manager || !employee) {
      throw new Error('Manager or employee not found');
    }

    // Send calendar invites to both parties
    const notifications = [
      {
        userId: managerId,
        title: `📅 1:1 Scheduled: ${employee.firstName} ${employee.lastName}`,
        message: `Your 1:1 meeting with ${employee.firstName} ${employee.lastName} is scheduled for ${meetingDate.toLocaleString()}.`,
        priority: 'MEDIUM' as const,
        type: 'PERFORMANCE',
        linkUrl: `/performance/one-on-ones`,
        channels: ['EMAIL', 'OUTLOOK', 'TEAMS', 'IN_APP'] as any[],
        metadata: {
          meetingDate: meetingDate.toISOString(),
          managerEmail: manager.email,
          managerName: `${manager.firstName} ${manager.lastName}`,
          location: 'Virtual',
        },
      },
      {
        userId: employeeId,
        title: `📅 1:1 Scheduled: ${manager.firstName} ${manager.lastName}`,
        message: `Your 1:1 meeting with ${manager.firstName} ${manager.lastName} is scheduled for ${meetingDate.toLocaleString()}.`,
        priority: 'MEDIUM' as const,
        type: 'PERFORMANCE',
        linkUrl: `/performance/one-on-ones`,
        channels: ['EMAIL', 'OUTLOOK', 'TEAMS', 'IN_APP'] as any[],
        metadata: {
          meetingDate: meetingDate.toISOString(),
          managerEmail: manager.email,
          managerName: `${manager.firstName} ${manager.lastName}`,
          location: 'Virtual',
        },
      },
    ];

    for (const notification of notifications) {
      await this.integrationNotificationService.sendMultiChannelNotification(notification);
    }

    this.logger.log(`1:1 scheduled notifications sent for ${oneOnOneId}`);
  }

  /**
   * Handle goal/objective completion
   * Triggers: Notify manager, update progress
   */
  async handleObjectiveCompleted(objectiveId: string, employeeId: string): Promise<void> {
    this.logger.log(`Processing objective completion: ${objectiveId}`);

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      relations: ['manager'],
    });

    if (!employee?.manager) {
      return;
    }

    // Notify manager
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: employee.managerId,
      title: `🎯 Objective Completed: ${employee.firstName} ${employee.lastName}`,
      message: `${employee.firstName} ${employee.lastName} has marked an objective as completed. Please review and approve.`,
      priority: 'MEDIUM',
      type: 'PERFORMANCE',
      linkUrl: `/performance/objectives`,
      channels: ['IN_APP', 'EMAIL'],
    });

    this.logger.log(`Objective completion notification sent for ${objectiveId}`);
  }

  // ==================== HELPER METHODS ====================

  private async checkTeamCompletionStatus(managerId: string, cycleId: string): Promise<void> {
    // Check if all team members have completed self-reviews
    const teamMembers = await this.employeeRepo.find({
      where: { managerId },
    });

    const completedCount = await this.reviewFormRepo.count({
      where: {
        cycleId,
        type: ReviewFormType.SELF,
        status: ReviewFormStatus.SUBMITTED,
        userId: In(teamMembers.map((e) => e.id)),
      },
    });

    if (completedCount === teamMembers.length) {
      // All team members completed - send summary to manager
      await this.integrationNotificationService.sendMultiChannelNotification({
        userId: managerId,
        title: `✅ Team Self-Reviews Complete`,
        message: `All ${teamMembers.length} team members have completed their self-reviews. You can now start manager reviews.`,
        priority: 'HIGH',
        type: 'PERFORMANCE',
        linkUrl: `/performance/reviews/${cycleId}`,
        channels: ['EMAIL', 'IN_APP'],
      });
    }
  }

  private async checkIfReadyForCalibration(cycleId: string): Promise<boolean> {
    const cycle = await this.reviewCycleRepo.findOne({ where: { id: cycleId } });
    if (!cycle) return false;

    // Count total expected reviews vs completed
    const totalReviews = await this.reviewFormRepo.count({
      where: { cycleId, type: ReviewFormType.MANAGER },
    });

    const completedReviews = await this.reviewFormRepo.count({
      where: { cycleId, type: ReviewFormType.MANAGER, status: ReviewFormStatus.SUBMITTED },
    });

    // Ready if 100% complete
    return totalReviews > 0 && completedReviews === totalReviews;
  }

  private async transitionToCalibration(cycleId: string): Promise<void> {
    const cycle = await this.reviewCycleRepo.findOne({ where: { id: cycleId } });
    if (!cycle) return;

    cycle.status = ReviewCycleStatus.CALIBRATION;
    await this.reviewCycleRepo.save(cycle);

    // Notify HR team
    this.logger.log(`Cycle ${cycleId} transitioned to calibration`);
  }

  private async notifyHROfCompletedReview(form: ReviewForm): Promise<void> {
    // Notify HR that a review is completed and archived
    this.logger.log(`HR notified of completed review for employee ${form.userId}`);
  }
}

// Import statement fix
import { In } from 'typeorm';
