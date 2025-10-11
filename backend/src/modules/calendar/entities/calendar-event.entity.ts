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

export enum CalendarEventType {
  HOLIDAY = 'HOLIDAY',
  BIRTHDAY = 'BIRTHDAY',
  LEVEL_UP_DAY = 'LEVEL_UP_DAY',
  SICKNESS = 'SICKNESS',
  OTHER_ABSENCE = 'OTHER_ABSENCE',
  BANK_HOLIDAY = 'BANK_HOLIDAY',
}

export enum CalendarEventStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('calendar_events')
@Index(['startDate', 'endDate'])
@Index(['userId', 'type'])
@Index(['organizationId', 'startDate'])
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column({
    type: 'enum',
    enum: CalendarEventType,
  })
  @Index()
  type: CalendarEventType;

  @Column()
  title: string;

  @Column({ type: 'date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date' })
  @Index()
  endDate: Date;

  @Column({ nullable: true })
  color: string;

  @Column({
    type: 'enum',
    enum: CalendarEventStatus,
    default: CalendarEventStatus.APPROVED,
  })
  status: CalendarEventStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursImpact: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  daysImpact: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    leaveRequestId?: string;
    absenceType?: string;
    approvedBy?: string;
    approvedAt?: Date;
    reason?: string; // GDPR: masked for non-HR roles
    notes?: string;
  };

  // GDPR: Track who can see this event
  @Column({ type: 'simple-array', nullable: true })
  visibleToRoles: string[];

  // GDPR: Anonymization flag
  @Column({ default: false })
  anonymize: boolean;

  // GDPR: Audit trail
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  modifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // GDPR: Data retention
  @Column({ type: 'date', nullable: true })
  retentionUntil: Date;
}
