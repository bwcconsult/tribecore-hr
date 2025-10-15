import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ClientTier {
  STANDARD = 'Standard',
  PROFESSIONAL = 'Professional',
  ENTERPRISE = 'Enterprise',
}

@Entity('client_accounts')
export class ClientAccount extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ClientTier,
    default: ClientTier.STANDARD,
  })
  tier: ClientTier;

  @Column()
  region: string; // US, EU, UK, APAC, etc.

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  crmId: string; // Reference to CRM system (Salesforce, HubSpot, etc.)

  @Column({ nullable: true })
  successManagerId: string; // CSM user ID

  @Column({ default: 'USD' })
  billingCurrency: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => require('./client-contact.entity').ClientContact, contact => contact.account)
  contacts: any[];

  @OneToMany(() => require('./client-onboarding-case.entity').ClientOnboardingCase, onboardingCase => onboardingCase.account)
  onboardingCases: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    salesforceAccountId?: string;
    hubspotCompanyId?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    mrr?: number;
    arr?: number;
    [key: string]: any;
  };
}
