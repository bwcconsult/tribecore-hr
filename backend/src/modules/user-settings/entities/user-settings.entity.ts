import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationDelivery {
  INSTANT = 'INSTANT',
  DAILY_DIGEST = 'DAILY_DIGEST',
  WEEKLY_DIGEST = 'WEEKLY_DIGEST',
  OFF = 'OFF',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

@Entity('user_settings')
@Index(['userId'])
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  // Localization
  @Column({ default: 'en' })
  language: string; // ISO 639-1 code

  @Column({ default: 'en' })
  picklistLanguage: string;

  @Column({ default: 'en-GB' })
  formattingStyle: string; // Locale for date/number formatting

  @Column({ default: 'GB' })
  country: string; // ISO 3166-1 alpha-2

  @Column({ default: 'Europe/London' })
  timezone: string; // IANA timezone

  // Display preferences
  @Column({ default: 'light' })
  theme: string; // 'light' | 'dark' | 'auto'

  @Column({ default: 'en-GB' })
  dateFormat: string;

  @Column({ default: '24' })
  timeFormat: string; // '12' | '24'

  @Column({ default: 'GBP' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('notification_preferences')
@Index(['userId'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationDelivery,
    default: NotificationDelivery.INSTANT,
  })
  delivery: NotificationDelivery;

  @Column({ type: 'time', default: '09:00:00' })
  digestTime: string; // Time for daily digest

  @Column({ type: 'int', default: 1 })
  digestDayOfWeek: number; // 1-7 for weekly digest (Monday = 1)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('notification_subscriptions')
@Index(['userId', 'key'])
export class NotificationSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  key: string; // e.g., 'absence_request_pending'

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.EMAIL,
  })
  channel: NotificationChannel;

  @Column({ nullable: true })
  roleContext: string; // 'EMPLOYEE' | 'SUPERVISOR' | 'HR' | 'ADMIN'

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('notification_queue')
@Index(['userId', 'status'])
@Index(['scheduledFor'])
export class NotificationQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  subscriptionKey: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.EMAIL,
  })
  channel: NotificationChannel;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING',
  })
  @Index()
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  scheduledFor: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
