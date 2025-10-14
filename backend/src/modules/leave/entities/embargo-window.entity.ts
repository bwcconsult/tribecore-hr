import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * EmbargoWindow
 * Blackout periods where leave cannot be taken
 * e.g., Retail Dec 20-31, Hospital critical periods, Project go-live
 */
@Entity('embargo_windows')
@Index(['organizationId', 'startDate', 'endDate'])
export class EmbargoWindow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  name: string; // "Christmas Trading Period", "Q4 Freeze", "System Go-Live"

  @Column({ type: 'text', nullable: true })
  description: string;

  // Date range
  @Column({ type: 'date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date' })
  @Index()
  endDate: Date;

  // Scope (who does this apply to)
  @Column({ type: 'jsonb' })
  scope: {
    type: 'ALL' | 'DEPARTMENT' | 'LOCATION' | 'ROLE' | 'GRADE' | 'TEAM' | 'PROJECT';
    departmentIds?: string[];
    locationIds?: string[];
    roleIds?: string[];
    gradeIds?: string[];
    teamIds?: string[];
    projectIds?: string[];
    employeeIds?: string[]; // Specific employees
  };

  // Leave types affected
  @Column({ type: 'jsonb', default: ['AL'] })
  affectedLeaveTypes: string[]; // ['AL', 'TOIL'] - usually not sick

  // Strictness
  @Column({
    type: 'enum',
    enum: ['ABSOLUTE', 'SOFT', 'APPROVAL_REQUIRED'],
    default: 'ABSOLUTE',
  })
  strictness: string;

  @Column({ type: 'boolean', default: false })
  allowOverride: boolean; // Can senior manager override?

  @Column({ type: 'jsonb', nullable: true })
  overrideApprovers: string[]; // User IDs who can approve exceptions

  // Capacity caps during embargo
  @Column({ type: 'int', nullable: true })
  maxApprovals: number; // Max N approvals allowed during period

  @Column({ type: 'int', default: 0 })
  approvalsCount: number; // Current count

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxTeamOffPercent: number; // Max % of team that can be off

  // Reason & justification
  @Column({
    type: 'enum',
    enum: ['BUSINESS_CRITICAL', 'SEASONAL_DEMAND', 'PROJECT', 'AUDIT', 'SYSTEM_CHANGE', 'REGULATORY', 'OTHER'],
    default: 'BUSINESS_CRITICAL',
  })
  reason: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  // Recurrence
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean; // e.g., every December

  @Column({ type: 'varchar', nullable: true })
  recurrenceRule: string; // "YEARLY:12-20-to-12-31"

  // Communication
  @Column({ type: 'date', nullable: true })
  notificationSentAt: Date;

  @Column({ type: 'boolean', default: false })
  employeesNotified: boolean;

  @Column({ type: 'text', nullable: true })
  notificationMessage: string;

  // Audit
  @Column()
  createdBy: string;

  @Column({ nullable: true })
  approvedBy: string; // Senior approval for embargo

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt: Date;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'APPROVED', 'ACTIVE', 'EXPIRED'],
    default: 'DRAFT',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper: Check if date falls within embargo
  containsDate(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  // Helper: Check if employee is affected
  appliesToEmployee(
    employeeId: string,
    departmentId?: string,
    locationId?: string,
    roleId?: string,
  ): boolean {
    if (this.scope.type === 'ALL') return true;

    if (this.scope.employeeIds?.includes(employeeId)) return true;
    if (departmentId && this.scope.departmentIds?.includes(departmentId)) return true;
    if (locationId && this.scope.locationIds?.includes(locationId)) return true;
    if (roleId && this.scope.roleIds?.includes(roleId)) return true;

    return false;
  }

  // Helper: Check if can still approve more
  canApproveMore(): boolean {
    if (!this.maxApprovals) return true;
    return this.approvalsCount < this.maxApprovals;
  }
}
