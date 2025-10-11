import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum EmailTemplateType {
  ABSENCE_REQUEST_SUBMITTED = 'ABSENCE_REQUEST_SUBMITTED',
  ABSENCE_REQUEST_APPROVED = 'ABSENCE_REQUEST_APPROVED',
  ABSENCE_REQUEST_REJECTED = 'ABSENCE_REQUEST_REJECTED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  WELCOME_EMAIL = 'WELCOME_EMAIL',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SICKNESS_RTW_INTERVIEW = 'SICKNESS_RTW_INTERVIEW',
  PAYROLL_RUN_COMPLETE = 'PAYROLL_RUN_COMPLETE',
}

/**
 * EmailTemplate Entity
 * Stores customizable email templates with variables
 */
@Entity('email_templates')
export class EmailTemplate extends BaseEntity {
  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    unique: true,
  })
  @Index()
  type: EmailTemplateType;

  @Column()
  name: string; // Human-readable name

  @Column()
  subject: string; // Email subject with {{variables}}

  @Column({ type: 'text' })
  htmlBody: string; // HTML email body with {{variables}}

  @Column({ type: 'text' })
  textBody: string; // Plain text fallback

  @Column({ type: 'jsonb', nullable: true })
  variables: {
    name: string;
    description: string;
    example: string;
  }[]; // Available variables for this template

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  fromName?: string; // Override default from name

  @Column({ nullable: true })
  fromEmail?: string; // Override default from email

  @Column({ type: 'simple-array', nullable: true })
  ccEmails?: string[]; // Always CC these emails

  @Column({ type: 'simple-array', nullable: true })
  bccEmails?: string[]; // Always BCC these emails

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
