import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SeparationCase } from './separation-case.entity';

export enum TaskType {
  ACCESS_REVOKE = 'ACCESS_REVOKE',
  ASSET_RETURN = 'ASSET_RETURN',
  KNOWLEDGE_TRANSFER = 'KNOWLEDGE_TRANSFER',
  BENEFITS_TERMINATION = 'BENEFITS_TERMINATION',
  DOCUMENT_GENERATION = 'DOCUMENT_GENERATION',
  PAYROLL_NOTIFICATION = 'PAYROLL_NOTIFICATION',
  EXIT_INTERVIEW = 'EXIT_INTERVIEW',
  REFERENCE_REQUEST = 'REFERENCE_REQUEST',
  CUSTOM = 'CUSTOM',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED',
}

@Entity('separation_tasks')
export class SeparationTask extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => SeparationCase)
  @JoinColumn({ name: 'caseId' })
  case: SeparationCase;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: TaskType,
  })
  type: TaskType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  ownerId: string; // User ID responsible

  @Column({ nullable: true })
  ownerTeam: string; // IT, HR, Facilities, etc.

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'int', default: 1 })
  priority: number; // 1=high, 2=medium, 3=low

  @Column({ default: false })
  isBlocking: boolean; // Must complete before case closure

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ nullable: true })
  completedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  // Task-specific data
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    // For ACCESS_REVOKE
    systems?: string[];
    accountIds?: string[];
    
    // For ASSET_RETURN
    assetIds?: string[];
    assetTypes?: string[];
    returnLocation?: string;
    
    // For KNOWLEDGE_TRANSFER
    transferToEmployeeId?: string;
    documentsUrl?: string[];
    meetingsScheduled?: number;
    
    // For BENEFITS_TERMINATION
    benefitIds?: string[];
    effectiveEndDate?: string;
    
    // For DOCUMENT_GENERATION
    documentType?: string;
    templateId?: string;
    generatedUrl?: string;
    
    [key: string]: any;
  };

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    if (this.status === TaskStatus.COMPLETED || this.status === TaskStatus.CANCELLED) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  /**
   * Get days until due (negative if overdue)
   */
  getDaysUntilDue(): number {
    const now = new Date();
    const due = new Date(this.dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Mark as complete
   */
  complete(userId: string, notes?: string): void {
    this.status = TaskStatus.COMPLETED;
    this.completedBy = userId;
    this.completedAt = new Date();
    if (notes) this.completionNotes = notes;
  }
}
