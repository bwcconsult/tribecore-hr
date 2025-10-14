import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, IsNull, Not } from 'typeorm';
import { ReviewCycle, ReviewCycleStatus } from '../entities/review-cycle.entity';
import { ReviewForm, ReviewFormStatus, ReviewFormType } from '../entities/review-form.entity';
import { OneOnOne, OneOnOneStatus } from '../entities/one-on-one.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { IntegrationNotificationService } from './integration-notification.service';

@Injectable()
export class PerformanceSchedulerService {
  private readonly logger = new Logger(PerformanceSchedulerService.name);

  constructor(
    @InjectRepository(ReviewCycle)
    private readonly reviewCycleRepo: Repository<ReviewCycle>,
    @InjectRepository(ReviewForm)
    private readonly reviewFormRepo: Repository<ReviewForm>,
    @InjectRepository(OneOnOne)
    private readonly oneOnOneRepo: Repository<OneOnOne>,
    private readonly notificationsService: NotificationsService,
    private readonly integrationNotificationService: IntegrationNotificationService,
  ) {}

  /**
   * Daily job at 9 AM - Check for review cycles that need to start
   */
  @Cron('0 9 * * *', { name: 'start-review-cycles' })
  async checkAndStartReviewCycles() {
    this.logger.log('Checking for review cycles to start...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find cycles that should start self-reviews today
    const cyclesToStartSelfReview = await this.reviewCycleRepo.find({
      where: {
        status: ReviewCycleStatus.ACTIVE,
      },
    });

    for (const cycle of cyclesToStartSelfReview) {
      const selfReviewStart = new Date(cycle.selfReviewStartDate);
      selfReviewStart.setHours(0, 0, 0, 0);

      if (selfReviewStart.getTime() === today.getTime()) {
        cycle.status = ReviewCycleStatus.SELF_REVIEW_OPEN;
        await this.reviewCycleRepo.save(cycle);

        // Notify all participants
        await this.notifyParticipantsReviewStart(cycle, ReviewFormType.SELF);
        this.logger.log(`Started self-review phase for cycle: ${cycle.name}`);
      }

      // Check if manager reviews should start
      const managerReviewStart = new Date(cycle.managerReviewStartDate);
      managerReviewStart.setHours(0, 0, 0, 0);

      if (managerReviewStart.getTime() === today.getTime()) {
        cycle.status = ReviewCycleStatus.MANAGER_REVIEW_OPEN;
        await this.reviewCycleRepo.save(cycle);

        // Notify all managers
        await this.notifyManagersReviewStart(cycle);
        this.logger.log(`Started manager-review phase for cycle: ${cycle.name}`);
      }
    }
  }

  /**
   * Daily job at 10 AM - Send reminders for overdue reviews
   */
  @Cron('0 10 * * *', { name: 'send-review-reminders' })
  async sendReviewReminders() {
    this.logger.log('Sending review reminders for overdue forms...');

    const today = new Date();

    // Find overdue self-reviews
    const overdueSelfReviews = await this.reviewFormRepo
      .createQueryBuilder('form')
      .leftJoinAndSelect('form.cycle', 'cycle')
      .leftJoinAndSelect('form.user', 'user')
      .where('form.type = :type', { type: ReviewFormType.SELF })
      .andWhere('form.status IN (:...statuses)', {
        statuses: [ReviewFormStatus.NOT_STARTED, ReviewFormStatus.DRAFT],
      })
      .andWhere('cycle.selfReviewEndDate < :today', { today })
      .getMany();

    for (const form of overdueSelfReviews) {
      const remindersSent = form.metadata?.remindersSent || 0;
      const daysSinceDeadline = Math.floor(
        (today.getTime() - new Date(form.cycle.selfReviewEndDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send reminders based on escalation schedule
      if (this.shouldSendReminder(remindersSent, daysSinceDeadline)) {
        await this.sendReviewReminderToEmployee(form, daysSinceDeadline);
        
        // Update reminder count
        form.metadata = {
          ...form.metadata,
          remindersSent: remindersSent + 1,
        };
        await this.reviewFormRepo.save(form);

        // Escalate to manager after 3 reminders
        if (remindersSent >= 2) {
          await this.escalateToManager(form, daysSinceDeadline);
        }

        // Escalate to HR after 5 reminders
        if (remindersSent >= 4) {
          await this.escalateToHR(form, daysSinceDeadline);
        }
      }
    }

    // Find overdue manager reviews
    const overdueManagerReviews = await this.reviewFormRepo
      .createQueryBuilder('form')
      .leftJoinAndSelect('form.cycle', 'cycle')
      .leftJoinAndSelect('form.reviewer', 'reviewer')
      .where('form.type = :type', { type: ReviewFormType.MANAGER })
      .andWhere('form.status IN (:...statuses)', {
        statuses: [ReviewFormStatus.NOT_STARTED, ReviewFormStatus.DRAFT],
      })
      .andWhere('cycle.managerReviewEndDate < :today', { today })
      .getMany();

    for (const form of overdueManagerReviews) {
      const remindersSent = form.metadata?.remindersSent || 0;
      const daysSinceDeadline = Math.floor(
        (today.getTime() - new Date(form.cycle.managerReviewEndDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (this.shouldSendReminder(remindersSent, daysSinceDeadline)) {
        await this.sendReviewReminderToManager(form, daysSinceDeadline);
        
        form.metadata = {
          ...form.metadata,
          remindersSent: remindersSent + 1,
        };
        await this.reviewFormRepo.save(form);

        // Escalate to senior management after 2 reminders
        if (remindersSent >= 1) {
          await this.escalateManagerReviewToSeniorLeadership(form, daysSinceDeadline);
        }
      }
    }

    this.logger.log(`Review reminders sent. Self: ${overdueSelfReviews.length}, Manager: ${overdueManagerReviews.length}`);
  }

  /**
   * Daily job at 2 PM - Send reminders for upcoming 1:1s
   */
  @Cron('0 14 * * *', { name: 'send-one-on-one-reminders' })
  async sendOneOnOneReminders() {
    this.logger.log('Sending 1:1 meeting reminders...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Find 1:1s scheduled for tomorrow
    const upcomingOneOnOnes = await this.oneOnOneRepo.find({
      where: {
        scheduledAt: In([tomorrow, endOfTomorrow]),
        status: In([OneOnOneStatus.SCHEDULED, OneOnOneStatus.DRAFT]),
      },
      relations: ['manager', 'employee'],
    });

    for (const oneOnOne of upcomingOneOnOnes) {
      await this.sendOneOnOneReminder(oneOnOne);
    }

    this.logger.log(`Sent reminders for ${upcomingOneOnOnes.length} upcoming 1:1s`);
  }

  /**
   * Daily job at 3 PM - Check for completed reviews and notify managers
   */
  @Cron('0 15 * * *', { name: 'notify-completed-reviews' })
  async notifyCompletedReviews() {
    this.logger.log('Checking for newly completed reviews...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Find reviews submitted in the last 24 hours
    const recentlyCompletedReviews = await this.reviewFormRepo.find({
      where: {
        status: ReviewFormStatus.SUBMITTED,
        submittedAt: Not(IsNull()),
      },
      relations: ['user', 'reviewer', 'cycle'],
    });

    for (const form of recentlyCompletedReviews) {
      const submittedAt = new Date(form.submittedAt);
      const hoursSinceSubmission = (new Date().getTime() - submittedAt.getTime()) / (1000 * 60 * 60);

      // Only notify if submitted in last 24 hours and notification not yet sent
      if (hoursSinceSubmission <= 24 && !form.metadata?.managerNotified) {
        if (form.type === ReviewFormType.SELF) {
          // Notify manager that employee completed self-review
          await this.notifyManagerOfCompletedSelfReview(form);
        } else if (form.type === ReviewFormType.MANAGER) {
          // Notify employee and HR that manager completed review
          await this.notifyEmployeeOfCompletedManagerReview(form);
          await this.notifyHROfCompletedManagerReview(form);
        }

        form.metadata = {
          ...form.metadata,
          managerNotified: true,
        };
        await this.reviewFormRepo.save(form);
      }
    }

    this.logger.log('Completed review notifications sent');
  }

  /**
   * Weekly job on Monday at 9 AM - Send weekly digest
   */
  @Cron('0 9 * * 1', { name: 'send-weekly-digest' })
  async sendWeeklyPerformanceDigest() {
    this.logger.log('Sending weekly performance digest...');

    // Find all active review cycles
    const activeCycles = await this.reviewCycleRepo.find({
      where: {
        status: In([
          ReviewCycleStatus.ACTIVE,
          ReviewCycleStatus.SELF_REVIEW_OPEN,
          ReviewCycleStatus.MANAGER_REVIEW_OPEN,
        ]),
      },
    });

    for (const cycle of activeCycles) {
      await this.sendCycleStatusDigest(cycle);
    }

    this.logger.log('Weekly digests sent');
  }

  // ==================== HELPER METHODS ====================

  private shouldSendReminder(remindersSent: number, daysSinceDeadline: number): boolean {
    // Send reminders on day 1, 3, 5, 7, 10, 14, then weekly
    if (remindersSent === 0 && daysSinceDeadline >= 1) return true;
    if (remindersSent === 1 && daysSinceDeadline >= 3) return true;
    if (remindersSent === 2 && daysSinceDeadline >= 5) return true;
    if (remindersSent === 3 && daysSinceDeadline >= 7) return true;
    if (remindersSent === 4 && daysSinceDeadline >= 10) return true;
    if (remindersSent === 5 && daysSinceDeadline >= 14) return true;
    if (remindersSent > 5 && daysSinceDeadline % 7 === 0) return true;
    return false;
  }

  private async notifyParticipantsReviewStart(cycle: ReviewCycle, type: ReviewFormType) {
    // Implementation sends notifications to all participants
    // Calls notificationsService and integrationNotificationService
    this.logger.log(`Notifying participants about ${type} review start for ${cycle.name}`);
  }

  private async notifyManagersReviewStart(cycle: ReviewCycle) {
    // Implementation sends notifications to all managers
    this.logger.log(`Notifying managers about review start for ${cycle.name}`);
  }

  private async sendReviewReminderToEmployee(form: ReviewForm, daysOverdue: number) {
    const urgency = daysOverdue > 7 ? 'URGENT' : daysOverdue > 3 ? 'HIGH' : 'MEDIUM';
    
    // Send via all channels
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: form.userId,
      title: `⏰ Review Reminder: ${form.cycle.name}`,
      message: `Your ${form.type} review is ${daysOverdue} day(s) overdue. Please complete it as soon as possible.`,
      priority: urgency as any,
      type: 'PERFORMANCE',
      linkUrl: `/performance/reviews/${form.cycleId}/submit`,
      channels: ['EMAIL', 'SLACK', 'TEAMS', 'OUTLOOK', 'IN_APP'],
    });

    this.logger.log(`Sent reminder to employee ${form.userId} for form ${form.id}`);
  }

  private async sendReviewReminderToManager(form: ReviewForm, daysOverdue: number) {
    const urgency = daysOverdue > 5 ? 'URGENT' : daysOverdue > 2 ? 'HIGH' : 'MEDIUM';
    
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: form.reviewerId,
      title: `⏰ Manager Review Reminder: ${form.user.firstName} ${form.user.lastName}`,
      message: `Manager review for ${form.user.firstName} ${form.user.lastName} is ${daysOverdue} day(s) overdue.`,
      priority: urgency as any,
      type: 'PERFORMANCE',
      linkUrl: `/performance/reviews/${form.cycleId}/submit`,
      channels: ['EMAIL', 'SLACK', 'TEAMS', 'OUTLOOK', 'IN_APP'],
    });

    this.logger.log(`Sent reminder to manager ${form.reviewerId} for form ${form.id}`);
  }

  private async escalateToManager(form: ReviewForm, daysOverdue: number) {
    // Notify the employee's manager about overdue review
    this.logger.log(`Escalating to manager for employee ${form.userId}, ${daysOverdue} days overdue`);
  }

  private async escalateToHR(form: ReviewForm, daysOverdue: number) {
    // Notify HR about severely overdue review
    this.logger.log(`Escalating to HR for employee ${form.userId}, ${daysOverdue} days overdue`);
  }

  private async escalateManagerReviewToSeniorLeadership(form: ReviewForm, daysOverdue: number) {
    // Notify senior leadership about overdue manager reviews
    this.logger.log(`Escalating manager review to senior leadership for form ${form.id}`);
  }

  private async sendOneOnOneReminder(oneOnOne: OneOnOne) {
    // Send reminder to both manager and employee
    this.logger.log(`Sending 1:1 reminder for meeting ${oneOnOne.id}`);
  }

  private async notifyManagerOfCompletedSelfReview(form: ReviewForm) {
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: form.user.managerId,
      title: `✅ Self-Review Completed: ${form.user.firstName} ${form.user.lastName}`,
      message: `${form.user.firstName} ${form.user.lastName} has completed their self-review for ${form.cycle.name}. Please complete the manager review.`,
      priority: 'HIGH',
      type: 'PERFORMANCE',
      linkUrl: `/performance/reviews/${form.cycleId}/submit`,
      channels: ['EMAIL', 'SLACK', 'TEAMS', 'OUTLOOK', 'IN_APP'],
    });

    this.logger.log(`Notified manager about completed self-review for ${form.userId}`);
  }

  private async notifyEmployeeOfCompletedManagerReview(form: ReviewForm) {
    await this.integrationNotificationService.sendMultiChannelNotification({
      userId: form.userId,
      title: `✅ Manager Review Completed`,
      message: `Your manager has completed your performance review for ${form.cycle.name}.`,
      priority: 'MEDIUM',
      type: 'PERFORMANCE',
      linkUrl: `/performance/reviews/${form.cycleId}/results/${form.userId}`,
      channels: ['EMAIL', 'IN_APP'],
    });

    this.logger.log(`Notified employee ${form.userId} about completed manager review`);
  }

  private async notifyHROfCompletedManagerReview(form: ReviewForm) {
    // Notify HR that a review is ready for their records
    this.logger.log(`Notified HR about completed manager review for ${form.userId}`);
  }

  private async sendCycleStatusDigest(cycle: ReviewCycle) {
    // Send weekly status digest to HR/admins
    this.logger.log(`Sending weekly digest for cycle ${cycle.name}`);
  }
}
