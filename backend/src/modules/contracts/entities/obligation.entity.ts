import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ObligationType {
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
  SLA = 'SLA', // Service Level Agreement
  AUDIT = 'AUDIT',
  NOTICE = 'NOTICE',
  DATA_RETURN = 'DATA_RETURN',
  ASSET_RETURN = 'ASSET_RETURN',
  REPORTING = 'REPORTING',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  RENEWAL_DECISION = 'RENEWAL_DECISION',
  INSURANCE = 'INSURANCE',
  CERTIFICATE = 'CERTIFICATE',
  MILESTONE = 'MILESTONE',
}

export enum ObligationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  AT_RISK = 'AT_RISK',
  WAIVED = 'WAIVED',
  DISPUTED = 'DISPUTED',
}

@Entity('obligations')
@Index(['contractId', 'status'])
@Index(['ownerId', 'dueDate'])
@Index(['type', 'status'])
export class Obligation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne('Contract', 'obligations')
  @JoinColumn({ name: 'contractId' })
  contract: any;

  @Column({
    type: 'enum',
    enum: ObligationType,
  })
  type: ObligationType;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ObligationStatus,
    default: ObligationStatus.PENDING,
  })
  status: ObligationStatus;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  ownerTeam: string; // LEGAL, FINANCE, IT, HR

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  // Financial obligations
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  poNumber: string; // Purchase Order

  // SLA/KPI obligations
  @Column({ nullable: true })
  kpiMetric: string; // e.g., "Response Time", "Uptime %"

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  kpiTarget: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  kpiActual: number;

  @Column({ default: false })
  kpiMet: boolean;

  // Recurrence
  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurrencePattern: string; // MONTHLY, QUARTERLY, ANNUALLY

  @Column({ nullable: true })
  nextOccurrence: string; // ISO date of next occurrence

  // Penalties & Credits
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  penaltyAmount: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  serviceCreditAmount: number;

  // Evidence & Documentation
  @Column('simple-array', { nullable: true })
  evidenceUrls: string[];

  @Column('text', { nullable: true })
  completionNotes: string;

  // Alerts
  @Column({ default: false })
  alertSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  alertSentAt: Date;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
