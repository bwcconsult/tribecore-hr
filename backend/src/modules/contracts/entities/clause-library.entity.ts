import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ClauseCategory {
  GENERAL = 'GENERAL',
  CONFIDENTIALITY = 'CONFIDENTIALITY',
  PAYMENT = 'PAYMENT',
  TERMINATION = 'TERMINATION',
  LIABILITY = 'LIABILITY',
  INDEMNITY = 'INDEMNITY',
  IP_RIGHTS = 'IP_RIGHTS',
  DATA_PROTECTION = 'DATA_PROTECTION',
  WARRANTY = 'WARRANTY',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  GOVERNING_LAW = 'GOVERNING_LAW',
  FORCE_MAJEURE = 'FORCE_MAJEURE',
  NON_COMPETE = 'NON_COMPETE',
  NON_SOLICITATION = 'NON_SOLICITATION',
}

@Entity('clause_library')
@Index(['organizationId', 'category'])
@Index(['organizationId', 'isActive'])
export class ClauseLibrary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  key: string; // Unique identifier: CONFIDENTIALITY_STANDARD_UK

  @Column()
  title: string;

  @Column('text')
  text: string; // Template clause text with merge fields

  @Column({
    type: 'enum',
    enum: ClauseCategory,
  })
  category: ClauseCategory;

  @Column({ nullable: true })
  jurisdiction: string; // UK, US-NY, EU

  @Column({ type: 'int', default: 0 })
  riskScore: number; // 0-10, lower is safer

  @Column({ default: 'MEDIUM' })
  riskLevel: string; // LOW, MEDIUM, HIGH

  @Column({ default: true })
  isStandard: boolean; // Pre-approved by legal

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  fallbackClauseId: string; // Safer alternative

  @Column('simple-array', { nullable: true })
  applicableContractTypes: string[]; // [EMPLOYMENT, VENDOR, NDA]

  @Column('text', { nullable: true })
  notes: string; // Legal notes or guidance

  @Column('simple-array', { nullable: true })
  mergeFields: string[]; // [{{PARTY_NAME}}, {{EFFECTIVE_DATE}}]

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
