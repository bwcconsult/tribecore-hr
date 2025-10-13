import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum ActionSourceType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  OBJECTIVE = 'OBJECTIVE',
  REVIEW = 'REVIEW',
  FEEDBACK = 'FEEDBACK',
  MANUAL = 'MANUAL',
}

export enum ActionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

@Entity('actions')
export class Action extends BaseEntity {
  @Column()
  ownerId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'ownerId' })
  owner: Employee;

  @Column({
    type: 'enum',
    enum: ActionSourceType,
  })
  sourceType: ActionSourceType;

  @Column({ nullable: true })
  sourceId: string; // ID of the source (OneOnOne, Objective, etc.)

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ActionStatus,
    default: ActionStatus.OPEN,
  })
  status: ActionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  assignedBy: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'assignedBy' })
  assigner: Employee;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  priority: number; // 1 (low) - 5 (high)

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    reminderSent?: boolean;
    escalated?: boolean;
    relatedActions?: string[];
  };
}
