import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExpenseClaim } from './expense-claim.entity';
import { ExpenseCategory } from './expense-category.entity';
import { Receipt } from './receipt.entity';

@Entity('expense_items')
export class ExpenseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimId: string;

  @ManyToOne(() => ExpenseClaim, (claim) => claim.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: ExpenseClaim;

  @Column()
  categoryId: string;

  @ManyToOne(() => ExpenseCategory)
  @JoinColumn({ name: 'categoryId' })
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'GBP', length: 3 })
  currency: string;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({ nullable: true })
  vendor: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  departmentId: string;

  // Mileage specific fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mileageDistance: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  mileageRate: number;

  @Column({ nullable: true })
  startLocation: string;

  @Column({ nullable: true })
  endLocation: string;

  // Receipt requirement
  @Column({ default: true })
  receiptRequired: boolean;

  @Column({ default: false })
  receiptAttached: boolean;

  // Tax fields
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxRate: number;

  @Column({ default: false })
  isBillable: boolean; // Can be billed to client

  @Column({ nullable: true })
  clientId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Receipt, (receipt) => receipt.expenseItem, { cascade: true })
  receipts: Receipt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
