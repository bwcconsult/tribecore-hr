import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OvertimeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum OvertimeType {
  REGULAR = 'REGULAR',
  WEEKEND = 'WEEKEND',
  HOLIDAY = 'HOLIDAY',
  NIGHT_SHIFT = 'NIGHT_SHIFT',
}

@Entity('overtime_requests')
export class OvertimeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column()
  date: Date;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hours: number;

  @Column({
    type: 'enum',
    enum: OvertimeType,
    default: OvertimeType.REGULAR,
  })
  overtimeType: OvertimeType;

  @Column({
    type: 'enum',
    enum: OvertimeStatus,
    default: OvertimeStatus.PENDING,
  })
  status: OvertimeStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  taskDescription: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  multiplier: number; // 1.5x, 2x, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calculatedPay: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paidInPayrollId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    shiftId?: string;
    isPreApproved?: boolean;
    attachments?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
