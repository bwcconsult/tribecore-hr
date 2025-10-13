import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WhistleblowingCategory {
  CRIMINAL_OFFENCE = 'CRIMINAL_OFFENCE',
  BREACH_OF_LEGAL_OBLIGATION = 'BREACH_OF_LEGAL_OBLIGATION',
  MISCARRIAGE_OF_JUSTICE = 'MISCARRIAGE_OF_JUSTICE',
  DANGER_TO_HEALTH_SAFETY = 'DANGER_TO_HEALTH_SAFETY',
  ENVIRONMENTAL_DAMAGE = 'ENVIRONMENTAL_DAMAGE',
  COVER_UP = 'COVER_UP',
  FINANCIAL_MISCONDUCT = 'FINANCIAL_MISCONDUCT',
  DISCRIMINATION = 'DISCRIMINATION',
}

export enum WhistleblowingStatus {
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  INVESTIGATION_COMPLETE = 'INVESTIGATION_COMPLETE',
  ACTION_TAKEN = 'ACTION_TAKEN',
  NO_ACTION_REQUIRED = 'NO_ACTION_REQUIRED',
  CLOSED = 'CLOSED',
}

@Entity('whistleblowing_cases')
export class WhistleblowingCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  caseNumber: string;

  @Column({ nullable: true })
  reporterId: string; // Can be anonymous

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({
    type: 'enum',
    enum: WhistleblowingCategory,
  })
  category: WhistleblowingCategory;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'text' })
  disclosure: string;

  @Column({ type: 'text', nullable: true })
  publicInterestRationale: string;

  @Column({ type: 'simple-array', nullable: true })
  individualsInvolved: string[];

  @Column({ type: 'simple-array', nullable: true })
  departments: string[];

  @Column({
    type: 'enum',
    enum: WhistleblowingStatus,
    default: WhistleblowingStatus.SUBMITTED,
  })
  status: WhistleblowingStatus;

  @Column({ type: 'date', nullable: true })
  acknowledgedDate: Date;

  @Column({ nullable: true })
  investigator: string;

  @Column({ type: 'date', nullable: true })
  investigationStartDate: Date;

  @Column({ type: 'date', nullable: true })
  investigationEndDate: Date;

  @Column({ type: 'text', nullable: true })
  investigationFindings: string;

  @Column({ type: 'text', nullable: true })
  actionsTaken: string;

  @Column({ default: false })
  substantiated: boolean;

  @Column({ default: false })
  reportedToAuthorities: boolean;

  @Column({ type: 'simple-array', nullable: true })
  authoritiesNotified: string[];

  @Column({ type: 'date', nullable: true })
  authorityReportDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  protectionMeasures: Array<{
    measure: string;
    implementedDate: Date;
    description: string;
  }>;

  @Column({ default: false })
  retaliationReported: boolean;

  @Column({ type: 'text', nullable: true })
  retaliationDetails: string;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    date: Date;
    event: string;
    description: string;
    performedBy: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
