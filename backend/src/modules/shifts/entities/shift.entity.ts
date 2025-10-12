import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ShiftStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ShiftType {
  REGULAR = 'REGULAR',
  OVERTIME = 'OVERTIME',
  NIGHT_SHIFT = 'NIGHT_SHIFT',
  WEEKEND = 'WEEKEND',
  ON_CALL = 'ON_CALL',
}

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column({ nullable: true })
  rotaId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ShiftType,
    default: ShiftType.REGULAR,
  })
  shiftType: ShiftType;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.DRAFT,
  })
  status: ShiftStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  breakDurationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalHours: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isOpenShift: boolean;

  @Column({ nullable: true })
  assignedBy: string;

  @Column({ nullable: true })
  assignedAt: Date;

  @Column({ nullable: true })
  swapRequestedBy: string;

  @Column({ nullable: true })
  swapRequestedAt: Date;

  @Column({ default: false })
  isSwapApproved: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
