import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TrainingActivityType {
  COURSE = 'COURSE',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  WEBINAR = 'WEBINAR',
  CONFERENCE = 'CONFERENCE',
  ON_THE_JOB = 'ON_THE_JOB',
  MENTORING = 'MENTORING',
  SELF_STUDY = 'SELF_STUDY',
  OTHER = 'OTHER',
}

export enum TrainingStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

@Entity('training_activities')
@Index(['personId', 'status'])
@Index(['dueAt'])
export class TrainingActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column({
    type: 'enum',
    enum: TrainingActivityType,
    default: TrainingActivityType.COURSE,
  })
  type: TrainingActivityType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  provider: string;

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.PLANNED,
  })
  @Index()
  status: TrainingStatus;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  dueAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cpdHours: number; // Continuing Professional Development hours

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  cost: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  evidenceUrl: string; // Certificate or proof of completion

  @Column({ nullable: true })
  assignedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Overdue tracking
  @Column({ default: false })
  isOverdue: boolean;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('development_plans')
@Index(['personId'])
export class DevelopmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({ nullable: true })
  mentorId: string;

  @Column({ type: 'jsonb', nullable: true })
  goals: {
    goal: string;
    targetDate?: Date;
    status?: string;
    notes?: string;
  }[];

  @Column({ type: 'int', default: 0 })
  progressPercentage: number;

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.PLANNED,
  })
  status: TrainingStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('development_needs')
@Index(['personId', 'priority'])
export class DevelopmentNeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column()
  skillGap: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  targetRole: string;

  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  })
  @Index()
  priority: string;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({ nullable: true })
  suggestedTraining: string;

  @Column({ default: false })
  isAddressed: boolean;

  @Column({ nullable: true })
  linkedActivityId: string;

  @Column({ nullable: true })
  identifiedBy: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
