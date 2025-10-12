import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum TaskCategory {
  HR = 'HR',
  IT = 'IT',
  FINANCE = 'FINANCE',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  LEGAL = 'LEGAL',
}

@Entity('offboarding_tasks')
export class OffboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  offboardingProcessId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskCategory,
  })
  category: TaskCategory;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  completedBy: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
