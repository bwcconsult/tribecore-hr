import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Country, Currency } from '../../../common/enums';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true, nullable: true })
  registrationNumber?: string;

  @Column({ unique: true, nullable: true })
  taxId?: string;

  @Column({
    type: 'enum',
    enum: Country,
    default: Country.UK,
  })
  country: Country;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.GBP,
  })
  currency: Currency;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    // Employee Settings
    employeeIdPrefix?: string; // e.g., "EMP-", "TC-", "STAFF-"
    workLocations?: string[]; // Configurable work locations
    departments?: string[]; // Configurable departments
    jobLevels?: string[]; // Configurable job levels/grades
    employmentTypes?: string[]; // Configurable employment types
    
    // Payroll Settings
    payroll?: {
      frequency?: string;
      paymentDay?: number;
    };
    
    // Leave Settings
    leave?: {
      annualLeaveDefault?: number;
      sickLeaveDefault?: number;
    };
    
    // Onboarding Settings
    onboardingChecklist?: Array<{
      id: string;
      title: string;
      description?: string;
      category?: string;
      daysToComplete?: number;
      isRequired: boolean;
      order: number;
    }>;
    
    // Compliance Settings
    compliance?: {
      gdprEnabled?: boolean;
      dataRetentionDays?: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
