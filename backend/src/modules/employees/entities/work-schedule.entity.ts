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
import { Employee } from './employee.entity';

export enum Weekday {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

@Entity('work_schedules')
@Index(['personId', 'effectiveFrom'])
@Index(['weekday', 'personId'])
export class WorkSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'personId' })
  person: Employee;

  @Column({
    type: 'enum',
    enum: Weekday,
  })
  @Index()
  weekday: Weekday;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  hours: number; // e.g., 7.5, 8.0, 0

  @Column({ type: 'date' })
  @Index()
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  // Optional: Specific start/end times
  @Column({ type: 'time', nullable: true })
  startTime: string; // e.g., '09:00:00'

  @Column({ type: 'time', nullable: true })
  endTime: string; // e.g., '17:30:00'

  // Break duration in minutes
  @Column({ type: 'int', nullable: true, default: 0 })
  breakMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
