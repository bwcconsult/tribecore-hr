import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum DelegatePermission {
  CREATE = 'CREATE',
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

@Entity('expense_delegates')
export class ExpenseDelegate extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  delegateEmployeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'delegateEmployeeId' })
  delegateEmployee: Employee;

  @Column({ type: 'enum', enum: DelegatePermission, array: true })
  permissions: DelegatePermission[];

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: false })
  canApproveOnBehalf: boolean;

  @Column({ default: false })
  notifyOnAction: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
