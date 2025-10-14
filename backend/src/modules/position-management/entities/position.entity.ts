import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum PositionStatus {
  ACTIVE = 'ACTIVE',
  VACANT = 'VACANT',
  FROZEN = 'FROZEN',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CLOSED = 'CLOSED',
}

export enum PositionType {
  PERMANENT = 'PERMANENT',
  TEMPORARY = 'TEMPORARY',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

/**
 * Position Entity
 * Positions exist independently of people
 * Essential for workforce planning and org design
 */
@Entity('positions')
@Index(['organizationId', 'status'])
export class Position extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Position identification
  @Column({ unique: true })
  @Index()
  positionId: string; // POS-2025-0001

  @Column()
  positionTitle: string;

  @Column({ type: 'text', nullable: true })
  positionDescription?: string;

  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.PENDING_APPROVAL,
  })
  @Index()
  status: PositionStatus;

  @Column({
    type: 'enum',
    enum: PositionType,
    default: PositionType.PERMANENT,
  })
  positionType: PositionType;

  // Organizational structure
  @Column()
  @Index()
  department: string;

  @Column({ nullable: true })
  division?: string;

  @Column({ nullable: true })
  @Index()
  location?: string;

  @Column({ nullable: true })
  costCenter?: string;

  @Column({ nullable: true })
  businessUnit?: string;

  // Reporting structure
  @Column({ nullable: true })
  @Index()
  reportsToPositionId?: string; // Position ID of manager

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'reportsToPositionId' })
  reportsToPosition?: Position;

  @Column({ type: 'int', default: 0 })
  reportingLevel: number; // 0 = C-level, 1 = VP, 2 = Director, etc.

  // Job details
  @Column({ nullable: true })
  jobCode?: string;

  @Column({ nullable: true })
  jobFamily?: string; // 'Engineering', 'Sales', 'Finance'

  @Column({ nullable: true })
  jobLevel?: string; // 'IC1', 'IC2', 'M1', 'M2'

  @Column({ nullable: true })
  grade?: string; // Salary grade/band

  // Headcount & capacity
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  fte: number; // Full-time equivalent (can be 0.5 for part-time)

  @Column({ default: false })
  isShared: boolean; // Shared across departments

  @Column({ default: 1 })
  headcountBudget: number; // How many heads approved for this position

  // Current incumbent
  @Column({ nullable: true })
  @Index()
  incumbentEmployeeId?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'incumbentEmployeeId' })
  incumbent?: Employee;

  @Column({ nullable: true, type: 'date' })
  filledDate?: Date;

  // Vacancy tracking
  @Column({ default: false })
  @Index()
  isVacant: boolean;

  @Column({ nullable: true, type: 'date' })
  vacantSince?: Date;

  @Column({ type: 'int', default: 0 })
  daysVacant: number;

  @Column({ nullable: true })
  vacancyReason?: string; // 'NEW_POSITION', 'RESIGNATION', 'PROMOTION', 'TERMINATION'

  // Requisition linkage
  @Column({ nullable: true })
  linkedRequisitionId?: string; // Link to recruitment requisition

  // Compensation
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  midSalary?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxSalary?: number;

  @Column({ nullable: true })
  salaryCurrency?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  annualBudget?: number; // Total cost (salary + benefits + overhead)

  // Dates
  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  // Approval workflow
  @Column({ default: false })
  approved: boolean;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  approvedAt?: Date;

  @Column({ nullable: true })
  approvalNotes?: string;

  // Requirements
  @Column({ type: 'jsonb', nullable: true })
  requirements?: {
    education?: string[];
    experience?: string[];
    skills?: string[];
    certifications?: string[];
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
