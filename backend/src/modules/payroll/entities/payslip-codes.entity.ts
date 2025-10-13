import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// EarningCode Catalog
@Entity('earning_codes')
export class EarningCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // BASE, OT1, OT2, BONUS, COMMISSION, etc.

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  countries: string[]; // [UK, US, NG, ZA, etc.]

  @Column({ type: 'boolean', default: true })
  taxable: boolean;

  @Column({ type: 'boolean', default: false })
  niable: boolean;

  @Column({ type: 'boolean', default: true })
  pensionable: boolean;

  @Column({ type: 'boolean', default: false })
  isBonusType: boolean;

  @Column({ type: 'boolean', default: false })
  isOvertimeType: boolean;

  @Column({ nullable: true })
  defaultUnits: string; // hour, day, period

  @Column({ type: 'jsonb', nullable: true })
  glMapping: {
    [country: string]: {
      debitAccount: string;
      creditAccount: string;
      costCenter?: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  countryRules: {
    [country: string]: {
      taxable?: boolean;
      niable?: boolean;
      pensionable?: boolean;
      maxAmount?: number;
      notes?: string;
    };
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// DeductionCode Catalog
@Entity('deduction_codes')
export class DeductionCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // PEN_SS, PEN_401K, HSA, FSA, UNION, etc.

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  countries: string[];

  @Column({ type: 'boolean', default: false })
  isPreTax: boolean;

  @Column({ type: 'boolean', default: false })
  isStatutory: boolean; // e.g., pension, student loan

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  defaultRate: number; // %

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  defaultAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxAmount: number; // Annual or period cap

  @Column({ type: 'jsonb', nullable: true })
  glMapping: {
    [country: string]: {
      debitAccount: string;
      creditAccount: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  countryRules: {
    [country: string]: {
      isPreTax?: boolean;
      isMandatory?: boolean;
      rate?: number;
      cap?: number;
      notes?: string;
    };
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// TaxCode Catalog
@Entity('tax_codes')
export class TaxCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country: string; // UK, US, NG, ZA

  @Column()
  code: string; // PAYE, NI_A, FICA_SS, FICA_MED, StudentLoan, etc.

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  basis: string; // PAYE, NI, FICA, SL, PAYG

  @Column({ type: 'date' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ type: 'jsonb' })
  rateStructure: {
    type: 'flat' | 'progressive' | 'banded';
    bands?: Array<{
      from: number;
      to: number | null;
      rate: number;
      deduction?: number; // Fixed deduction per band
    }>;
    flatRate?: number;
    threshold?: number;
    cap?: number; // Max taxable amount
  };

  @Column({ type: 'jsonb', nullable: true })
  formula: {
    expression?: string; // e.g., "(taxableBase - threshold) * rate"
    variables?: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  glMapping: {
    debitAccount: string;
    creditAccount: string;
  };

  @Column({ type: 'text', nullable: true })
  legislationRef: string; // Link to tax authority guidance

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// BenefitPlan Catalog
@Entity('benefit_plans')
export class BenefitPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: string; // PENSION, HEALTH, DENTAL, LIFE, DISABILITY, etc.

  @Column()
  country: string;

  @Column({ type: 'boolean', default: false })
  isPreTax: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  employeeRate: number; // % of salary

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  employerRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  employeeFixedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  employerFixedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  annualCap: number;

  @Column({ type: 'jsonb', nullable: true })
  eligibilityRules: {
    minTenureMonths?: number;
    minAge?: number;
    maxAge?: number;
    employmentTypes?: string[]; // FT, PT, CONTRACT
  };

  @Column({ type: 'jsonb', nullable: true })
  glMapping: {
    employeeDebitAccount: string;
    employeeCreditAccount: string;
    employerDebitAccount: string;
    employerCreditAccount: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// PayslipTemplate Entity
@Entity('payslip_templates')
export class PayslipTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  legalEntityId: string; // For multi-brand

  @Column({ type: 'jsonb' })
  layout: {
    sections: Array<{
      id: string;
      label: string;
      type: 'earnings' | 'deductions' | 'taxes' | 'contributions' | 'allowances' | 'reimbursements' | 'leave' | 'messages';
      visible: boolean;
      order: number;
      columns?: string[]; // code, label, qty, rate, amount, etc.
    }>;
    showYTD: boolean;
    showLeaveBalances: boolean;
    showEmployerContributions: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  branding: {
    companyName?: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  footer: {
    text?: string;
    showQrCode?: boolean;
    showDisputeLink?: boolean;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// JurisdictionRule Entity (for compliance packs)
@Entity('jurisdiction_rules')
export class JurisdictionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  state: string; // For US states, NG states, etc.

  @Column()
  ruleType: string; // TAX, NI, FICA, PENSION, etc.

  @Column()
  code: string;

  @Column({ type: 'date' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ type: 'jsonb' })
  configuration: any; // Country-specific config

  @Column({ type: 'text', nullable: true })
  legislationVersion: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
