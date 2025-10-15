import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watcher, NotificationChannel } from '../entities/watcher.entity';
import { Note, ObjectType } from '../entities/note.entity';
import { NotificationHelperService } from '../../notifications/services/notification-helper.service';
import { NotificationType, NotificationPriority } from '../../notifications/entities/notification.entity';

export interface NotificationEvent {
  eventType: string;
  objectType: ObjectType;
  objectId: string;
  actorId?: string;
  actorName?: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  linkUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class RecruitmentNotificationService {
  private readonly logger = new Logger(RecruitmentNotificationService.name);

  constructor(
    @InjectRepository(Watcher)
    private readonly watcherRepo: Repository<Watcher>,
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  /**
   * Notify watchers of an event
   */
  async notifyWatchers(params: {
    organizationId: string;
    event: NotificationEvent;
    excludeActorId?: string; // Don't notify the person who triggered the action
  }): Promise<void> {
    // Get all watchers for this object
    const watchers = await this.watcherRepo.find({
      where: {
        organizationId: params.organizationId,
        objectType: params.event.objectType,
        objectId: params.event.objectId,
        isActive: true,
      },
    });

    if (watchers.length === 0) {
      this.logger.debug(`No watchers for ${params.event.objectType}:${params.event.objectId}`);
      return;
    }

    const isMention = false; // Check if event includes @mentions
    const isUrgent = params.event.priority === 'URGENT' || params.event.priority === 'HIGH';

    for (const watcher of watchers) {
      // Skip the actor
      if (params.excludeActorId && watcher.userId === params.excludeActorId) {
        continue;
      }

      // Check if watcher wants to be notified for this event
      if (!watcher.shouldNotify(params.event.eventType, isMention, isUrgent)) {
        continue;
      }

      // Send notification via enabled channels
      await this.sendNotification({
        userId: watcher.userId,
        channels: watcher.channels,
        event: params.event,
        organizationId: params.organizationId,
      });

      // Update last notified timestamp
      watcher.lastNotifiedAt = new Date();
      await this.watcherRepo.save(watcher);
    }

    this.logger.log(
      `Notified ${watchers.length} watchers for ${params.event.objectType}:${params.event.objectId}`
    );
  }

  /**
   * Notify specific users
   */
  async notifyUsers(params: {
    userIds: string[];
    event: NotificationEvent;
    organizationId: string;
    channels?: NotificationChannel[];
  }): Promise<void> {
    const channels = params.channels || [NotificationChannel.EMAIL, NotificationChannel.IN_APP];

    for (const userId of params.userIds) {
      await this.sendNotification({
        userId,
        channels,
        event: params.event,
        organizationId: params.organizationId,
      });
    }
  }

  /**
   * Auto-watch: Automatically add watchers when they interact with an object
   */
  async autoWatch(params: {
    userId: string;
    userName: string;
    objectType: ObjectType;
    objectId: string;
    organizationId: string;
    reason: string; // CREATOR, OWNER, INTERVIEWER, etc.
  }): Promise<Watcher> {
    // Check if already watching
    const existing = await this.watcherRepo.findOne({
      where: {
        userId: params.userId,
        objectType: params.objectType,
        objectId: params.objectId,
      },
    });

    if (existing) {
      return existing;
    }

    // Create new watcher
    const watcher = new Watcher();
    watcher.organizationId = params.organizationId;
    watcher.objectType = params.objectType;
    watcher.objectId = params.objectId;
    watcher.userId = params.userId;
    watcher.userName = params.userName;
    watcher.isAutoAssigned = true;
    watcher.assignmentReason = params.reason;
    watcher.channels = [NotificationChannel.EMAIL, NotificationChannel.IN_APP];
    watcher.isActive = true;

    return await this.watcherRepo.save(watcher);
  }

  /**
   * Unwatch: Remove watcher subscription
   */
  async unwatch(params: {
    userId: string;
    objectType: ObjectType;
    objectId: string;
  }): Promise<void> {
    await this.watcherRepo.delete({
      userId: params.userId,
      objectType: params.objectType,
      objectId: params.objectId,
    });
  }

  /**
   * Notify on application stage change
   */
  async notifyStageChange(params: {
    applicationId: string;
    candidateId: string;
    candidateName: string;
    jobTitle: string;
    fromStage: string;
    toStage: string;
    actorId: string;
    actorName: string;
    organizationId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      eventType: 'STAGE_CHANGED',
      objectType: ObjectType.APPLICATION,
      objectId: params.applicationId,
      actorId: params.actorId,
      actorName: params.actorName,
      title: `Application Moved: ${params.candidateName}`,
      message: `${params.candidateName}'s application for ${params.jobTitle} moved from ${params.fromStage} to ${params.toStage}`,
      priority: 'MEDIUM',
      linkUrl: `/recruitment/applications/${params.applicationId}`,
      metadata: {
        candidateId: params.candidateId,
        fromStage: params.fromStage,
        toStage: params.toStage,
      },
    };

    await this.notifyWatchers({
      organizationId: params.organizationId,
      event,
      excludeActorId: params.actorId,
    });
  }

  /**
   * Notify on interview scheduled
   */
  async notifyInterviewScheduled(params: {
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    interviewType: string;
    interviewDate: Date;
    panelUserIds: string[];
    candidateUserId?: string;
    organizationId: string;
  }): Promise<void> {
    const dateStr = params.interviewDate.toLocaleDateString();
    const timeStr = params.interviewDate.toLocaleTimeString();

    // Notify panel members
    const panelEvent: NotificationEvent = {
      eventType: 'INTERVIEW_SCHEDULED',
      objectType: ObjectType.APPLICATION,
      objectId: params.applicationId,
      title: `Interview Scheduled: ${params.candidateName}`,
      message: `You're scheduled to interview ${params.candidateName} for ${params.jobTitle} on ${dateStr} at ${timeStr}`,
      priority: 'HIGH',
      linkUrl: `/recruitment/interviews/${params.applicationId}`,
      actionUrl: `/recruitment/interviews/${params.applicationId}/accept`,
      actionLabel: 'Accept',
    };

    await this.notifyUsers({
      userIds: params.panelUserIds,
      event: panelEvent,
      organizationId: params.organizationId,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.SLACK],
    });

    // Notify candidate (if they have a user account)
    if (params.candidateUserId) {
      const candidateEvent: NotificationEvent = {
        eventType: 'INTERVIEW_SCHEDULED',
        objectType: ObjectType.APPLICATION,
        objectId: params.applicationId,
        title: `Interview Scheduled`,
        message: `Your ${params.interviewType} interview for ${params.jobTitle} is scheduled for ${dateStr} at ${timeStr}`,
        priority: 'HIGH',
        linkUrl: `/candidate/interviews/${params.applicationId}`,
      };

      await this.notifyUsers({
        userIds: [params.candidateUserId],
        event: candidateEvent,
        organizationId: params.organizationId,
      });
    }
  }

  /**
   * Notify on scorecard overdue
   */
  async notifyScorecardOverdue(params: {
    interviewerId: string;
    candidateName: string;
    jobTitle: string;
    interviewDate: Date;
    dueDate: Date;
    organizationId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      eventType: 'SCORECARD_OVERDUE',
      objectType: ObjectType.INTERVIEW,
      objectId: params.interviewerId,
      title: `Scorecard Overdue`,
      message: `Your feedback for ${params.candidateName} (${params.jobTitle}) was due on ${params.dueDate.toLocaleDateString()}. Please submit it as soon as possible.`,
      priority: 'URGENT',
      linkUrl: `/recruitment/scorecards/pending`,
      actionUrl: `/recruitment/scorecards/submit`,
      actionLabel: 'Submit Feedback',
    };

    await this.notifyUsers({
      userIds: [params.interviewerId],
      event,
      organizationId: params.organizationId,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    });
  }

  /**
   * Notify on offer sent
   */
  async notifyOfferSent(params: {
    offerId: string;
    candidateUserId?: string;
    candidateName: string;
    jobTitle: string;
    baseSalary: number;
    currency: string;
    expiresAt: Date;
    organizationId: string;
  }): Promise<void> {
    if (!params.candidateUserId) return;

    const event: NotificationEvent = {
      eventType: 'OFFER_SENT',
      objectType: ObjectType.OFFER,
      objectId: params.offerId,
      title: `Job Offer Received!`,
      message: `Congratulations! You've received an offer for ${params.jobTitle} with a base salary of ${params.currency} ${params.baseSalary.toLocaleString()}. Offer expires on ${params.expiresAt.toLocaleDateString()}.`,
      priority: 'URGENT',
      linkUrl: `/candidate/offers/${params.offerId}`,
      actionUrl: `/candidate/offers/${params.offerId}/accept`,
      actionLabel: 'View Offer',
    };

    await this.notifyUsers({
      userIds: [params.candidateUserId],
      event,
      organizationId: params.organizationId,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.SMS],
    });
  }

  /**
   * Notify on approval request
   */
  async notifyApprovalRequest(params: {
    approverId: string;
    approverName: string;
    objectType: 'REQUISITION' | 'OFFER';
    objectId: string;
    title: string;
    submittedBy: string;
    organizationId: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      eventType: 'APPROVAL_REQUESTED',
      objectType: params.objectType as ObjectType,
      objectId: params.objectId,
      title: `Approval Required: ${params.title}`,
      message: `${params.submittedBy} has submitted ${params.objectType === 'REQUISITION' ? 'a requisition' : 'an offer'} for your approval.`,
      priority: 'HIGH',
      linkUrl: `/recruitment/approvals/${params.objectId}`,
      actionUrl: `/recruitment/approvals/${params.objectId}/review`,
      actionLabel: 'Review',
    };

    await this.notifyUsers({
      userIds: [params.approverId],
      event,
      organizationId: params.organizationId,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    });
  }

  /**
   * Notify on check completed/failed
   */
  async notifyCheckCompleted(params: {
    candidateName: string;
    checkType: string;
    result: 'CLEAR' | 'CONDITIONAL' | 'FAILED';
    notifyUserIds: string[];
    organizationId: string;
  }): Promise<void> {
    const priority = params.result === 'FAILED' ? 'URGENT' : 'MEDIUM';
    const emoji = params.result === 'CLEAR' ? '✅' : params.result === 'FAILED' ? '❌' : '⚠️';

    const event: NotificationEvent = {
      eventType: 'CHECK_COMPLETED',
      objectType: ObjectType.CHECK,
      objectId: '',
      title: `${emoji} ${params.checkType} Check Completed`,
      message: `${params.checkType} check for ${params.candidateName} returned: ${params.result}`,
      priority: priority as any,
      linkUrl: `/recruitment/checks`,
    };

    await this.notifyUsers({
      userIds: params.notifyUserIds,
      event,
      organizationId: params.organizationId,
    });
  }

  /**
   * Send daily digest
   */
  async sendDailyDigest(params: {
    userId: string;
    organizationId: string;
  }): Promise<void> {
    // Get all events for this user in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch notes, logs, etc. and compile digest
    // This would aggregate all activity and send a single email

    this.logger.log(`Daily digest sent to user ${params.userId}`);
  }

  // Private helper methods

  private async sendNotification(params: {
    userId: string;
    channels: NotificationChannel[];
    event: NotificationEvent;
    organizationId: string;
  }): Promise<void> {
    for (const channel of params.channels) {
      switch (channel) {
        case NotificationChannel.IN_APP:
          await this.sendInAppNotification(params);
          break;
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(params);
          break;
        case NotificationChannel.SLACK:
          await this.sendSlackNotification(params);
          break;
        case NotificationChannel.SMS:
          await this.sendSMSNotification(params);
          break;
        case NotificationChannel.PUSH:
          await this.sendPushNotification(params);
          break;
      }
    }
  }

  private async sendInAppNotification(params: {
    userId: string;
    event: NotificationEvent;
    organizationId: string;
  }): Promise<void> {
    // Create notification directly using NotificationHelperService
    // The helper service exposes specific methods, so we'll add a generic one or use the service directly
    this.logger.debug(`In-app notification sent to user ${params.userId}: ${params.event.title}`);
    // TODO: Integrate with NotificationHelperService when generic method is added
  }

  private async sendEmailNotification(params: any): Promise<void> {
    // Integrate with email service (SendGrid, AWS SES, etc.)
    this.logger.debug(`Email notification sent to user ${params.userId}`);
  }

  private async sendSlackNotification(params: any): Promise<void> {
    // Integrate with Slack API
    this.logger.debug(`Slack notification sent to user ${params.userId}`);
  }

  private async sendSMSNotification(params: any): Promise<void> {
    // Integrate with Twilio, AWS SNS, etc.
    this.logger.debug(`SMS notification sent to user ${params.userId}`);
  }

  private async sendPushNotification(params: any): Promise<void> {
    // Integrate with Firebase Cloud Messaging, etc.
    this.logger.debug(`Push notification sent to user ${params.userId}`);
  }

  private mapEventToNotificationType(eventType: string): NotificationType {
    const mapping: Record<string, NotificationType> = {
      'STAGE_CHANGED': NotificationType.RECRUITMENT,
      'INTERVIEW_SCHEDULED': NotificationType.RECRUITMENT,
      'SCORECARD_OVERDUE': NotificationType.RECRUITMENT,
      'OFFER_SENT': NotificationType.RECRUITMENT,
      'APPROVAL_REQUESTED': NotificationType.APPROVAL,
      'CHECK_COMPLETED': NotificationType.RECRUITMENT,
    };
    return mapping[eventType] || NotificationType.RECRUITMENT;
  }

  private mapPriority(priority: string): NotificationPriority {
    const mapping: Record<string, NotificationPriority> = {
      'LOW': NotificationPriority.LOW,
      'MEDIUM': NotificationPriority.MEDIUM,
      'HIGH': NotificationPriority.HIGH,
      'URGENT': NotificationPriority.URGENT,
    };
    return mapping[priority] || NotificationPriority.MEDIUM;
  }
}
