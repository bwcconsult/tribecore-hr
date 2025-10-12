import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum BenefitType {
  HEALTH = 'HEALTH',
  DENTAL = 'DENTAL',
  RETIREMENT = 'RETIREMENT',
  EDUCATION = 'EDUCATION',
}

export enum BenefitStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('benefit_plans')
export class BenefitPlan extends BaseEntity {
  @Column()
  organizationId: string; // Benefits are organization-specific

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: BenefitType,
  })
  type: BenefitType;

  @Column('simple-array')
  coverageOptions: string[];

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  employeeCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  employerCost: number;

  @Column({ default: 'GBP' })
  currency: string;

  @Column({ default: true })
  active: boolean;
}

@Entity('benefit_enrollments')
export class BenefitEnrollment extends BaseEntity {
  @Column()
  employeeId: string;

  @Column()
  benefitPlanId: string;

  @ManyToOne(() => BenefitPlan)
  @JoinColumn({ name: 'benefitPlanId' })
  benefitPlan: BenefitPlan;

  @Column({ type: 'timestamp' })
  enrollmentDate: Date;

  @Column({ type: 'timestamp' })
  effectiveDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column()
  coverageLevel: string;

  @Column({ default: 0 })
  dependents: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  employeeCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  employerCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalCost: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: BenefitStatus,
    default: BenefitStatus.ACTIVE,
  })
  status: BenefitStatus;
}
