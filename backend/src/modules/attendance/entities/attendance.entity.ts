import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AttendanceStatus } from '../../../common/enums';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('attendances')
export class Attendance extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  clockIn?: string;

  @Column({ type: 'time', nullable: true })
  clockOut?: string;

  @Column({ type: 'int', nullable: true })
  workMinutes?: number;

  @Column({ type: 'int', nullable: true })
  breakMinutes?: number;

  @Column({ type: 'int', nullable: true })
  overtimeMinutes?: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
