import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  ACCOMMODATION = 'ACCOMMODATION',
  TRANSPORTATION = 'TRANSPORTATION',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  SOFTWARE = 'SOFTWARE',
  TRAINING = 'TRAINING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  COMMUNICATION = 'COMMUNICATION',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER',
}

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  COMPANY_CARD = 'COMPANY_CARD',
}

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  organizationId: string;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column()
  merchant: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  exchangeRate?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amountInBaseCurrency?: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.DRAFT,
  })
  status: ExpenseStatus;

  @Column({ type: 'jsonb', nullable: true })
  receipts?: string[];

  @Column({ nullable: true })
  projectId?: string;

  @Column({ nullable: true })
  clientName?: string;

  @Column({ default: false })
  isBillable: boolean;

  @Column({ default: false })
  isReimbursable: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  reimbursableAmount?: number;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'date', nullable: true })
  paidDate?: Date;

  @Column({ nullable: true })
  paymentReference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];
}
