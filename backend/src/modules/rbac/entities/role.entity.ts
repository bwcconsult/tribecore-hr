import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';
import { Permission } from './permission.entity';

export enum RoleCategory {
  EXECUTIVE = 'EXECUTIVE',
  HR_OPERATIONS = 'HR_OPERATIONS',
  PAYROLL_FINANCE = 'PAYROLL_FINANCE',
  TALENT_PERFORMANCE = 'TALENT_PERFORMANCE',
  RECRUITMENT_ONBOARDING = 'RECRUITMENT_ONBOARDING',
  EMPLOYEE_MANAGER = 'EMPLOYEE_MANAGER',
  IT_SECURITY = 'IT_SECURITY',
  UNION_REP = 'UNION_REP',
}

export enum AccessScope {
  GLOBAL = 'GLOBAL',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  DEPARTMENT = 'DEPARTMENT',
  TEAM = 'TEAM',
  REGION = 'REGION',
  COUNTRY = 'COUNTRY',
  SITE = 'SITE',
  DIRECT_REPORTS = 'DIRECT_REPORTS',
  SELF = 'SELF',
}

/**
 * Role Entity - Enterprise-Grade RBAC
 * Defines what actions users can perform across the system
 */
@Entity('roles')
@Index(['code'], { unique: true })
export class Role extends BaseEntity {
  @Column()
  name: string; // Human-readable: "Payroll Administrator"

  @Column({ unique: true })
  code: string; // Machine-readable: "PAYROLL_ADMIN"

  @Column({
    type: 'enum',
    enum: RoleCategory,
  })
  category: RoleCategory;

  @Column({
    type: 'enum',
    enum: AccessScope,
    default: AccessScope.SELF,
  })
  defaultScope: AccessScope;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  hierarchyLevel: number; // 0=Super Admin, 1=Director, 2=Manager, etc.

  @Column({ nullable: true })
  parentRoleId?: string; // For role hierarchy

  // Role can inherit from parent role
  @Column({ type: 'jsonb', nullable: true })
  inheritsFrom?: string[]; // Array of role IDs to inherit permissions from

  // Associated permissions
  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId' },
    inverseJoinColumn: { name: 'permissionId' },
  })
  permissions: Permission[];

  // Policy-as-Code: Advanced permission rules
  @Column({ type: 'jsonb', nullable: true })
  policyRules?: {
    // Attribute-based access control
    scopeFilters?: {
      country?: string[];
      businessUnit?: string[];
      department?: string[];
      location?: string[];
      employmentType?: string[];
      securityClearance?: string[];
    };
    
    // Field-level access control
    fieldMask?: {
      module: string;
      fields: string[]; // Fields to hide/mask
      maskType: 'hide' | 'redact' | 'hash';
    }[];
    
    // Record-level filters
    recordFilters?: {
      module: string;
      conditions: Record<string, any>; // SQL-like conditions
    }[];
    
    // Time-based access
    timeRestrictions?: {
      allowedDays?: number[]; // 0-6 (Sunday-Saturday)
      allowedHours?: { start: string; end: string }; // "09:00"-"17:00"
      timezone?: string;
    };
    
    // IP restrictions
    ipWhitelist?: string[];
    
    // Delegation rules
    canDelegate?: boolean;
    delegationScope?: AccessScope[];
  };

  // Separation of Duties (SoD) - Incompatible roles
  @Column({ type: 'simple-array', nullable: true })
  incompatibleRoles?: string[]; // Role codes that cannot be held simultaneously

  // Compliance flags
  @Column({ default: false })
  requiresApproval: boolean; // Role assignment needs approval

  @Column({ default: false })
  requiresMFA: boolean; // Multi-factor authentication required

  @Column({ default: false })
  requiresRecertification: boolean; // Periodic access review required

  @Column({ type: 'int', nullable: true })
  recertificationDays?: number; // Days between recertifications (e.g., 90)

  // Metadata
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemRole: boolean; // System-defined vs custom

  @Column({ type: 'int', default: 0 })
  userCount: number; // Denormalized for performance

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  lastModifiedBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    modules?: string[]; // Which modules this role applies to
    maxUsers?: number; // License limit
    costCenter?: string;
    tags?: string[];
  };
}
