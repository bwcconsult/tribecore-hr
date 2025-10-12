import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaxCode } from './tax-code.entity';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  uniqueCode: string; // e.g., "MEALS_CLIENT", "AIRFARE"

  @Column({ nullable: true })
  glCode: string; // General Ledger code

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  requiresReceipt: boolean;

  @Column({ nullable: true })
  taxCodeId: string;

  @ManyToOne(() => TaxCode, { nullable: true })
  @JoinColumn({ name: 'taxCodeId' })
  taxCode: TaxCode;

  @Column({ default: false })
  perDiemAllowed: boolean;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  limitPerDay: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  limitPerTxn: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  limitPerTrip: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
