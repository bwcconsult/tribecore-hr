import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Currency } from '../../../common/enums';

@Entity('salary_structures')
export class SalaryStructure extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  annualSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.GBP })
  currency: Currency;

  @Column()
  payFrequency: string; // MONTHLY, BIWEEKLY, WEEKLY, DAILY

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  // Allowances (Taxable/Non-taxable)
  @Column({ type: 'jsonb', nullable: true })
  allowances?: {
    housing?: { amount: number; taxable: boolean };
    transport?: { amount: number; taxable: boolean };
    meal?: { amount: number; taxable: boolean };
    education?: { amount: number; taxable: boolean };
    internet?: { amount: number; taxable: boolean };
    phone?: { amount: number; taxable: boolean };
    car?: { amount: number; taxable: boolean };
    other?: Array<{ name: string; amount: number; taxable: boolean }>;
  };

  // Bonuses
  @Column({ type: 'jsonb', nullable: true })
  bonuses?: {
    performance?: number;
    annual?: number;
    signing?: number;
    retention?: number;
    commission?: number;
  };

  // Deductions
  @Column({ type: 'jsonb', nullable: true })
  deductions?: {
    loan?: number;
    advance?: number;
    fine?: number;
    union?: number;
    equipment?: number;
    other?: Array<{ name: string; amount: number }>;
  };

  // Tax Configuration
  @Column()
  taxCountry: string; // UK, US, NG, ZA, etc.

  @Column({ nullable: true })
  taxState?: string; // For US, Nigeria states

  @Column({ nullable: true })
  taxCode?: string; // UK tax code, e.g., 1257L

  @Column({ type: 'boolean', default: false })
  taxExempt: boolean;

  // Pension/Retirement
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pensionEmployeePercent?: number; // e.g., 5%

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pensionEmployerPercent?: number; // e.g., 3%

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pensionFixedAmount?: number;

  // Benefits
  @Column({ type: 'boolean', default: false })
  healthInsurance: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  healthInsurancePremium?: number;

  // Bank Details
  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  accountNumber?: string;

  @Column({ nullable: true })
  routingNumber?: string; // US

  @Column({ nullable: true })
  sortCode?: string; // UK

  @Column({ nullable: true })
  iban?: string; // EU

  @Column({ nullable: true })
  swiftCode?: string;

  // Payment Preferences
  @Column({ type: 'enum', enum: Currency, nullable: true })
  preferredPaymentCurrency?: Currency;

  @Column({ nullable: true })
  paymentMethod?: string; // BANK_TRANSFER, CHECK, CASH, CRYPTO

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
