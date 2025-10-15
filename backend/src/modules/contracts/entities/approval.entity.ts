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
import { Contract } from './contract.entity';
import { User } from '../../users/entities/user.entity';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
}

export enum ApproverRole {
  LEGAL = 'LEGAL',
  FINANCE = 'FINANCE',
  HR = 'HR',
  CISO = 'CISO', // Chief Information Security Officer
  DPO = 'DPO', // Data Protection Officer
  CFO = 'CFO',
  CEO = 'CEO',
  MANAGER = 'MANAGER',
  VP = 'VP',
  GENERAL_COUNSEL = 'GENERAL_COUNSEL',
}

@Entity('approvals')
@Index(['contractId', 'status'])
@Index(['approverId', 'status'])
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne(() => Contract, (contract) => contract.approvals)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ type: 'int' })
  step: number; // Order in approval chain

  @Column({
    type: 'enum',
    enum: ApproverRole,
  })
  role: ApproverRole;

  @Column()
  approverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approverId' })
  approver: User;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column('text', { nullable: true })
  comment: string;

  @Column({ type: 'timestamp', nullable: true })
  decidedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueAt: Date; // SLA for this approval

  @Column({ default: false })
  isRequired: boolean; // Some approvals may be optional

  @Column({ nullable: true })
  delegatedTo: string; // If approver delegated to someone else

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
