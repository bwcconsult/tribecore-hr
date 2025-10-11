import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { EmailTemplateType } from './email-template.entity';

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
}

/**
 * EmailLog Entity
 * Tracks all emails sent by the system
 */
@Entity('email_logs')
@Index(['recipientEmail', 'status'])
@Index(['sentAt'])
export class EmailLog extends BaseEntity {
  @Column({ nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  recipientEmail: string;

  @Column({ nullable: true })
  recipientName?: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
  })
  @Index()
  templateType: EmailTemplateType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  htmlBody: string;

  @Column({ type: 'text' })
  textBody: string;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  @Index()
  status: EmailStatus;

  @Column({ nullable: true })
  sentAt?: Date;

  @Column({ nullable: true })
  openedAt?: Date;

  @Column({ nullable: true })
  clickedAt?: Date;

  @Column({ nullable: true })
  failedAt?: Date;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  externalId?: string; // ID from email provider (SendGrid, Mailgun, etc.)

  @Column({ type: 'simple-array', nullable: true })
  ccEmails?: string[];

  @Column({ type: 'simple-array', nullable: true })
  bccEmails?: string[];

  @Column({ type: 'jsonb', nullable: true })
  variables?: Record<string, any>; // Variables used to render template

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
