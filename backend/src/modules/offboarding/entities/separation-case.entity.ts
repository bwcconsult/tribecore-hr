import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum SeparationType {
  RESIGNATION = 'RESIGNATION',
  RETIREMENT = 'RETIREMENT',
  DISMISSAL_CONDUCT = 'DISMISSAL_CONDUCT',
  DISMISSAL_PERFORMANCE = 'DISMISSAL_PERFORMANCE',
  DISMISSAL_CAPABILITY = 'DISMISSAL_CAPABILITY',
  END_FIXED_TERM = 'END_FIXED_TERM',
  REDUNDANCY_INDIVIDUAL = 'REDUNDANCY_INDIVIDUAL',
  REDUNDANCY_COLLECTIVE = 'REDUNDANCY_COLLECTIVE',
  TUPE_TRANSFER = 'TUPE_TRANSFER',
}

export enum SeparationStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  GARDEN_LEAVE = 'GARDEN_LEAVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('separation_cases')
export class SeparationCase extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: SeparationType,
  })
  type: SeparationType;

  @Column({ nullable: true })
  reasonCode: string;

  @Column({ type: 'text', nullable: true })
  reasonDetails: string;

  @Column({ type: 'date' })
  initiationDate: Date;

  @Column({ type: 'date' })
  proposedLeaveDate: Date;

  @Column({ type: 'date', nullable: true })
  actualLeaveDate: Date;

  @Column({
    type: 'enum',
    enum: SeparationStatus,
    default: SeparationStatus.DRAFT,
  })
  status: SeparationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number; // 0-100

  @Column({ length: 3 })
  country: string; // ISO code

  @Column({ nullable: true })
  redundancyGroupId: string;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Risk factors
  @Column({ default: false })
  hasDataAccess: boolean;

  @Column({ default: false })
  hasOutstandingComplaints: boolean;

  @Column({ default: false })
  hasFinancialAccess: boolean;

  @Column({ default: false })
  isRegrettableLoss: boolean;

  // Final pay tracking
  @Column({ default: false })
  finalPayCalculated: boolean;

  @Column({ default: false })
  finalPayExported: boolean;

  @Column({ type: 'timestamp', nullable: true })
  finalPayExportedAt: Date;

  // Access & assets
  @Column({ default: false })
  accessDeprovisioned: boolean;

  @Column({ default: false })
  assetsRecovered: boolean;

  // Exit survey
  @Column({ default: false })
  exitSurveyCompleted: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  exitSurveySentimentScore: number; // 0-5

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    department?: string;
    location?: string;
    tenure?: number;
    lastWorkingDay?: string;
    handoverPlan?: any;
    [key: string]: any;
  };

  /**
   * Calculate risk score based on factors
   */
  calculateRiskScore(): number {
    let score = 0;

    if (this.hasDataAccess) score += 25;
    if (this.hasOutstandingComplaints) score += 30;
    if (this.hasFinancialAccess) score += 20;
    if (this.metadata?.tenure < 1) score += 15; // < 1 year
    if (this.type.includes('DISMISSAL')) score += 10;

    this.riskScore = Math.min(score, 100);
    return this.riskScore;
  }

  /**
   * Check if case requires legal approval
   */
  requiresLegalApproval(): boolean {
    return (
      this.riskScore > 50 ||
      this.type.includes('DISMISSAL') ||
      this.type.includes('REDUNDANCY') ||
      this.hasOutstandingComplaints
    );
  }

  /**
   * Check if all offboarding tasks complete
   */
  isOffboardingComplete(): boolean {
    return (
      this.accessDeprovisioned &&
      this.assetsRecovered &&
      this.finalPayCalculated &&
      this.finalPayExported
    );
  }
}
