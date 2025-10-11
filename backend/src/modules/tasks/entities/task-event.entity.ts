import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

export enum TaskEventType {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  REASSIGNED = 'REASSIGNED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  COMMENTED = 'COMMENTED',
  DUE_DATE_CHANGED = 'DUE_DATE_CHANGED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  STATUS_CHANGED = 'STATUS_CHANGED',
}

/**
 * TaskEvent Entity
 * Immutable audit trail for all task state changes
 */
@Entity('task_events')
@Index(['taskId', 'createdAt'])
@Index(['actorId', 'eventType'])
export class TaskEvent extends BaseEntity {
  @Column()
  @Index()
  taskId: string;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'taskId' })
  task?: Task;

  @Column({
    type: 'enum',
    enum: TaskEventType,
  })
  @Index()
  eventType: TaskEventType;

  @Column()
  @Index()
  actorId: string; // User who performed the action

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actorId' })
  actor?: User;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  // State changes (before/after)
  @Column({ type: 'jsonb', nullable: true })
  previousState?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newState?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp' })
  @Index()
  eventTimestamp: Date;
}
