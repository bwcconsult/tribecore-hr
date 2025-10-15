import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { ContractClause } from './contract-clause.entity';
import { Approval } from './approval.entity';
import { NegotiationVersion } from './negotiation-version.entity';
import { Obligation } from './obligation.entity';
import { Renewal } from './renewal.entity';
import { Attachment } from './attachment.entity';
import { Dispute } from './dispute.entity';

export enum ContractType {
  EMPLOYMENT = 'EMPLOYMENT',
  OFFER_LETTER = 'OFFER_LETTER',
  NDA = 'NDA',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
  MSA = 'MSA', // Master Service Agreement
  SOW = 'SOW', // Statement of Work
  SLA = 'SLA', // Service Level Agreement
  LEASE = 'LEASE',
  PARTNERSHIP = 'PARTNERSHIP',
  LOAN = 'LOAN',
  INSURANCE = 'INSURANCE',
  IP_AGREEMENT = 'IP_AGREEMENT',
  CONSULTANT = 'CONSULTANT',
  ADDENDUM = 'ADDENDUM',
  AMENDMENT = 'AMENDMENT',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  INTERNAL_REVIEW = 'INTERNAL_REVIEW',
  COUNTERPARTY_REVIEW = 'COUNTERPARTY_REVIEW',
  AGREED = 'AGREED',
  E_SIGNATURE = 'E_SIGNATURE',
  EXECUTED = 'EXECUTED',
  ACTIVE = 'ACTIVE',
  AMENDMENT_IN_FLIGHT = 'AMENDMENT_IN_FLIGHT',
  RENEWAL_DUE = 'RENEWAL_DUE',
  TERMINATION_DUE = 'TERMINATION_DUE',
  TERMINATED = 'TERMINATED',
  ARCHIVED = 'ARCHIVED',
  HOLD = 'HOLD',
  DISPUTE = 'DISPUTE',
}

export enum DataCategory {
  PII = 'PII', // Personally Identifiable Information
  PHI = 'PHI', // Protected Health Information
  FINANCIAL = 'FINANCIAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  PUBLIC = 'PUBLIC',
}

@Entity('contracts')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'type'])
@Index(['ownerId'])
@Index(['counterpartyId'])
@Index(['endDate'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  contractNumber: string; // Auto-generated: CON-2025-00001

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Contract Details
  @Column({
    type: 'enum',
    enum: ContractType,
  })
  type: ContractType;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  // Parties
  @Column({ nullable: true })
  entityId: string; // Internal legal entity (if multi-entity org)

  @Column()
  counterpartyId: string; // Can be vendorId, customerId, or employeeId

  @Column()
  counterpartyName: string;

  @Column({ nullable: true })
  counterpartyEmail: string;

  @Column({ nullable: true })
  counterpartyType: string; // VENDOR, CUSTOMER, EMPLOYEE, PARTNER

  // Ownership
  @Column()
  ownerId: string; // Contract owner/manager

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  departmentId: string;

  // Financial
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  value: number;

  @Column({ default: 'GBP' })
  currency: string;

  @Column({ nullable: true })
  paymentTerms: string; // e.g., "Net 30", "Monthly", "Quarterly"

  @Column({ nullable: true })
  billingCycle: string; // MONTHLY, QUARTERLY, ANNUALLY, ONE_TIME

  // Dates
  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  noticeDate: Date; // Date by which renewal notice must be given

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ nullable: true })
  renewalTerm: string; // e.g., "12 months", "1 year"

  // Legal
  @Column({ nullable: true })
  jurisdiction: string; // UK, US-NY, EU, etc.

  @Column({ nullable: true })
  governingLaw: string;

  @Column('simple-array', { nullable: true })
  dataCategories: string[]; // [PII, FINANCIAL]

  @Column({ default: false })
  requiresDPIA: boolean; // Data Protection Impact Assessment

  @Column({ default: false })
  requiresSCC: boolean; // Standard Contractual Clauses (for EU data)

  // Status & Workflow
  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  supersedesId: string; // Previous version contract ID

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'supersedesId' })
  supersedes: Contract;

  // Risk & Compliance
  @Column({ type: 'int', default: 0 })
  riskScore: number; // 0-100

  @Column('simple-json', { nullable: true })
  riskFlags: string[]; // ['HIGH_VALUE', 'DATA_TRANSFER', 'NON_STANDARD_CLAUSE']

  @Column({ default: false })
  requiresLegalReview: boolean;

  @Column({ default: false })
  requiresFinanceApproval: boolean;

  @Column({ default: false })
  requiresCISOApproval: boolean;

  @Column({ default: false })
  requiresDPOApproval: boolean; // Data Protection Officer

  // E-Signature
  @Column({ nullable: true })
  signatureProvider: string; // DOCUSIGN, ADOBE_SIGN, HELLOSIGN

  @Column({ nullable: true })
  envelopeId: string; // External e-signature platform envelope ID

  @Column({ nullable: true })
  documentHash: string; // SHA-256 hash of final signed document

  @Column({ nullable: true })
  signedCertificateUrl: string; // URL to certificate of completion

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  // Storage
  @Column({ nullable: true })
  repositoryUrl: string; // URL to document in cloud storage

  @Column({ nullable: true })
  draftUrl: string; // URL to draft version

  // Metadata
  @Column('simple-json', { nullable: true })
  customFields: Record<string, any>; // Flexible additional data

  @Column('simple-array', { nullable: true })
  tags: string[];

  // Audit
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  submittedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  executedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @Column({ nullable: true })
  terminatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  terminatedAt: Date;

  @Column('text', { nullable: true })
  terminationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ContractClause, (clause) => clause.contract)
  clauses: ContractClause[];

  @OneToMany(() => Approval, (approval) => approval.contract)
  approvals: Approval[];

  @OneToMany(() => NegotiationVersion, (version) => version.contract)
  versions: NegotiationVersion[];

  @OneToMany(() => Obligation, (obligation) => obligation.contract)
  obligations: Obligation[];

  @OneToMany(() => Renewal, (renewal) => renewal.contract)
  renewals: Renewal[];

  @OneToMany(() => Attachment, (attachment) => attachment.contract)
  attachments: Attachment[];

  @OneToMany(() => Dispute, (dispute) => dispute.contract)
  disputes: Dispute[];
}
