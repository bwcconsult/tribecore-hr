import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationPreferencesService {
  private readonly logger = new Logger(NotificationPreferencesService.name);

  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
  ) {}

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepo.find({
      where: { userId },
    });
  }

  /**
   * Get preference for specific notification type
   */
  async getPreference(userId: string, type: NotificationType): Promise<NotificationPreference | null> {
    return this.preferenceRepo.findOne({
      where: { userId, type },
    });
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    let preference = await this.preferenceRepo.findOne({
      where: { userId, type: preferences.type },
    });

    if (!preference) {
      preference = this.preferenceRepo.create({
        userId,
        organizationId: preferences.organizationId,
        type: preferences.type,
        ...preferences,
      });
    } else {
      Object.assign(preference, preferences);
    }

    return this.preferenceRepo.save(preference);
  }

  /**
   * Set default preferences for a new user
   */
  async setDefaultPreferences(userId: string, organizationId: string): Promise<void> {
    const types = Object.values(NotificationType);
    const preferences = types.map((type) =>
      this.preferenceRepo.create({
        userId,
        organizationId,
        type,
        inApp: true,
        email: true,
        push: false,
        sms: false,
        frequency: 'INSTANT',
      })
    );

    await this.preferenceRepo.save(preferences);
    this.logger.log(`Default preferences set for user ${userId}`);
  }

  /**
   * Check if user should receive notification based on preferences
   */
  async shouldNotify(userId: string, type: NotificationType, channel: string): Promise<boolean> {
    const preference = await this.getPreference(userId, type);

    if (!preference) {
      return true; // Default to send if no preference set
    }

    // Check channel preference
    if (channel === 'IN_APP' && !preference.inApp) return false;
    if (channel === 'EMAIL' && !preference.email) return false;
    if (channel === 'PUSH' && !preference.push) return false;
    if (channel === 'SMS' && !preference.sms) return false;

    // Check Do Not Disturb
    if (preference.dndEnabled && this.isDndActive(preference)) {
      return false;
    }

    return true;
  }

  /**
   * Check if Do Not Disturb is currently active
   */
  private isDndActive(preference: NotificationPreference): boolean {
    if (!preference.dndEnabled) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if current day is in DND days
    if (preference.dndDays && preference.dndDays.includes(currentDay)) {
      return true;
    }

    // Check if current time is in DND time range
    if (preference.dndStartTime && preference.dndEndTime) {
      if (preference.dndStartTime < preference.dndEndTime) {
        // Same day range (e.g., 14:00 - 18:00)
        return currentTime >= preference.dndStartTime && currentTime <= preference.dndEndTime;
      } else {
        // Overnight range (e.g., 22:00 - 08:00)
        return currentTime >= preference.dndStartTime || currentTime <= preference.dndEndTime;
      }
    }

    return false;
  }
}
