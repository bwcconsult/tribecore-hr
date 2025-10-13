import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { PayrollRun } from './payroll-run.entity';

export enum PayslipStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  AMENDED = 'AMENDED',
  VOID = 'VOID',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

@Entity('payslips')
export class Payslip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ nullable: true })
  payRunId: string;

  @ManyToOne(() => PayrollRun, { nullable: true })
  @JoinColumn({ name: 'payRunId' })
  payRun: PayrollRun;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date' })
  payDate: Date;

  @Column({ length: 2 })
  country: string; // ISO country code (UK, US, NG, ZA, etc.)

  @Column({ length: 3 })
  currency: string; // ISO currency code (GBP, USD, NGN, ZAR, EUR)

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  exchangeRateToBase: number;

  @Column({ length: 10, default: 'en-GB' })
  locale: string;

  @Column({
    type: 'enum',
    enum: PayslipStatus,
    default: PayslipStatus.DRAFT,
  })
  status: PayslipStatus;

  @Column({ type: 'timestamp', nullable: true })
  generatedAt: Date;

  @Column({ nullable: true })
  signedBy: string; // SHA256 hash for tamper-proofing

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ nullable: true })
  supersedesPayslipId: string; // For amendments

  @ManyToOne(() => Payslip, { nullable: true })
  @JoinColumn({ name: 'supersedesPayslipId' })
  supersedesPayslip: Payslip;

  // Totals
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEmployerContributions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay: number;

  // Bank instructions
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'jsonb', nullable: true })
  bankInstructions: {
    sortCode?: string; // UK
    accountNumber?: string;
    iban?: string; // EU
    bsb?: string; // AU
    routingNumber?: string; // US
    accountName?: string;
    bankName?: string;
  };

  // YTD Snapshot
  @Column({ type: 'jsonb', nullable: true })
  ytdSnapshot: {
    gross?: number;
    payee?: number; // Income tax
    ni_ee?: number; // National Insurance / FICA
    pension_ee?: number;
    pension_er?: number;
    [key: string]: number;
  };

  // Meta
  @Column({ type: 'jsonb', nullable: true })
  meta: {
    costCenter?: string;
    project?: string;
    union?: string;
    jobGrade?: string;
    taxResidency?: string;
    workPattern?: string;
    fxNotes?: string;
    [key: string]: any;
  };

  // Sections - relationships to line item entities
  @OneToMany(() => PayslipEarning, (earning) => earning.payslip, {
    cascade: true,
  })
  earnings: PayslipEarning[];

  @OneToMany(() => PayslipDeduction, (deduction) => deduction.payslip, {
    cascade: true,
  })
  preTaxDeductions: PayslipDeduction[];

  @OneToMany(() => PayslipTax, (tax) => tax.payslip, { cascade: true })
  taxes: PayslipTax[];

  @OneToMany(() => PayslipDeduction, (deduction) => deduction.payslip, {
    cascade: true,
  })
  postTaxDeductions: PayslipDeduction[];

  @OneToMany(
    () => PayslipGarnishment,
    (garnishment) => garnishment.payslip,
    { cascade: true },
  )
  garnishments: PayslipGarnishment[];

  @OneToMany(
    () => PayslipEmployerContribution,
    (contrib) => contrib.payslip,
    { cascade: true },
  )
  employerContributions: PayslipEmployerContribution[];

  @OneToMany(() => PayslipAllowance, (allowance) => allowance.payslip, {
    cascade: true,
  })
  allowances: PayslipAllowance[];

  @OneToMany(
    () => PayslipReimbursement,
    (reimbursement) => reimbursement.payslip,
    { cascade: true },
  )
  reimbursements: PayslipReimbursement[];

  @Column({ type: 'jsonb', nullable: true })
  leaveBalances: {
    annual?: { opening: number; accrued: number; taken: number; closing: number };
    sick?: { opening: number; accrued: number; taken: number; closing: number };
    maternity?: { opening: number; accrued: number; taken: number; closing: number };
    paternity?: { opening: number; accrued: number; taken: number; closing: number };
    pto?: { opening: number; accrued: number; taken: number; closing: number };
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  equityWithholding: Array<{
    type: string; // RSU, ESPP, ISO, NSO
    shares?: number;
    value: number;
    taxWithheld: number;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  retroAdjustments: Array<{
    reason: string;
    period: string;
    delta: number;
    code?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  messages: Array<{
    type: string; // info, warning, statutory
    title: string;
    message: string;
  }>;

  // PDF and distribution
  @Column({ nullable: true })
  pdfUrl: string;

  @Column({ nullable: true })
  pdfStoragePath: string;

  @Column({ type: 'boolean', default: false })
  emailSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date;

  // Calculation trace for explainability
  @Column({ type: 'jsonb', nullable: true })
  calculationTrace: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// PayslipEarning Entity
@Entity('payslip_earnings')
export class PayslipEarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, (payslip) => payslip.earnings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  code: string; // e.g., BASE, OT1, OT2, BONUS, COMMISSION

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  qty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rate: number;

  @Column({ nullable: true })
  units: string; // hour, day, period, piece

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  periodAmount: number;

  @Column({ type: 'boolean', default: true })
  taxable: boolean;

  @Column({ type: 'boolean', default: false })
  niable: boolean; // For UK NI / US FICA

  @Column({ type: 'boolean', default: true })
  pensionable: boolean;

  @Column({ type: 'boolean', default: false })
  bonusFlag: boolean;

  @Column({ nullable: true })
  overtimeClass: string; // OT1, OT2, Holiday, etc.

  @Column({ nullable: true })
  costCenter: string;

  @Column({ type: 'jsonb', nullable: true })
  calcTrace: {
    formula?: string;
    inputs?: any;
    rounding?: string;
    source?: string;
    references?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;
}

// PayslipDeduction Entity (used for both pre-tax and post-tax)
@Entity('payslip_deductions')
export class PayslipDeduction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  code: string; // PEN_SS, PEN_401K, HSA, FSA, UNION, etc.

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  periodAmount: number;

  @Column({ type: 'boolean', default: false })
  isPreTax: boolean;

  @Column({ type: 'jsonb', nullable: true })
  calcTrace: any;

  @CreateDateColumn()
  createdAt: Date;
}

// PayslipTax Entity
@Entity('payslip_taxes')
export class PayslipTax {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, (payslip) => payslip.taxes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  jurisdiction: string; // UK, US-Federal, US-CA, NG-Lagos, ZA, etc.

  @Column()
  taxCode: string; // PAYE, FICA, NI, StudentLoan, etc.

  @Column()
  basis: string; // PAYE, FICA, PAYG, NI, StudentLoan

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  taxableBase: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  rate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'jsonb', nullable: true })
  calcTrace: {
    formula?: string;
    inputs?: any;
    rounding?: string;
    source?: string;
    references?: string[];
    bands?: Array<{
      from: number;
      to: number;
      rate: number;
      taxOnBand: number;
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;
}

// PayslipGarnishment Entity
@Entity('payslip_garnishments')
export class PayslipGarnishment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, (payslip) => payslip.garnishments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  type: string; // ChildSupport, CourtOrder, TaxLevy, StudentLoan

  @Column({ nullable: true })
  courtRef: string;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'jsonb', nullable: true })
  capRules: any;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'jsonb', nullable: true })
  calcTrace: any;

  @CreateDateColumn()
  createdAt: Date;
}

// PayslipEmployerContribution Entity
@Entity('payslip_employer_contributions')
export class PayslipEmployerContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, (payslip) => payslip.employerContributions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  code: string; // ER_NI_A, PEN_ER, FUTA, UIF, SDL, NSITF, ITF, etc.

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'jsonb', nullable: true })
  calcTrace: any;

  @CreateDateColumn()
  createdAt: Date;
}

// PayslipAllowance Entity
@Entity('payslip_allowances')
export class PayslipAllowance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, (payslip) => payslip.allowances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  code: string; // HOUSING, TRANSPORT, MEAL, etc.

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  periodAmount: number;

  @Column({ type: 'boolean', default: false })
  taxable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  calcTrace: any;

  @CreateDateColumn()
  createdAt: Date;
}

// PayslipReimbursement Entity
@Entity('payslip_reimbursements')
export class PayslipReimbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payslipId: string;

  @ManyToOne(() => Payslip, (payslip) => payslip.reimbursements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payslipId' })
  payslip: Payslip;

  @Column()
  code: string; // EXP, MILEAGE, etc.

  @Column()
  label: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  periodAmount: number;

  @Column({ type: 'boolean', default: false })
  taxable: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
