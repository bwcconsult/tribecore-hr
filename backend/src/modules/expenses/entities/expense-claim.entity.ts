import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { Approval } from './approval.entity';
import { Reimbursement } from './reimbursement.entity';

@Entity('expense_claims')
export class ExpenseClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  claimNumber: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'GBP', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.DRAFT,
  })
  status: ExpenseStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Policy violation flags
  @Column({ default: false })
  hasPolicyViolations: boolean;

  @Column({ type: 'jsonb', nullable: true })
  policyViolations: Array<{
    rule: string;
    message: string;
    severity: string;
  }>;

  @OneToMany('ExpenseItem', 'claim', { cascade: true })
  items: any[];

  @OneToMany(() => Approval, (approval) => approval.claim, { cascade: true })
  approvals: Approval[];

  @OneToMany(() => Reimbursement, (reimbursement) => reimbursement.claim)
  reimbursements: Reimbursement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateClaimNumber() {
    if (!this.claimNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.claimNumber = `EXP-${timestamp}-${random}`;
    }
  }
}
