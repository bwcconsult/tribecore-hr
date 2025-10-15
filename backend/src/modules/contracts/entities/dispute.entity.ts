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

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  MEDIATION = 'MEDIATION',
  ARBITRATION = 'ARBITRATION',
  LITIGATION = 'LITIGATION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DisputeType {
  BREACH = 'BREACH',
  NON_PAYMENT = 'NON_PAYMENT',
  PERFORMANCE = 'PERFORMANCE',
  QUALITY = 'QUALITY',
  DELIVERY = 'DELIVERY',
  TERMINATION = 'TERMINATION',
  IP_INFRINGEMENT = 'IP_INFRINGEMENT',
  DATA_BREACH = 'DATA_BREACH',
  OTHER = 'OTHER',
}

@Entity('disputes')
@Index(['contractId', 'status'])
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne('Contract', 'disputes')
  @JoinColumn({ name: 'contractId' })
  contract: any;

  @Column({
    type: 'enum',
    enum: DisputeType,
  })
  type: DisputeType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Column()
  openedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'openedBy' })
  opener: User;

  @Column({ type: 'date', nullable: true })
  cureByDate: Date; // Deadline for resolution/cure

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  amountInDispute: number;

  @Column({ nullable: true })
  currency: string;

  @Column('simple-array', { nullable: true })
  evidenceUrls: string[]; // URLs to supporting documents

  @Column('text', { nullable: true })
  resolution: string;

  @Column({ nullable: true })
  resolvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolvedBy' })
  resolver: User;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  legalCounsel: string; // Assigned lawyer/firm

  @Column('simple-json', { nullable: true })
  timeline: Array<{ date: string; event: string; party: string }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
