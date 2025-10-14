import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * TOILBalance
 * Time Off In Lieu balance tracking
 * Integrates with Overtime module
 */
@Entity('toil_balances')
@Index(['employeeId', 'organizationId'])
export class TOILBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  employeeId: string;

  @Column()
  @Index()
  organizationId: string;

  // Balance (in minutes)
  @Column({ type: 'int', default: 0 })
  minutesEarned: number;

  @Column({ type: 'int', default: 0 })
  minutesSpent: number;

  @Column({ type: 'int', default: 0 })
  minutesExpired: number;

  @Column({ type: 'int', default: 0 })
  minutesAvailable: number; // earned - spent - expired

  // Transactions (FIFO queue)
  @Column({ type: 'jsonb', default: [] })
  transactions: Array<{
    id: string;
    type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'ADJUSTED';
    minutes: number;
    date: Date;
    expiryDate?: Date;
    source?: string; // OvertimeLine ID or LeaveRequest ID
    notes?: string;
  }>;

  // Expiry tracking
  @Column({ type: 'int', nullable: true })
  expiryDays: number; // TOIL expires after X days

  @Column({ type: 'int', default: 0 })
  minutesExpiringSoon: number; // Expiring within 30 days

  @Column({ type: 'date', nullable: true })
  nextExpiryDate: Date;

  // Policy
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  conversionRate: number; // 1.0 or 1.5

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper: Get balance in hours
  getBalanceInHours(): number {
    return this.minutesAvailable / 60;
  }

  // Helper: Earn TOIL
  earn(minutes: number, source: string, expiryDate?: Date): void {
    this.transactions.push({
      id: `EARN-${Date.now()}`,
      type: 'EARNED',
      minutes,
      date: new Date(),
      expiryDate,
      source,
    });
    this.minutesEarned += minutes;
    this.recalculate();
  }

  // Helper: Spend TOIL (FIFO)
  spend(minutes: number, leaveRequestId: string): boolean {
    if (this.minutesAvailable < minutes) return false;

    this.transactions.push({
      id: `SPEND-${Date.now()}`,
      type: 'SPENT',
      minutes,
      date: new Date(),
      source: leaveRequestId,
    });
    this.minutesSpent += minutes;
    this.recalculate();
    return true;
  }

  // Helper: Expire old TOIL
  expireOld(): number {
    const now = new Date();
    let expired = 0;

    this.transactions
      .filter(t => t.type === 'EARNED' && t.expiryDate && new Date(t.expiryDate) < now)
      .forEach(t => {
        this.minutesExpired += t.minutes;
        expired += t.minutes;
      });

    this.recalculate();
    return expired;
  }

  // Helper: Recalculate balance
  private recalculate(): void {
    this.minutesAvailable = this.minutesEarned - this.minutesSpent - this.minutesExpired;
  }
}
