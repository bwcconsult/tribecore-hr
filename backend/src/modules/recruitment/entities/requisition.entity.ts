import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum RequisitionStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  OPEN = 'OPEN',
  ON_HOLD = 'ON_HOLD',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
}

export enum RequisitionReason {
  GROWTH = 'GROWTH',
  BACKFILL = 'BACKFILL',
  REPLACEMENT = 'REPLACEMENT',
  SEASONAL = 'SEASONAL',
  PROJECT = 'PROJECT',
}

@Entity('requisitions')
export class Requisition extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  departmentId: string;

  @Column({ nullable: true })
  locationId: string;

  @Column()
  jobTitle: string;

  @Column({ type: 'int', default: 1 })
  headcount: number;

  @Column({ nullable: true })
  band: string; // Salary band/grade

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetAmount: number;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @Column()
  hiringManagerId: string;

  @Column({
    type: 'enum',
    enum: RequisitionReason,
  })
  reason: RequisitionReason;

  @Column({ type: 'text', nullable: true })
  businessJustification: string;

  @Column({ type: 'date', nullable: true })
  targetStartDate: Date;

  @Column({
    type: 'enum',
    enum: RequisitionStatus,
    default: RequisitionStatus.DRAFT,
  })
  status: RequisitionStatus;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ default: false })
  requiresVisaSponsorship: boolean;

  @Column({ nullable: true })
  replacingEmployeeId: string; // For BACKFILL/REPLACEMENT

  // Approval workflow
  @Column({ type: 'jsonb', default: [] })
  approvals: Array<{
    approverId: string;
    approverName: string;
    role: string; // Manager, Finance, HR
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decidedAt?: Date;
    comments?: string;
  }>;

  @Column({ default: false })
  fullyApproved: boolean;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  // Posting tracking
  @Column({ type: 'int', default: 0 })
  jobsCreated: number;

  @Column({ type: 'int', default: 0 })
  applicationsReceived: number;

  @Column({ type: 'int', default: 0 })
  hiredCount: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    costCenter?: string;
    employmentType?: string; // Full-time, Part-time, Contract
    remote?: boolean;
    hybrid?: boolean;
    travelRequired?: number; // percentage
    [key: string]: any;
  };

  /**
   * Check if req needs approval
   */
  needsApproval(): boolean {
    return this.approvals.some(a => a.status === 'PENDING');
  }

  /**
   * Check if within budget
   */
  isWithinBudget(proposedSalary: number): boolean {
    if (!this.budgetAmount) return true;
    return proposedSalary <= this.budgetAmount;
  }
}
