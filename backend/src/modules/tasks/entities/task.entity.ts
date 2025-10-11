import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum TaskType {
  ABSENCE_APPROVAL = 'ABSENCE_APPROVAL',
  SICKNESS_RTW = 'SICKNESS_RTW', // Return to work interview
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  TRAINING_ASSIGNMENT = 'TRAINING_ASSIGNMENT',
  ONBOARDING = 'ONBOARDING',
  OFFBOARDING = 'OFFBOARDING',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
  CHECKLIST = 'CHECKLIST',
  CUSTOM = 'CUSTOM',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Task Entity
 * Represents tasks/actions assigned to users (absence approvals, RTW interviews, etc.)
 */
@Entity('tasks')
@Index(['assigneeId', 'status'])
@Index(['type', 'status'])
@Index(['dueDate', 'status'])
export class Task extends BaseEntity {
  @Column()
  title: string; // "Approve Holiday Request", "Complete Return-to-Work Interview"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskType,
  })
  @Index()
  type: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @Index()
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  // Requester (who created the task)
  @Column({ nullable: true })
  @Index()
  requesterId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requesterId' })
  requester?: User;

  // Assignee (who needs to complete the task)
  @Column()
  @Index()
  assigneeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigneeId' })
  assignee?: User;

  // Related Entity (polymorphic reference)
  @Column({ nullable: true })
  relatedEntityType?: string; // AbsenceRequest, SicknessEpisode, Employee, etc.

  @Column({ nullable: true })
  relatedEntityId?: string;

  // Payload (context-specific data for the task)
  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any>;

  // Checklist (if task is checklist-based)
  @Column({ nullable: true })
  checklistId?: string;

  // Dates
  @Column({ type: 'timestamp', nullable: true })
  @Index()
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Completion
  @Column({ nullable: true })
  completedByUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completedByUserId' })
  completedBy?: User;

  @Column({ type: 'text', nullable: true })
  completionNotes?: string;

  // Recurrence (for recurring tasks)
  @Column({ default: false })
  isRecurring: boolean;

  @Column({ type: 'jsonb', nullable: true })
  recurrenceConfig?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
    interval: number; // Every N days/weeks/months
    endDate?: string;
  };

  // Visibility & Access
  @Column({ default: 'PRIVATE' })
  visibilityScope: string; // PRIVATE, TEAM, ORG

  @Column({ type: 'simple-array', nullable: true })
  visibleToUserIds?: string[]; // Specific users who can see this task

  // Notifications
  @Column({ default: false })
  hasNotified: boolean;

  @Column({ nullable: true })
  lastNotifiedAt?: Date;

  // Audit
  @Column({ nullable: true })
  createdByUserId?: string;

  @Column({ nullable: true })
  modifiedByUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
