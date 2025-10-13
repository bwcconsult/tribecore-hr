import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Objective } from './objective.entity';

@Entity('objective_milestones')
export class ObjectiveMilestone extends BaseEntity {
  @Column()
  objectiveId: string;

  @ManyToOne(() => Objective, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectiveId' })
  objective: Objective;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  acceptanceCriteria: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number; // Percentage of objective (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 0-100%

  @Column({ type: 'simple-array', nullable: true })
  evidenceUrls: string[];

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;
}
