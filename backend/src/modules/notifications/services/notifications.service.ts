import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';

export interface CreateNotificationDto {
  recipientId: string;
  organizationId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  linkUrl?: string;
  relatedEntityId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Create a new notification
   */
  async create(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepo.create({
      ...data,
      priority: data.priority || NotificationPriority.MEDIUM,
      isRead: false,
      emailSent: false,
      pushSent: false,
    });

    const saved = await this.notificationRepo.save(notification);
    this.logger.log(`Notification created: ${saved.id} for user ${data.recipientId}`);

    return saved;
  }

  /**
   * Get notifications for a user
   */
  async getByUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    const query: any = { recipientId: userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }

    return this.notificationRepo.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepo.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('recipientId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    this.logger.log(`Marked all notifications as read for user ${userId}`);
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string): Promise<void> {
    await this.notificationRepo.delete(notificationId);
    this.logger.log(`Notification deleted: ${notificationId}`);
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  /**
   * Bulk create notifications
   */
  async createBulk(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const entities = notifications.map((data) =>
      this.notificationRepo.create({
        ...data,
        priority: data.priority || NotificationPriority.MEDIUM,
        isRead: false,
        emailSent: false,
        pushSent: false,
      })
    );

    const saved = await this.notificationRepo.save(entities);
    this.logger.log(`Created ${saved.length} notifications in bulk`);

    return saved;
  }

  /**
   * Clean up old notifications (older than 90 days)
   */
  async cleanupOldNotifications(): Promise<number> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.notificationRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date: ninetyDaysAgo })
      .andWhere('isRead = :isRead', { isRead: true })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old notifications`);

    return result.affected || 0;
  }
}
