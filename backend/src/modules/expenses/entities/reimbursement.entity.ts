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
import { PaymentMethod, ReimbursementStatus } from '../enums/payment-method.enum';

@Entity('expense_reimbursements')
export class Reimbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimId: string;

  @ManyToOne(() => ExpenseClaim, (claim) => claim.reimbursements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: ExpenseClaim;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'GBP', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ReimbursementStatus,
    default: ReimbursementStatus.PENDING,
  })
  status: ReimbursementStatus;

  @Column({ nullable: true })
  paymentReference: string; // Transaction ID, check number, etc.

  @Column({ nullable: true })
  batchNumber: string; // For batch processing

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  processedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processedBy' })
  processor: User;

  // Bank account details (if applicable)
  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankSortCode: string;

  @Column({ nullable: true })
  bankName: string;

  // Payroll integration
  @Column({ nullable: true })
  payrollPeriod: string; // e.g., "2025-01"

  @Column({ default: false })
  includedInPayroll: boolean;

  // Error handling
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
