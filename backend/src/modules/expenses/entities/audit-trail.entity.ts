import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExpenseClaim } from './expense-claim.entity';
import { User } from '../../users/entities/user.entity';

@Entity('expense_audit_trail')
export class AuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  claimId: string;

  @ManyToOne(() => ExpenseClaim, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'claimId' })
  claim: ExpenseClaim;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  action: string; // e.g., 'CREATED', 'UPDATED', 'SUBMITTED', 'APPROVED', 'REJECTED'

  @Column()
  entity: string; // e.g., 'ExpenseClaim', 'ExpenseItem', 'Approval'

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  timestamp: Date;
}
