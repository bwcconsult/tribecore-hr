import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CandidateSource {
  CAREER_SITE = 'CAREER_SITE',
  LINKEDIN = 'LINKEDIN',
  INDEED = 'INDEED',
  REFERRAL = 'REFERRAL',
  AGENCY = 'AGENCY',
  DIRECT_APPLICATION = 'DIRECT_APPLICATION',
  UNIVERSITY = 'UNIVERSITY',
  EVENT = 'EVENT',
}

export enum ConsentStatus {
  GIVEN = 'GIVEN',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
}

@Entity('candidates')
export class Candidate extends BaseEntity {
  @Column()
  organizationId: string;

  // PII (encrypted at rest)
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  // GDPR consent
  @Column({
    type: 'enum',
    enum: ConsentStatus,
    default: ConsentStatus.GIVEN,
  })
  consentStatus: ConsentStatus;

  @Column({ type: 'timestamp' })
  consentGivenAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  consentExpiresAt: Date; // Auto-delete after expiry

  // Source tracking
  @Column({
    type: 'enum',
    enum: CandidateSource,
  })
  source: CandidateSource;

  @Column({ nullable: true })
  sourceDetail: string; // Referrer name, agency name, event name

  @Column({ nullable: true })
  talentPoolId: string;

  // Profile
  @Column({ nullable: true })
  currentJobTitle: string;

  @Column({ nullable: true })
  currentCompany: string;

  @Column({ type: 'int', nullable: true })
  yearsExperience: number;

  @Column({ type: 'jsonb', default: [] })
  skills: string[];

  @Column({ type: 'jsonb', default: [] })
  languages: Array<{ language: string; proficiency: string }>;

  @Column({ nullable: true })
  currentLocation: string;

  @Column({ default: false })
  willingToRelocate: boolean;

  @Column({ default: false })
  requiresVisaSponsorship: boolean;

  // Salary expectations
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  expectedSalary: number;

  @Column({ length: 3, nullable: true })
  salaryCurrency: string;

  // Application history
  @Column({ type: 'int', default: 0 })
  applicationsCount: number;

  @Column({ type: 'int', default: 0 })
  interviewsCount: number;

  @Column({ type: 'int', default: 0 })
  offersCount: number;

  // Tags for search
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    resumeUrl?: string;
    coverLetterUrl?: string;
    portfolioFiles?: string[];
    educationHistory?: any[];
    workHistory?: any[];
    referenceContacts?: any[];
    [key: string]: any;
  };

  /**
   * Check if consent is valid
   */
  hasValidConsent(): boolean {
    if (this.consentStatus !== ConsentStatus.GIVEN) return false;
    if (!this.consentExpiresAt) return true;
    return new Date() < this.consentExpiresAt;
  }

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
