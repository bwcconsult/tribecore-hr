import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

@Entity('onboarding_workflows')
export class OnboardingWorkflow extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  organizationId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  completionDate?: Date;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.NOT_STARTED,
  })
  status: OnboardingStatus;

  @Column({ type: 'jsonb' })
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    assignedTo?: string;
    dueDate?: Date;
    status: TaskStatus;
    completedAt?: Date;
    completedBy?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    documents?: string[];
  }>;

  @Column({ type: 'int', default: 0 })
  completedTasksCount: number;

  @Column({ type: 'int' })
  totalTasksCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ nullable: true })
  assignedBuddyId?: string;

  @Column({ type: 'jsonb', nullable: true })
  feedback?: {
    rating?: number;
    comments?: string;
    submittedAt?: Date;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
