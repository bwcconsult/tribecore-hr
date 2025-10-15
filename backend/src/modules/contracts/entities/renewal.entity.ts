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

export enum RenewalDecision {
  PENDING = 'PENDING',
  RENEW = 'RENEW',
  RENEGOTIATE = 'RENEGOTIATE',
  TERMINATE = 'TERMINATE',
  AUTO_RENEWED = 'AUTO_RENEWED',
}

export enum RenewalStatus {
  NOT_DUE = 'NOT_DUE',
  DUE_180_DAYS = 'DUE_180_DAYS',
  DUE_90_DAYS = 'DUE_90_DAYS',
  DUE_60_DAYS = 'DUE_60_DAYS',
  DUE_30_DAYS = 'DUE_30_DAYS',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
}

@Entity('renewals')
@Index(['contractId'])
@Index(['renewalDate'])
export class Renewal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne('Contract', 'renewals')
  @JoinColumn({ name: 'contractId' })
  contract: any;

  @Column({ type: 'date' })
  renewalDate: Date; // Date when renewal is due

  @Column({ type: 'date' })
  noticeByDate: Date; // Deadline to give notice of intent

  @Column({
    type: 'enum',
    enum: RenewalStatus,
    default: RenewalStatus.NOT_DUE,
  })
  status: RenewalStatus;

  @Column({
    type: 'enum',
    enum: RenewalDecision,
    default: RenewalDecision.PENDING,
  })
  decision: RenewalDecision;

  @Column({ nullable: true })
  decidedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'decidedBy' })
  decider: User;

  @Column({ type: 'timestamp', nullable: true })
  decidedAt: Date;

  @Column('text', { nullable: true })
  decisionReason: string;

  // Performance Analysis
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  performanceScore: number; // 0-100

  @Column('simple-json', { nullable: true })
  performanceMetrics: Record<string, any>;

  @Column('text', { nullable: true })
  performanceNotes: string;

  // Proposed Terms for Renewal
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  proposedValue: number;

  @Column({ nullable: true })
  proposedCurrency: string;

  @Column({ nullable: true })
  proposedTerm: string; // e.g., "12 months", "2 years"

  @Column('simple-json', { nullable: true })
  proposedTerms: Record<string, any>; // JSON of proposed changes

  // Negotiation
  @Column({ nullable: true })
  newContractId: string; // Link to renewed contract

  @Column({ default: false })
  alertsSent: boolean;

  @Column('simple-array', { nullable: true })
  alertDates: string[]; // Dates when alerts were sent

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
