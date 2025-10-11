import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

export enum AbsencePlanType {
  HOLIDAY = 'HOLIDAY', // Annual leave/vacation
  BIRTHDAY = 'BIRTHDAY', // Birthday leave
  LEVEL_UP_DAYS = 'LEVEL_UP_DAYS', // Earned time off
  SICKNESS = 'SICKNESS', // Sick leave
  OTHER = 'OTHER', // Other absence types (TOIL, study, etc.)
}

export enum AbsenceUnit {
  DAY = 'DAY',
  HOUR = 'HOUR',
}

export enum ApprovalChainType {
  NONE = 'NONE', // No approval required
  MANAGER = 'MANAGER', // Direct manager approval
  MANAGER_AND_HR = 'MANAGER_AND_HR', // Manager then HR
  HR_ONLY = 'HR_ONLY', // HR approval only
  CUSTOM = 'CUSTOM', // Custom approval chain
}

/**
 * AbsencePlan Entity
 * Defines absence plan types (Holiday, Birthday, etc.) with policies
 */
@Entity('absence_plans')
export class AbsencePlan extends BaseEntity {
  @Column()
  @Index()
  name: string; // "Holiday 2026 Plan", "Birthday Leave", etc.

  @Column({
    type: 'enum',
    enum: AbsencePlanType,
  })
  @Index()
  type: AbsencePlanType;

  @Column({
    type: 'enum',
    enum: AbsenceUnit,
    default: AbsenceUnit.DAY,
  })
  unit: AbsenceUnit;

  @Column({ nullable: true })
  description?: string;

  // Accrual Policy Reference
  @Column({ nullable: true })
  accrualPolicyId?: string;

  // Approval Settings
  @Column({
    type: 'enum',
    enum: ApprovalChainType,
    default: ApprovalChainType.MANAGER,
  })
  approvalChainType: ApprovalChainType;

  @Column({ type: 'jsonb', nullable: true })
  customApprovalChain?: { role: UserRole; sequence: number }[];

  // Entitlement & Accrual
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultEntitlementDays?: number; // Default entitlement per year

  @Column({ default: false })
  allowsNegativeBalance: boolean;

  @Column({ default: false })
  requiresAttachment: boolean; // Sick leave may require medical cert

  // Carryover Rules
  @Column({ type: 'jsonb', nullable: true })
  carryoverRules?: {
    enabled: boolean;
    maxDays?: number;
    expiryMonths?: number; // Use within X months
  };

  // Rounding Rules
  @Column({ type: 'jsonb', nullable: true })
  roundingRules?: {
    method: 'UP' | 'DOWN' | 'NEAREST';
    precision: 0.25 | 0.5 | 1; // Quarter day, half day, full day
  };

  // Blackout Periods (dates when absence cannot be taken)
  @Column({ type: 'jsonb', nullable: true })
  blackoutPeriods?: {
    start: string; // ISO date
    end: string;
    reason?: string;
  }[];

  // Public Holiday Handling
  @Column({ default: false })
  excludesPublicHolidays: boolean; // Don't count public holidays against entitlement

  // Visibility & Access
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.EMPLOYEE],
  })
  visibleToRoles: UserRole[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveFrom?: Date; // Plan starts from this date

  @Column({ type: 'date', nullable: true })
  effectiveTo?: Date; // Plan ends on this date

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional plan configuration
}
