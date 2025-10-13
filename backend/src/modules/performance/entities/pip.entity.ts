import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum PIPStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  EXTENDED = 'EXTENDED',
  CLOSED_SUCCESS = 'CLOSED_SUCCESS',
  CLOSED_UNSUCCESSFUL = 'CLOSED_UNSUCCESSFUL',
  CANCELED = 'CANCELED',
}

export enum PIPCadence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
}

@Entity('pips')
export class PIP extends BaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column()
  managerId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'managerId' })
  manager: Employee;

  @Column({ nullable: true })
  hrBusinessPartnerId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'hrBusinessPartnerId' })
  hrBusinessPartner: Employee;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  durationWeeks: number;

  @Column({
    type: 'enum',
    enum: PIPStatus,
    default: PIPStatus.DRAFT,
  })
  status: PIPStatus;

  @Column({
    type: 'enum',
    enum: PIPCadence,
    default: PIPCadence.WEEKLY,
  })
  checkInCadence: PIPCadence;

  @Column({ type: 'text' })
  performanceIssues: string; // What are the concerns?

  @Column({ type: 'jsonb' })
  goals: Array<{
    id: string;
    goal: string; // SMART goal
    successCriteria: string;
    dueDate: Date;
    weight: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_MET';
    progress: number;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  supportProvided: Array<{
    type: 'TRAINING' | 'COACHING' | 'MENTORING' | 'RESOURCES' | 'OTHER';
    description: string;
    provider?: string;
    completedAt?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  checkIns: Array<{
    date: Date;
    conductedBy: string;
    rating: 'BELOW' | 'MEETS' | 'EXCEEDS';
    notes: string;
    employeeComments?: string;
    actionItems?: string[];
  }>;

  @Column({ type: 'text', nullable: true })
  escalationProcess: string;

  @Column({ type: 'text', nullable: true })
  consequences: string; // What happens if unsuccessful

  @Column({ default: false })
  extensionRequested: boolean;

  @Column({ type: 'date', nullable: true })
  extensionEndDate: Date;

  @Column({ type: 'text', nullable: true })
  extensionReason: string;

  @Column({ nullable: true })
  approvedBy: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: Employee;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ type: 'text', nullable: true })
  outcomeJustification: string;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ default: false })
  employeeAcknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  employeeAcknowledgedAt: Date;

  @Column({ type: 'simple-array', nullable: true })
  documentUrls: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    relatedReviewCycleId?: string;
    previousPIPId?: string;
    legalReviewRequired?: boolean;
    legalReviewedBy?: string;
    legalReviewedAt?: Date;
  };
}
