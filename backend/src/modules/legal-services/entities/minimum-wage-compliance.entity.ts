import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum WageAgeCategory {
  APPRENTICE = 'APPRENTICE',
  AGE_16_17 = 'AGE_16_17',
  AGE_18_20 = 'AGE_18_20',
  AGE_21_PLUS = 'AGE_21_PLUS',
}

export enum MinimumWageStatus {
  COMPLIANT = 'COMPLIANT',
  UNDERPAYMENT = 'UNDERPAYMENT',
  AT_RISK = 'AT_RISK',
  RESOLVED = 'RESOLVED',
}

@Entity('minimum_wage_compliance')
@Index(['employeeId', 'payPeriodStart'])
export class MinimumWageCompliance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  employeeId: string;

  @Column({ type: 'date' })
  payPeriodStart: Date;

  @Column({ type: 'date' })
  payPeriodEnd: Date;

  @Column({ type: 'int' })
  employeeAge: number;

  @Column({
    type: 'enum',
    enum: WageAgeCategory,
  })
  ageCategory: WageAgeCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  applicableMinimumWage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  actualHourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalHoursWorked: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  allowableDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  relevantPay: number;

  @Column({
    type: 'enum',
    enum: MinimumWageStatus,
    default: MinimumWageStatus.COMPLIANT,
  })
  status: MinimumWageStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  underpaymentAmount: number;

  @Column({ type: 'text', nullable: true })
  underpaymentReason: string;

  @Column({ default: false })
  isApprentice: boolean;

  @Column({ type: 'int', nullable: true })
  apprenticeshipYear: number;

  @Column({ type: 'jsonb', nullable: true })
  payComponents: {
    basicPay: number;
    overtime: number;
    bonus: number;
    commission: number;
    allowances: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  deductions: Array<{
    type: string;
    amount: number;
    allowable: boolean;
  }>;

  @Column({ default: false })
  resolved: boolean;

  @Column({ type: 'date', nullable: true })
  resolvedDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  backpayAmount: number;

  @Column({ type: 'date', nullable: true })
  backpayDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
