import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';

export enum EmploymentActivityType {
  HIRED = 'HIRED',
  ROLE_CHANGE = 'ROLE_CHANGE',
  DEPARTMENT_TRANSFER = 'DEPARTMENT_TRANSFER',
  PROMOTION = 'PROMOTION',
  SALARY_CHANGE = 'SALARY_CHANGE',
  FTE_CHANGE = 'FTE_CHANGE',
  CONTRACT_RENEWAL = 'CONTRACT_RENEWAL',
  LEAVE_START = 'LEAVE_START',
  LEAVE_END = 'LEAVE_END',
  PROBATION_START = 'PROBATION_START',
  PROBATION_END = 'PROBATION_END',
  TERMINATION = 'TERMINATION',
  OTHER = 'OTHER',
}

@Entity('employment_activities')
@Index(['personId', 'date'])
@Index(['type', 'date'])
export class EmploymentActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'personId' })
  person: Employee;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({
    type: 'enum',
    enum: EmploymentActivityType,
  })
  @Index()
  type: EmploymentActivityType;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Store structured data about the activity
  @Column({ type: 'jsonb', nullable: true })
  payload: {
    // For ROLE_CHANGE
    previousRole?: string;
    newRole?: string;
    
    // For DEPARTMENT_TRANSFER
    previousDepartment?: string;
    newDepartment?: string;
    
    // For SALARY_CHANGE
    previousSalary?: number;
    newSalary?: number;
    currency?: string;
    
    // For FTE_CHANGE
    previousFTE?: number;
    newFTE?: number;
    
    // For LEAVE
    leaveType?: string;
    expectedReturnDate?: Date;
    
    // For TERMINATION
    terminationType?: string;
    reason?: string;
    
    // Generic fields
    notes?: string;
    effectiveDate?: Date;
  };

  // GDPR: Track who made this change
  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
