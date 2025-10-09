import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  PAYROLL = 'PAYROLL',
  LEAVE = 'LEAVE',
  ATTENDANCE = 'ATTENDANCE',
  PERFORMANCE = 'PERFORMANCE',
  DOCUMENT = 'DOCUMENT',
  BENEFIT = 'BENEFIT',
  EXPENSE = 'EXPENSE',
  TIMESHEET = 'TIMESHEET',
  ONBOARDING = 'ONBOARDING',
  RECRUITMENT = 'RECRUITMENT',
  LEARNING = 'LEARNING',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  recipientId: string;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  linkUrl?: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  relatedEntityId?: string;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ default: false })
  pushSent: boolean;
}
