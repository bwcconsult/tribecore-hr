import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('overtime_policies')
export class OvertimePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1.5 })
  regularOvertimeMultiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2.0 })
  weekendOvertimeMultiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2.5 })
  holidayOvertimeMultiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1.75 })
  nightShiftMultiplier: number;

  @Column({ type: 'int', default: 40 })
  weeklyThresholdHours: number;

  @Column({ type: 'int', default: 8 })
  dailyThresholdHours: number;

  @Column({ default: true })
  requiresApproval: boolean;

  @Column({ default: false })
  autoApprovePreApproved: boolean;

  @Column({ type: 'int', nullable: true })
  maxOvertimeHoursPerWeek: number;

  @Column({ type: 'int', nullable: true })
  maxOvertimeHoursPerMonth: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  applicableDepartments: string[];

  @Column({ type: 'simple-array', nullable: true })
  applicableRoles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
