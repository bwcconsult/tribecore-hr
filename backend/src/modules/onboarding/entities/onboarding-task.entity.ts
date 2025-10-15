import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardCase } from './onboard-case.entity';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

@Entity('onboarding_tasks')
export class OnboardingTask extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  caseId: string;

  @ManyToOne(() => OnboardCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: OnboardCase;

  @Column()
  type: string; // Task category/type

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  assigneeRole: string; // HR_ADMIN, IT_ADMIN, MANAGER, etc.

  @Column({ nullable: true })
  assigneeId: string; // Specific user if assigned

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'jsonb', default: [] })
  dependencies: string[]; // Task IDs that must be completed first

  @Column({ type: 'int', nullable: true })
  slaHours: number;

  @Column({ type: 'int', default: 0 })
  noteCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedBy: string;

  @Column({ type: 'text', nullable: true })
  blockReason: string; // If status is BLOCKED

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    priority?: string;
    estimatedHours?: number;
    [key: string]: any;
  };
}
