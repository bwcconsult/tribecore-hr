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
import { ExpenseType } from '../enums/expense-types.enum';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ExpenseType,
    default: ExpenseType.OTHER,
  })
  type: ExpenseType;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => ExpenseCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: ExpenseCategory;

  @OneToMany(() => ExpenseCategory, (category) => category.parent)
  children: ExpenseCategory[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  requiresReceipt: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultMaxAmount: number;

  @Column({ nullable: true })
  glCode: string; // General Ledger code for accounting integration

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
