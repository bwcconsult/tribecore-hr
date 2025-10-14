import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum WebhookEvent {
  EMPLOYEE_CREATED = 'employee.created',
  EMPLOYEE_UPDATED = 'employee.updated',
  EMPLOYEE_TERMINATED = 'employee.terminated',
  LEAVE_REQUESTED = 'leave.requested',
  LEAVE_APPROVED = 'leave.approved',
  PAYROLL_PROCESSED = 'payroll.processed',
  CASE_CREATED = 'case.created',
  POSITION_CREATED = 'position.created',
}

@Entity('webhooks')
export class Webhook extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column()
  webhookName: string;

  @Column()
  targetUrl: string;

  @Column({ type: 'simple-array' })
  events: WebhookEvent[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  secret?: string;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
