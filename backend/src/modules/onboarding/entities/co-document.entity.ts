import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CODocumentType {
  DPA = 'DPA', // Data Processing Agreement
  MSA = 'MSA', // Master Service Agreement
  SOW = 'SOW', // Statement of Work
  CERT = 'Cert', // Security Certificate
  RUNBOOK = 'Runbook',
  SCC = 'SCC', // Standard Contractual Clauses
  DPIA = 'DPIA', // Data Protection Impact Assessment
  PEN_TEST = 'PenTest',
  OTHER = 'Other',
}

@Entity('co_documents')
export class CODocument extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => require('./client-onboarding-case.entity').ClientOnboardingCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: any;

  @Column({
    type: 'enum',
    enum: CODocumentType,
  })
  type: CODocumentType;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @Column({ nullable: true })
  signedBy: string; // Client contact or internal user

  @Column({ nullable: true })
  verifiedBy: string; // Internal user who verified

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    version?: string;
    tags?: string[];
    category?: string;
    [key: string]: any;
  };
}
