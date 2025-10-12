import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ApprovalDecision {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
}

@Entity('expense_approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimId: string;

  @ManyToOne('ExpenseClaim', 'approvals', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: any;

  @Column()
  approverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approverId' })
  approver: User;

  @Column({
    type: 'enum',
    enum: ApprovalDecision,
    default: ApprovalDecision.PENDING,
  })
  decision: ApprovalDecision;

  @Column('timestamp', { nullable: true })
  decidedAt: Date;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column('int', { default: 1 })
  level: number; // 1 = Manager, 2 = Finance, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
