import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { NotificationType } from './notification.entity';

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

@Entity('notification_preferences')
@Index(['userId', 'type'])
export class NotificationPreference extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  // Channel preferences
  @Column({ default: true })
  inApp: boolean;

  @Column({ default: true })
  email: boolean;

  @Column({ default: false })
  push: boolean;

  @Column({ default: false })
  sms: boolean;

  // Frequency settings
  @Column({ default: 'INSTANT' }) // INSTANT, HOURLY, DAILY, WEEKLY
  frequency: string;

  // Do Not Disturb settings
  @Column({ default: false })
  dndEnabled: boolean;

  @Column({ nullable: true })
  dndStartTime?: string; // e.g., "22:00"

  @Column({ nullable: true })
  dndEndTime?: string; // e.g., "08:00"

  @Column('simple-array', { nullable: true })
  dndDays?: string[]; // ['SATURDAY', 'SUNDAY']

  // Priority filter
  @Column({ nullable: true })
  minPriority?: string; // Only receive notifications above this priority

  @Column('simple-json', { nullable: true })
  customSettings?: Record<string, any>;
}
