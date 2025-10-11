import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AbsencePlan } from './absence-plan.entity';

export enum AbsenceRequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum PartialDayType {
  MORNING = 'MORNING', // First half of day
  AFTERNOON = 'AFTERNOON', // Second half of day
  CUSTOM_HOURS = 'CUSTOM_HOURS', // Specific hours
}

/**
 * AbsenceRequest Entity
 * Core entity for absence request/approval workflow
 */
@Entity('absence_requests')
@Index(['userId', 'status'])
@Index(['planId', 'status'])
@Index(['startDate', 'endDate'])
export class AbsenceRequest extends BaseEntity {
  // Requester
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Absence Plan
  @Column()
  @Index()
  planId: string;

  @ManyToOne(() => AbsencePlan)
  @JoinColumn({ name: 'planId' })
  plan?: AbsencePlan;

  // Date Range
  @Column({ type: 'date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date' })
  @Index()
  endDate: Date;

  // Partial Day Configuration
  @Column({ default: false })
  isPartialDay: boolean;

  @Column({
    type: 'enum',
    enum: PartialDayType,
    nullable: true,
  })
  partialDayType?: PartialDayType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hours?: number; // For hour-based absence or custom hours

  // Calculated Days (accounting for partial days, weekends, public holidays)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calculatedDays: number;

  // Status & Workflow
  @Column({
    type: 'enum',
    enum: AbsenceRequestStatus,
    default: AbsenceRequestStatus.PENDING,
  })
  @Index()
  status: AbsenceRequestStatus;

  // Approval Chain
  @Column({ type: 'jsonb', nullable: true })
  approvalChain?: {
    sequence: number;
    approverId: string;
    role: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    actionAt?: string;
    comment?: string;
  }[];

  @Column({ nullable: true })
  currentApproverId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'currentApproverId' })
  currentApprover?: User;

  // Reason & Notes
  @Column({ nullable: true })
  reasonCode?: string; // Predefined codes: VACATION, SICK, FAMILY_EMERGENCY, etc.

  @Column({ type: 'text', nullable: true })
  notes?: string; // Employee's request message

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string; // Manager's rejection message

  // Attachments (e.g., medical certificates)
  @Column({ type: 'simple-array', nullable: true })
  attachmentIds?: string[];

  // Conflict Detection
  @Column({ default: false })
  hasConflicts: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conflicts?: {
    type: 'OVERLAP' | 'EXCEEDS_BALANCE' | 'BLACKOUT_PERIOD' | 'PUBLIC_HOLIDAY';
    message: string;
    canOverride: boolean;
  }[];

  // Balance Impact
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  balanceBeforeRequest?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  balanceAfterRequest?: number;

  // Timestamps
  @Column({ nullable: true })
  submittedAt?: Date;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  rejectedAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  // Audit
  @Column({ nullable: true })
  createdByUserId?: string;

  @Column({ nullable: true })
  modifiedByUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
