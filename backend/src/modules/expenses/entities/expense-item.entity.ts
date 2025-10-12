import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExpenseCategory } from './expense-category.entity';
import { TaxCode } from './tax-code.entity';
import { Currency } from './currency.entity';

@Entity('expense_items')
export class ExpenseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  claimId: string;

  @ManyToOne('ExpenseClaim', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: any;

  @Column()
  categoryId: string;

  @ManyToOne(() => ExpenseCategory)
  @JoinColumn({ name: 'categoryId' })
  category: ExpenseCategory;

  @Column('date')
  txnDate: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'GBP', length: 3 })
  currencyCode: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyCode' })
  currency: Currency;

  @Column({ nullable: true })
  merchant: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  taxCodeId: string;

  @ManyToOne(() => TaxCode, { nullable: true })
  @JoinColumn({ name: 'taxCodeId' })
  taxCode: TaxCode;

  @Column({ nullable: true })
  receiptUrl: string; // S3 presigned URL or path

  // Mileage specific
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  distanceKm: number;

  @Column({ default: false })
  perDiem: boolean;

  // Project allocation
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  projectSplitPct: number; // Optional % split to project

  @Column({ nullable: true })
  glCodeOverride: string; // Override category GL code

  // Policy flags
  @Column({ type: 'jsonb', nullable: true })
  policyFlags: {
    overLimit?: boolean;
    missingReceipt?: boolean;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
