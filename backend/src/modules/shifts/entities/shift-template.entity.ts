import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShiftType } from './shift.entity';

@Entity('shift_templates')
export class ShiftTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  organizationId: string;

  @Column()
  startTime: string; // Format: "HH:mm"

  @Column()
  endTime: string; // Format: "HH:mm"

  @Column({
    type: 'enum',
    enum: ShiftType,
    default: ShiftType.REGULAR,
  })
  shiftType: ShiftType;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  breakDurationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalHours: number;

  @Column({ nullable: true })
  color: string; // For calendar display

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
