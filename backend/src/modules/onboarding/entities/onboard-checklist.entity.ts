import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardCase } from './onboard-case.entity';

export enum ChecklistStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('onboard_checklists')
export class OnboardChecklist extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => OnboardCase)
  @JoinColumn({ name: 'caseId' })
  case: OnboardCase;

  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string; // HR, IT, Facilities, Manager, etc.

  @Column({ nullable: true })
  ownerId: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ChecklistStatus,
    default: ChecklistStatus.NOT_STARTED,
  })
  status: ChecklistStatus;

  @Column({ type: 'jsonb', default: [] })
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    completedAt?: Date;
    completedBy?: string;
    order: number;
  }>;

  @Column({ type: 'int', default: 0 })
  totalTasks: number;

  @Column({ type: 'int', default: 0 })
  completedTasks: number;

  getCompletionPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }
}
