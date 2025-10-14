import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Entitlement
 * Tracks employee leave balances per leave type per period
 * All values stored in minutes for precision; display layer converts to hours/days
 */
@Entity('entitlements')
@Index(['employeeId', 'leaveTypeId', 'periodStart'], { unique: true })
export class Entitlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  employeeId: string;

  @Column()
  @Index()
  organizationId: string;

  @Column()
  @Index()
  leaveTypeId: string;

  @ManyToOne(() => require('./leave-type.entity').LeaveType)
  @JoinColumn({ name: 'leaveTypeId' })
  leaveType: any;

  // Period definition
  @Column({ type: 'date' })
  @Index()
  periodStart: Date;

  @Column({ type: 'date' })
  @Index()
  periodEnd: Date;

  // Balances (all in MINUTES for precision)
  @Column({ type: 'int', default: 0 })
  minutesEntitled: number; // Base annual entitlement

  @Column({ type: 'int', default: 0 })
  minutesAccrued: number; // Accrued to date (if monthly prorata)

  @Column({ type: 'int', default: 0 })
  minutesCarriedOver: number; // From previous period

  @Column({ type: 'int', default: 0 })
  minutesPurchased: number; // Additional purchased days

  @Column({ type: 'int', default: 0 })
  minutesSold: number; // Days sold back

  @Column({ type: 'int', default: 0 })
  minutesTaken: number; // Approved & taken

  @Column({ type: 'int', default: 0 })
  minutesPending: number; // Pending approval

  @Column({ type: 'int', default: 0 })
  minutesAdjustment: number; // Manual adjustments (can be negative)

  // Calculated balance
  @Column({ type: 'int', default: 0 })
  minutesAvailable: number; // = entitled + accrued + carried + purchased - sold - taken - pending

  // Expiry tracking
  @Column({ type: 'int', default: 0 })
  minutesExpiringSoon: number; // Expiring within 30 days

  @Column({ type: 'date', nullable: true })
  carryoverExpiryDate: Date; // When carried over minutes expire

  // FTE & Pro-rating
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.0 })
  ftePercentage: number; // FTE at period start

  @Column({ type: 'boolean', default: false })
  isProRated: boolean;

  @Column({ type: 'date', nullable: true })
  joinDateForPeriod: Date; // If joined mid-period

  @Column({ type: 'date', nullable: true })
  leaveDateForPeriod: Date; // If leaving mid-period

  // Status flags
  @Column({ type: 'boolean', default: false })
  isLocked: boolean; // Locked after period close

  @Column({ type: 'boolean', default: false })
  hasCarryoverExpired: boolean;

  // Audit fields
  @Column({ nullable: true })
  lastCalculatedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastCalculatedAt: Date;

  @Column({ nullable: true })
  lastAdjustedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAdjustedAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    workingPatternId?: string;
    weeklyHours?: number;
    notes?: string;
    migrated?: boolean; // Migrated from legacy system
    legacyBalance?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper: Get balance in hours
  getBalanceInHours(): number {
    return this.minutesAvailable / 60;
  }

  // Helper: Get balance in days (assuming 8h day)
  getBalanceInDays(hoursPerDay: number = 8): number {
    return this.minutesAvailable / (hoursPerDay * 60);
  }

  // Helper: Recalculate available balance
  recalculateAvailable(): void {
    this.minutesAvailable =
      this.minutesEntitled +
      this.minutesAccrued +
      this.minutesCarriedOver +
      this.minutesPurchased -
      this.minutesSold -
      this.minutesTaken -
      this.minutesPending +
      this.minutesAdjustment;
  }

  // Helper: Check if sufficient balance
  hasSufficientBalance(minutesRequested: number): boolean {
    return this.minutesAvailable >= minutesRequested;
  }

  // Helper: Deduct from balance
  deduct(minutes: number, isPending: boolean = false): void {
    if (isPending) {
      this.minutesPending += minutes;
    } else {
      this.minutesTaken += minutes;
    }
    this.recalculateAvailable();
  }

  // Helper: Return to balance (e.g., cancellation)
  returnToBalance(minutes: number, wasPending: boolean = false): void {
    if (wasPending) {
      this.minutesPending = Math.max(0, this.minutesPending - minutes);
    } else {
      this.minutesTaken = Math.max(0, this.minutesTaken - minutes);
    }
    this.recalculateAvailable();
  }
}
