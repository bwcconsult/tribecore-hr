import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ContractAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT_FOR_NEGOTIATION = 'SENT_FOR_NEGOTIATION',
  VERSION_CREATED = 'VERSION_CREATED',
  CLAUSE_ADDED = 'CLAUSE_ADDED',
  CLAUSE_MODIFIED = 'CLAUSE_MODIFIED',
  CLAUSE_REMOVED = 'CLAUSE_REMOVED',
  SIGNED = 'SIGNED',
  EXECUTED = 'EXECUTED',
  ACTIVATED = 'ACTIVATED',
  AMENDED = 'AMENDED',
  RENEWED = 'RENEWED',
  TERMINATED = 'TERMINATED',
  ARCHIVED = 'ARCHIVED',
  OBLIGATION_CREATED = 'OBLIGATION_CREATED',
  OBLIGATION_COMPLETED = 'OBLIGATION_COMPLETED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
  SHARED = 'SHARED',
  ACCESSED = 'ACCESSED',
  EXPORTED = 'EXPORTED',
}

@Entity('contract_audit_logs')
@Index(['contractId', 'createdAt'])
@Index(['actorId'])
@Index(['action'])
export class ContractAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @Column()
  actorId: string;

  @Column()
  actorName: string;

  @Column({
    type: 'enum',
    enum: ContractAuditAction,
  })
  action: ContractAuditAction;

  @Column({ nullable: true })
  targetType: string; // CONTRACT, CLAUSE, APPROVAL, OBLIGATION, etc.

  @Column({ nullable: true })
  targetId: string;

  @Column('simple-json', { nullable: true })
  before: Record<string, any>; // State before action

  @Column('simple-json', { nullable: true })
  after: Record<string, any>; // State after action

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
