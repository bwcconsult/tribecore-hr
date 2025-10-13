import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ResponsibilityStatus {
  ASSIGNED = 'ASSIGNED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

@Entity('hs_responsibilities')
export class HSResponsibility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  assignedTo: string;

  @Column()
  assignedBy: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string; // e.g., 'Fire Safety', 'First Aid', 'PPE', 'Risk Assessment'

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({
    type: 'enum',
    enum: ResponsibilityStatus,
    default: ResponsibilityStatus.ASSIGNED,
  })
  status: ResponsibilityStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  evidenceDocuments: string[];

  @Column({ default: false })
  requiresTraining: boolean;

  @Column({ type: 'simple-array', nullable: true })
  trainingCourses: string[];

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurrencePattern: string; // e.g., 'MONTHLY', 'QUARTERLY', 'ANNUALLY'

  @Column({ type: 'date', nullable: true })
  nextRecurrenceDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  checklistItems: Array<{
    item: string;
    completed: boolean;
    completedDate?: Date;
    notes?: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
