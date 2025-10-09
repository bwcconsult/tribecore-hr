import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum BenefitType {
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  DENTAL_INSURANCE = 'DENTAL_INSURANCE',
  VISION_INSURANCE = 'VISION_INSURANCE',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  RETIREMENT_401K = 'RETIREMENT_401K',
  PENSION = 'PENSION',
  STOCK_OPTIONS = 'STOCK_OPTIONS',
  GYM_MEMBERSHIP = 'GYM_MEMBERSHIP',
  EDUCATION_ALLOWANCE = 'EDUCATION_ALLOWANCE',
  TRANSPORTATION = 'TRANSPORTATION',
  MEAL_ALLOWANCE = 'MEAL_ALLOWANCE',
  REMOTE_WORK_STIPEND = 'REMOTE_WORK_STIPEND',
  WELLNESS_PROGRAM = 'WELLNESS_PROGRAM',
  CHILDCARE = 'CHILDCARE',
  OTHER = 'OTHER',
}

export enum BenefitStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

@Entity('benefits')
export class Benefit extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: BenefitType,
  })
  type: BenefitType;

  @Column({
    type: 'enum',
    enum: BenefitStatus,
    default: BenefitStatus.ACTIVE,
  })
  status: BenefitStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  employerCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  employeeCost?: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  policyNumber?: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  eligibility?: {
    minTenureMonths?: number;
    employmentTypes?: string[];
    departments?: string[];
    countries?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  coverage?: {
    coverageAmount?: number;
    deductible?: number;
    coinsurance?: number;
    dependents?: boolean;
    maxAge?: number;
  };

  @Column({ type: 'text', nullable: true })
  terms?: string;

  @Column({ type: 'jsonb', nullable: true })
  documents?: string[];
}

@Entity('employee_benefits')
export class EmployeeBenefit extends BaseEntity {
  @Column()
  employeeId: string;

  @Column()
  benefitId: string;

  @ManyToOne(() => Benefit)
  @JoinColumn({ name: 'benefitId' })
  benefit: Benefit;

  @Column({ type: 'date' })
  enrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({
    type: 'enum',
    enum: BenefitStatus,
    default: BenefitStatus.PENDING,
  })
  status: BenefitStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  employeeContribution: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  employerContribution: number;

  @Column({ type: 'jsonb', nullable: true })
  dependents?: Array<{
    name: string;
    relationship: string;
    dateOfBirth: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  elections?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
