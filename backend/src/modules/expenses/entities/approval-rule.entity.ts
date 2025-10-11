import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApprovalRuleType {
  AMOUNT_THRESHOLD = 'AMOUNT_THRESHOLD',
  CATEGORY = 'CATEGORY',
  DEPARTMENT = 'DEPARTMENT',
  EMPLOYEE_LEVEL = 'EMPLOYEE_LEVEL',
  PROJECT = 'PROJECT',
  CUSTOM = 'CUSTOM',
}

export enum ApprovalAction {
  AUTO_APPROVE = 'AUTO_APPROVE',
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
  REQUIRE_MULTI_LEVEL = 'REQUIRE_MULTI_LEVEL',
  ESCALATE = 'ESCALATE',
  REJECT = 'REJECT',
}

@Entity('approval_rules')
@Index(['priority'])
export class ApprovalRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ApprovalRuleType,
  })
  type: ApprovalRuleType;

  @Column({
    type: 'enum',
    enum: ApprovalAction,
  })
  action: ApprovalAction;

  @Column('int', { default: 0 })
  priority: number; // Lower number = higher priority

  @Column({ default: true })
  isActive: boolean;

  // Condition configuration (JSON)
  @Column('jsonb')
  conditions: {
    // Amount conditions
    minAmount?: number;
    maxAmount?: number;
    currency?: string;

    // Category conditions
    categoryIds?: string[];
    categoryTypes?: string[];

    // Department conditions
    departmentIds?: string[];

    // Employee conditions
    employeeLevels?: string[];
    employeeIds?: string[];

    // Project conditions
    projectIds?: string[];

    // Custom conditions (JavaScript-like expressions)
    customCondition?: string;

    // Logical operators
    operator?: 'AND' | 'OR';
  };

  // Approval configuration (JSON)
  @Column('jsonb')
  approvalConfig: {
    // Auto-approve settings
    autoApprove?: boolean;
    autoApproveReason?: string;

    // Approval levels
    requiredLevels?: number;
    approverRoles?: string[]; // e.g., ['MANAGER', 'FINANCE', 'HR_MANAGER']
    
    // Specific approvers
    approverIds?: string[];
    approverDepartments?: string[];

    // Escalation settings
    escalateAfterHours?: number;
    escalateTo?: string[]; // User IDs or roles

    // Notifications
    notifyOnMatch?: boolean;
    notificationRecipients?: string[];

    // Bypass settings
    allowSelfApproval?: boolean;
    allowDelegation?: boolean;
  };

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
