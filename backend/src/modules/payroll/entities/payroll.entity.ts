import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PayrollFrequency, PayrollStatus, Country } from '../../../common/enums';
import { Employee } from '../../employees/entities/employee.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('payrolls')
export class Payroll extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'date' })
  payPeriodStart: Date;

  @Column({ type: 'date' })
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  payDate: Date;

  @Column({
    type: 'enum',
    enum: PayrollFrequency,
  })
  frequency: PayrollFrequency;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bonuses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  overtime: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  incomeTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nationalInsurance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pensionContribution: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  studentLoan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netPay: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: Country,
  })
  country: Country;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @Column({ nullable: true })
  payslipUrl?: string;

  @Column({ nullable: true })
  paymentReferenceNumber?: string;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  paidBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paidAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  taxBreakdown?: {
    taxableIncome?: number;
    taxBands?: Array<{
      band: string;
      rate: number;
      amount: number;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  deductionsBreakdown?: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true })
  allowancesBreakdown?: Record<string, number>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
