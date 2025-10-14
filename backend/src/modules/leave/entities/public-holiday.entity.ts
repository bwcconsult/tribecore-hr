import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * PublicHoliday
 * Multi-region public holiday calendar
 * Supports country, state/province, and company-specific holidays
 */
@Entity('public_holidays')
@Index(['country', 'state', 'date'])
export class PublicHoliday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  organizationId: string;

  // Geographic scope
  @Column({ type: 'varchar', length: 2 })
  @Index()
  country: string; // ISO 3166-1 alpha-2 (GB, US, ZA, NG)

  @Column({ type: 'varchar', length: 10, nullable: true })
  @Index()
  state: string; // State/Province/Region (CA, TX, ENG, WAL, SCT)

  @Column({ type: 'varchar', nullable: true })
  city: string; // City-specific (optional)

  // Holiday details
  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column()
  name: string; // Christmas Day, Independence Day, etc.

  @Column({ type: 'text', nullable: true })
  localName: string; // Native language name

  // Type classification
  @Column({
    type: 'enum',
    enum: ['NATIONAL', 'REGIONAL', 'RELIGIOUS', 'BANK_HOLIDAY', 'COMPANY'],
    default: 'NATIONAL',
  })
  type: string;

  @Column({ type: 'boolean', default: false })
  isCompanySpecific: boolean; // Company closure day

  // Recurrence
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean; // e.g., Christmas always Dec 25

  @Column({ type: 'varchar', nullable: true })
  recurrenceRule: string; // "MM-DD" or "EASTER+1" (Easter Monday)

  // Observance rules
  @Column({ type: 'boolean', default: false })
  observedOnNonWorkingDay: boolean; // True if on weekend

  @Column({ type: 'date', nullable: true })
  observedDate: Date; // If moved to Mon/Fri when falls on weekend

  @Column({
    type: 'enum',
    enum: ['FIXED', 'OBSERVED', 'IN_LIEU'],
    default: 'FIXED',
  })
  observanceType: string;

  // In-lieu handling
  @Column({ type: 'boolean', default: true })
  grantsInLieu: boolean; // If employee works, grant day in-lieu

  @Column({ type: 'boolean', default: false })
  requiresShiftWork: boolean; // Only shift workers affected

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    localCustoms?: string;
    tradingRestrictions?: boolean; // Retail closed
    banksClosed?: boolean;
    schoolsClosed?: boolean;
    applicableSectors?: string[];
  };

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int' })
  @Index()
  year: number; // For quick year filtering

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
