import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClauseLibrary } from './clause-library.entity';

@Entity('contract_clauses')
export class ContractClause {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne('Contract', 'clauses')
  @JoinColumn({ name: 'contractId' })
  contract: any;

  @Column({ nullable: true })
  clauseLibraryId: string;

  @ManyToOne(() => ClauseLibrary, { nullable: true })
  @JoinColumn({ name: 'clauseLibraryId' })
  clauseLibrary: ClauseLibrary;

  @Column()
  clauseKey: string; // e.g., "CONFIDENTIALITY", "PAYMENT_TERMS", "TERMINATION"

  @Column()
  title: string;

  @Column('text')
  text: string; // The actual clause text

  @Column({ type: 'int', default: 0 })
  orderIndex: number; // Position in contract

  @Column({ default: false })
  isDeviation: boolean; // Deviation from standard template

  @Column('text', { nullable: true })
  deviationReason: string;

  @Column({ type: 'int', default: 0 })
  riskScore: number; // 0-10

  @Column({ nullable: true })
  riskCategory: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ default: false })
  requiresLegalApproval: boolean;

  @Column({ nullable: true })
  fallbackClauseId: string; // Reference to safer alternative clause

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
