import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  UserSettings,
  NotificationPreference,
  NotificationSubscription,
  NotificationQueue,
} from './entities/user-settings.entity';
import {
  UpdateUserSettingsDto,
  UpdateNotificationPreferenceDto,
  UpdateNotificationSubscriptionDto,
  CreateNotificationDto,
  DEFAULT_NOTIFICATION_SUBSCRIPTIONS,
} from './dto/user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationSubscription)
    private readonly subscriptionRepository: Repository<NotificationSubscription>,
    @InjectRepository(NotificationQueue)
    private readonly queueRepository: Repository<NotificationQueue>,
  ) {}

  // ==================== USER SETTINGS ====================

  async getSettings(userId: string) {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = this.settingsRepository.create({ userId });
      settings = await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(userId: string, dto: UpdateUserSettingsDto) {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ userId, ...dto });
    } else {
      Object.assign(settings, dto);
    }

    return await this.settingsRepository.save(settings);
  }

  // ==================== NOTIFICATION PREFERENCES ====================

  async getNotificationPreference(userId: string) {
    let preference = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      // Create default preference
      preference = this.preferenceRepository.create({ userId });
      preference = await this.preferenceRepository.save(preference);
    }

    return preference;
  }

  async updateNotificationPreference(
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ) {
    let preference = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = this.preferenceRepository.create({ userId, ...dto });
    } else {
      Object.assign(preference, dto);
    }

    return await this.preferenceRepository.save(preference);
  }

  // ==================== NOTIFICATION SUBSCRIPTIONS ====================

  async getNotificationSubscriptions(userId: string) {
    let subscriptions = await this.subscriptionRepository.find({
      where: { userId },
    });

    // Initialize default subscriptions if none exist
    if (subscriptions.length === 0) {
      subscriptions = await this.initializeDefaultSubscriptions(userId);
    }

    return subscriptions;
  }

  async updateNotificationSubscription(
    userId: string,
    key: string,
    dto: UpdateNotificationSubscriptionDto,
  ) {
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId, key },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${key} not found`);
    }

    Object.assign(subscription, dto);
    return await this.subscriptionRepository.save(subscription);
  }

  private async initializeDefaultSubscriptions(userId: string) {
    const subscriptions = DEFAULT_NOTIFICATION_SUBSCRIPTIONS.map((sub) =>
      this.subscriptionRepository.create({
        userId,
        ...sub,
        channel: 'EMAIL' as any,
      }),
    );

    return await this.subscriptionRepository.save(subscriptions);
  }

  // ==================== NOTIFICATION QUEUE ====================

  async queueNotification(dto: CreateNotificationDto) {
    const notification = this.queueRepository.create({
      ...dto,
      status: 'PENDING',
      scheduledFor: new Date(),
    });

    return await this.queueRepository.save(notification);
  }

  async getPendingNotifications(limit: number = 100) {
    return await this.queueRepository.find({
      where: {
        status: 'PENDING',
        scheduledFor: LessThanOrEqual(new Date()),
      },
      take: limit,
      order: {
        scheduledFor: 'ASC',
      },
    });
  }

  async markNotificationAsSent(id: string) {
    const notification = await this.queueRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = 'SENT';
    notification.sentAt = new Date();

    return await this.queueRepository.save(notification);
  }

  async markNotificationAsFailed(id: string, errorMessage: string) {
    const notification = await this.queueRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = 'FAILED';
    notification.errorMessage = errorMessage;
    notification.retryCount += 1;

    return await this.queueRepository.save(notification);
  }

  async getUserNotifications(userId: string, limit: number = 50) {
    return await this.queueRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  // ==================== DIGEST PROCESSING ====================

  async getUsersForDailyDigest(time: string) {
    // Get users who have daily digest enabled at this time
    return await this.preferenceRepository.find({
      where: {
        delivery: 'DAILY_DIGEST',
        digestTime: time,
      },
    });
  }

  async getUsersForWeeklyDigest(dayOfWeek: number) {
    // Get users who have weekly digest enabled for this day
    return await this.preferenceRepository.find({
      where: {
        delivery: 'WEEKLY_DIGEST',
        digestDayOfWeek: dayOfWeek,
      },
    });
  }

  async getPendingNotificationsForUser(
    userId: string,
    since: Date,
  ): Promise<NotificationQueue[]> {
    return await this.queueRepository.find({
      where: {
        userId,
        status: 'PENDING',
        scheduledFor: LessThanOrEqual(new Date()),
      },
      order: {
        scheduledFor: 'ASC',
      },
    });
  }
}
