import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DataRequestType {
  SUBJECT_ACCESS = 'SUBJECT_ACCESS',
  RECTIFICATION = 'RECTIFICATION',
  ERASURE = 'ERASURE',
  RESTRICTION = 'RESTRICTION',
  PORTABILITY = 'PORTABILITY',
  OBJECTION = 'OBJECTION',
}

export enum DataBreachSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ComplianceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

@Entity('gdpr_data_requests')
export class GDPRDataRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  requestNumber: string;

  @Column()
  employeeId: string;

  @Column({
    type: 'enum',
    enum: DataRequestType,
  })
  requestType: DataRequestType;

  @Column({ type: 'date' })
  requestDate: Date;

  @Column({ type: 'date' })
  dueDate: Date; // 30 days from request

  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.PENDING,
  })
  status: ComplianceStatus;

  @Column({ type: 'text' })
  requestDetails: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'text', nullable: true })
  responseDetails: string;

  @Column({ type: 'simple-array', nullable: true })
  dataProvided: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('gdpr_data_breaches')
export class GDPRDataBreach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  breachNumber: string;

  @Column({ type: 'date' })
  breachDate: Date;

  @Column({ type: 'date' })
  discoveryDate: Date;

  @Column({
    type: 'enum',
    enum: DataBreachSeverity,
  })
  severity: DataBreachSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  affectedEmployees: string[];

  @Column({ type: 'int' })
  numberOfIndividualsAffected: number;

  @Column({ type: 'text' })
  dataCategories: string;

  @Column({ type: 'text' })
  likelyConsequences: string;

  @Column({ type: 'text' })
  measuresTaken: string;

  @Column({ default: false })
  reportedToICO: boolean;

  @Column({ type: 'date', nullable: true })
  icoReportDate: Date;

  @Column({ type: 'text', nullable: true })
  icoReferenceNumber: string;

  @Column({ default: false })
  individualsNotified: boolean;

  @Column({ type: 'date', nullable: true })
  notificationDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    date: Date;
    event: string;
    description: string;
  }>;

  @Column({ nullable: true })
  dpoAssigned: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
