import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum AbsencePlanType {
  HOLIDAY = 'HOLIDAY',
  BIRTHDAY = 'BIRTHDAY',
  LEVEL_UP_DAY = 'LEVEL_UP_DAY',
  SICKNESS = 'SICKNESS',
  OTHER_ABSENCE = 'OTHER_ABSENCE',
  TOIL = 'TOIL',
}

@Entity('absence_balance_cache')
@Index(['userId', 'planType', 'periodStart'])
export class AbsenceBalanceCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column({
    type: 'enum',
    enum: AbsencePlanType,
  })
  @Index()
  planType: AbsencePlanType;

  @Column({ type: 'date' })
  @Index()
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  // Entitlement values
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  entitlementDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  entitlementHours: number;

  // Taken values
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  takenDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  takenHours: number;

  // Remaining values (computed)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingHours: number;

  // Episodes (for sickness tracking)
  @Column({ type: 'int', default: 0 })
  episodes: number;

  // Rolling window configuration
  @Column({ type: 'int', nullable: true })
  rollingWindowDays: number; // e.g., 365 for rolling year

  // Thresholds (for alerts)
  @Column({ type: 'jsonb', nullable: true })
  thresholds: {
    daysWarning?: number;
    daysAlert?: number;
    episodesWarning?: number;
    episodesAlert?: number;
  };

  // Accrual information
  @Column({ type: 'jsonb', nullable: true })
  accrualInfo: {
    accrualRate?: number; // days per month
    accrualStartDate?: Date;
    accrualMethod?: 'MONTHLY' | 'ANNUAL' | 'CUSTOM';
  };

  // Cache metadata
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  lastCalculatedAt: Date;

  @Column({ default: true })
  isValid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
