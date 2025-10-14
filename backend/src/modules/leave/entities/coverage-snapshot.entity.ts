import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * CoverageSnapshot
 * Tracks staffing levels and coverage for audit & compliance
 * Critical for hospitals, 24/7 operations
 */
@Entity('coverage_snapshots')
@Index(['organizationId', 'date', 'scope'])
export class CoverageSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  // Scope (what this coverage applies to)
  @Column()
  @Index()
  scope: string; // WARD:ICU, DEPT:ENGINEERING, LOCATION:LONDON, TEAM:SUPPORT

  @Column({ nullable: true })
  role: string; // Band-6 Nurse, Software Engineer, Retail Assistant

  @Column({ nullable: true })
  skill: string; // ALS-CERTIFIED, FORKLIFT, REGISTERED_PHARMACIST

  // Date & shift
  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ nullable: true })
  shiftType: string; // DAY, NIGHT, EVENING

  @Column({ type: 'time', nullable: true })
  shiftStart: string;

  @Column({ type: 'time', nullable: true })
  shiftEnd: string;

  // Staffing numbers
  @Column({ type: 'int', default: 0 })
  scheduled: number; // Total scheduled staff

  @Column({ type: 'int', default: 0 })
  onLeave: number; // Staff on approved leave

  @Column({ type: 'int', default: 0 })
  onLeavePending: number; // Staff with pending leave

  @Column({ type: 'int', default: 0 })
  remaining: number; // scheduled - onLeave

  @Column({ type: 'int' })
  minRequired: number; // Minimum required by policy

  @Column({ type: 'int', nullable: true })
  optimalLevel: number; // Optimal staffing level

  // Status
  @Column({ type: 'boolean', default: false })
  isBreach: boolean; // remaining < minRequired

  @Column({
    type: 'enum',
    enum: ['OK', 'WARNING', 'BREACH', 'CRITICAL'],
    default: 'OK',
  })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  coveragePercent: number; // (remaining / minRequired) * 100

  // Request impact analysis
  @Column({ nullable: true })
  leaveRequestId: string; // If this snapshot is for a specific request

  @Column({ type: 'int', nullable: true })
  afterApproval: number; // What remaining would be if request approved

  @Column({ type: 'boolean', default: false })
  wouldCauseBreach: boolean; // Would approving cause breach?

  // Backfill status
  @Column({ type: 'boolean', default: false })
  backfillRequired: boolean;

  @Column({ type: 'int', default: 0 })
  backfillCount: number; // Number of backfill shifts needed

  @Column({ type: 'int', default: 0 })
  backfillFilled: number; // How many filled

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    departmentId?: string;
    locationId?: string;
    wardId?: string;
    patientCensus?: number; // For healthcare
    skillMix?: any; // Detailed skill breakdown
    agencyStaffCount?: number;
    overtimeOffered?: boolean;
  };

  // Audit
  @Column({ nullable: true })
  calculatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  // Helper: Check if safe to approve
  isSafeToApprove(): boolean {
    return !this.wouldCauseBreach || this.backfillFilled >= this.backfillRequired;
  }

  // Helper: Get gap count
  getGapCount(): number {
    return Math.max(0, this.minRequired - this.remaining);
  }
}
