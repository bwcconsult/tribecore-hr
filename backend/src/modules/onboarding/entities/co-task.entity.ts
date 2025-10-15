import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Workstream } from './workstream.entity';

export enum COTaskOwnerTeam {
  CSM = 'CSM',
  SOLUTIONS = 'Solutions',
  SECURITY = 'Security',
  FINANCE = 'Finance',
  CLIENT = 'Client',
}

export enum COTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

@Entity('co_tasks')
export class COTask extends BaseEntity {
  @Column()
  workstreamId: string;

  @ManyToOne(() => Workstream, workstream => workstream.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workstreamId' })
  workstream: Workstream;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: COTaskOwnerTeam,
  })
  ownerTeam: COTaskOwnerTeam;

  @Column({ nullable: true })
  assigneeId: string; // Specific user ID

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: COTaskStatus,
    default: COTaskStatus.PENDING,
  })
  status: COTaskStatus;

  @Column({ type: 'jsonb', default: [] })
  dependencies: string[]; // Task IDs

  @Column({ type: 'int', nullable: true })
  slaHours: number;

  @Column({ type: 'int', default: 0 })
  noteCount: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedBy: string;

  @Column({ type: 'text', nullable: true })
  blockReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    priority?: string;
    category?: string;
    estimatedHours?: number;
    [key: string]: any;
  };
}
