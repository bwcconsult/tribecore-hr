import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdviceRequestStatus {
  SUBMITTED = 'SUBMITTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESPONDED = 'RESPONDED',
  CLOSED = 'CLOSED',
}

export enum AdviceRequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('legal_advice_requests')
export class LegalAdviceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  requestNumber: string;

  @Column()
  requestedBy: string;

  @Column()
  category: string; // e.g., 'Employment Law', 'HR Policy', 'Disciplinary', 'Dismissal'

  @Column()
  subject: string;

  @Column({ type: 'text' })
  question: string;

  @Column({
    type: 'enum',
    enum: AdviceRequestPriority,
    default: AdviceRequestPriority.MEDIUM,
  })
  priority: AdviceRequestPriority;

  @Column({
    type: 'enum',
    enum: AdviceRequestStatus,
    default: AdviceRequestStatus.SUBMITTED,
  })
  status: AdviceRequestStatus;

  @Column({ nullable: true })
  assignedTo: string; // Legal advisor ID

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ nullable: true })
  respondedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'jsonb', nullable: true })
  followUpQuestions: Array<{
    question: string;
    askedBy: string;
    askedAt: Date;
    answer?: string;
    answeredBy?: string;
    answeredAt?: Date;
  }>;

  @Column({ default: false })
  requires24x7Support: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
