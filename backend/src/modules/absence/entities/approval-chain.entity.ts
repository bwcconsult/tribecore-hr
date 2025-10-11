import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AbsenceRequest } from './absence-request.entity';

export enum ApprovalLevel {
  LEVEL_1 = 'LEVEL_1', // Manager
  LEVEL_2 = 'LEVEL_2', // Department Head
  LEVEL_3 = 'LEVEL_3', // HR
  LEVEL_4 = 'LEVEL_4', // Finance/CEO
}

export enum ApprovalStepStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
}

/**
 * ApprovalChain Entity
 * Tracks multi-level approval process for absence requests
 */
@Entity('approval_chains')
@Index(['absenceRequestId', 'level'])
export class ApprovalChain extends BaseEntity {
  @Column()
  @Index()
  absenceRequestId: string;

  @ManyToOne(() => AbsenceRequest)
  @JoinColumn({ name: 'absenceRequestId' })
  absenceRequest?: AbsenceRequest;

  @Column({
    type: 'enum',
    enum: ApprovalLevel,
  })
  @Index()
  level: ApprovalLevel;

  @Column()
  sequence: number; // Order in which approvals must happen

  @Column()
  @Index()
  approverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approverId' })
  approver?: User;

  @Column({ nullable: true })
  approverRole?: string; // Role of approver (MANAGER, HR_MANAGER, etc.)

  @Column({
    type: 'enum',
    enum: ApprovalStepStatus,
    default: ApprovalStepStatus.PENDING,
  })
  @Index()
  status: ApprovalStepStatus;

  @Column({ nullable: true })
  actionAt?: Date;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ default: false })
  isRequired: boolean; // If false, can be skipped

  @Column({ default: false })
  canDelegate: boolean; // Can this approver delegate to someone else?

  @Column({ nullable: true })
  delegatedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'delegatedToId' })
  delegatedTo?: User;

  // Conditional approval
  @Column({ type: 'jsonb', nullable: true })
  conditions?: {
    minDays?: number; // Only required if request is X days or more
    maxDays?: number;
    planTypes?: string[]; // Only for specific plan types
    thresholdAmount?: number; // For expense approvals
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
