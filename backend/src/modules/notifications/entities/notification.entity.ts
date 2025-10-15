import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NotificationType {
  // System & Core
  SYSTEM = 'SYSTEM',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  SECURITY = 'SECURITY',
  
  // HR Core
  EMPLOYEE = 'EMPLOYEE',
  ONBOARDING = 'ONBOARDING',
  OFFBOARDING = 'OFFBOARDING',
  
  // Time & Attendance
  ATTENDANCE = 'ATTENDANCE',
  LEAVE = 'LEAVE',
  OVERTIME = 'OVERTIME',
  SHIFT = 'SHIFT',
  TIMESHEET = 'TIMESHEET',
  
  // Payroll & Compensation
  PAYROLL = 'PAYROLL',
  EXPENSE = 'EXPENSE',
  BENEFIT = 'BENEFIT',
  COMPENSATION = 'COMPENSATION',
  
  // Performance & Learning
  PERFORMANCE = 'PERFORMANCE',
  RECOGNITION = 'RECOGNITION',
  LEARNING = 'LEARNING',
  GOAL = 'GOAL',
  
  // Recruitment & Talent
  RECRUITMENT = 'RECRUITMENT',
  APPLICANT = 'APPLICANT',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  
  // Contract & Legal
  CONTRACT = 'CONTRACT',
  CONTRACT_APPROVAL = 'CONTRACT_APPROVAL',
  CONTRACT_RENEWAL = 'CONTRACT_RENEWAL',
  CONTRACT_EXPIRY = 'CONTRACT_EXPIRY',
  OBLIGATION = 'OBLIGATION',
  
  // Documents & Compliance
  DOCUMENT = 'DOCUMENT',
  ESIGNATURE = 'ESIGNATURE',
  COMPLIANCE = 'COMPLIANCE',
  AUDIT = 'AUDIT',
  
  // IAM & Security
  IAM = 'IAM',
  DELEGATION = 'DELEGATION',
  ACCESS_REQUEST = 'ACCESS_REQUEST',
  ROLE_CHANGE = 'ROLE_CHANGE',
  
  // Other
  TASK = 'TASK',
  APPROVAL = 'APPROVAL',
  REMINDER = 'REMINDER',
  ALERT = 'ALERT',
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

  @Column({ nullable: true })
  relatedEntityType?: string; // e.g., 'contract', 'leave_request', 'payslip'

  @Column({ default: false })
  emailSent: boolean;

  @Column({ default: false })
  pushSent: boolean;

  @Column({ nullable: true })
  senderId?: string; // Who triggered the notification

  @Column({ nullable: true })
  senderName?: string;

  @Column({ nullable: true })
  actionUrl?: string; // Primary action button URL

  @Column({ nullable: true })
  actionLabel?: string; // Primary action button label

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>; // Additional contextual data

  @Column({ nullable: true })
  icon?: string; // Icon identifier for frontend

  @Column({ nullable: true })
  category?: string; // For grouping notifications
}
