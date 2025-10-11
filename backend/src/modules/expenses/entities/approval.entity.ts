import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExpenseClaim } from './expense-claim.entity';
import { User } from '../../users/entities/user.entity';
import { ApprovalStatus } from '../enums/approval-status.enum';

@Entity('expense_approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimId: string;

  @ManyToOne(() => ExpenseClaim, (claim) => claim.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: ExpenseClaim;

  @Column()
  approverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approverId' })
  approver: User;

  @Column({ type: 'int' })
  level: number; // 1 = Manager, 2 = Finance, 3 = Director, etc.

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  // Delegation support
  @Column({ nullable: true })
  delegatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'delegatedBy' })
  delegator: User;

  @Column({ type: 'timestamp', nullable: true })
  delegatedAt: Date;

  // Override support (for policy violations)
  @Column({ default: false })
  isOverride: boolean;

  @Column({ type: 'text', nullable: true })
  overrideJustification: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
