import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PolicyRuleType, PolicyScope } from '../enums/expense-types.enum';

@Entity('expense_policy_rules')
export class PolicyRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PolicyRuleType,
  })
  ruleType: PolicyRuleType;

  @Column({
    type: 'enum',
    enum: PolicyScope,
    default: PolicyScope.GLOBAL,
  })
  scope: PolicyScope;

  // Scope identifiers
  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  roleId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  categoryId: string;

  // Rule threshold
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  threshold: number;

  @Column({ nullable: true, length: 3 })
  currency: string;

  // Approval configuration
  @Column({ type: 'jsonb', nullable: true })
  approvalLevels: Array<{
    level: number;
    role: string;
    minAmount?: number;
    maxAmount?: number;
  }>;

  // Receipt requirements
  @Column({ default: false })
  requiresReceipt: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  receiptThreshold: number;

  // Time constraints
  @Column({ type: 'int', nullable: true })
  daysToSubmit: number; // Max days after expense to submit

  @Column({ type: 'int', nullable: true })
  daysToApprove: number; // Max days for approval

  // Rule conditions (JSON)
  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    minAmount?: number;
    maxAmount?: number;
    allowedVendors?: string[];
    blockedVendors?: string[];
    requiresJustification?: boolean;
    maxPerDay?: number;
    maxPerMonth?: number;
    maxPerYear?: number;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number; // Higher priority rules checked first

  @Column({ type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
