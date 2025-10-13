import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVIEWED = 'REVIEWED',
  ARCHIVED = 'ARCHIVED',
  EXPORTED = 'EXPORTED',
  ACCESSED = 'ACCESSED',
}

export enum AuditModule {
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  INCIDENT = 'INCIDENT',
  NEAR_MISS = 'NEAR_MISS',
  HAZARDOUS_SUBSTANCE = 'HAZARDOUS_SUBSTANCE',
  METHOD_STATEMENT = 'METHOD_STATEMENT',
  RESPONSIBILITY = 'RESPONSIBILITY',
  TRAINING = 'TRAINING',
  INSPECTION = 'INSPECTION',
}

@Entity('hs_audit_logs')
export class HSAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: AuditModule,
  })
  module: AuditModule;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  entityType: string;

  @Column()
  performedBy: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
