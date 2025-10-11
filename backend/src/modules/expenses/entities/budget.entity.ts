import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('expense_budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  ownerId: string; // Budget owner/manager

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  allocatedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  committedAmount: number; // Approved but not yet paid

  @Column({ default: 'GBP', length: 3 })
  currency: string;

  // Alerts
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80 })
  warningThreshold: number; // % of budget

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  blockThreshold: number; // % of budget (prevent new expenses)

  @Column({ default: false })
  enforceLimit: boolean; // Block expenses when limit reached

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
