import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('expense_out_of_office')
export class ExpenseOutOfOffice extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  substituteEmployeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'substituteEmployeeId' })
  substituteEmployee: Employee;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  autoApprove: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: true })
  notifySubstitute: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
