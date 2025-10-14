import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SeparationCase } from './separation-case.entity';

export enum DeprovisionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

@Entity('access_deprovisions')
export class AccessDeprovision extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => SeparationCase)
  @JoinColumn({ name: 'caseId' })
  case: SeparationCase;

  @Column()
  organizationId: string;

  @Column()
  system: string; // Okta, G Suite, Slack, GitHub, AWS, etc.

  @Column()
  accountId: string;

  @Column({ nullable: true })
  accountEmail: string;

  @Column({
    type: 'enum',
    enum: DeprovisionStatus,
    default: DeprovisionStatus.PENDING,
  })
  status: DeprovisionStatus;

  @Column({ type: 'timestamp', nullable: true })
  initiatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  initiatedBy: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'jsonb', nullable: true })
  actions: Array<{
    action: 'DISABLE' | 'DELETE' | 'ARCHIVE' | 'TRANSFER_OWNERSHIP' | 'REVOKE_TOKENS';
    performedAt: Date;
    result: 'SUCCESS' | 'FAILED';
    details: string;
  }>;
}
