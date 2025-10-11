import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

export enum ChecklistCategory {
  ONBOARDING = 'ONBOARDING',
  OFFBOARDING = 'OFFBOARDING',
  RETURN_TO_WORK = 'RETURN_TO_WORK',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
  TRAINING = 'TRAINING',
  COMPLIANCE = 'COMPLIANCE',
  CUSTOM = 'CUSTOM',
}

/**
 * Checklist Entity
 * Template for structured task workflows
 */
@Entity('checklists')
export class Checklist extends BaseEntity {
  @Column()
  @Index()
  name: string; // "Employee Onboarding", "Manager RTW Interview"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ChecklistCategory,
  })
  @Index()
  category: ChecklistCategory;

  @Column({ default: false })
  isTemplate: boolean; // Template vs instance

  @Column({ nullable: true })
  templateId?: string; // Reference to parent template if this is an instance

  // Visibility & Access
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.HR_MANAGER, UserRole.MANAGER],
  })
  visibleToRoles: UserRole[];

  @Column({ default: true })
  isActive: boolean;

  // Items count (denormalized for performance)
  @Column({ default: 0 })
  totalItems: number;

  @Column({ default: 0 })
  completedItems: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  // Audit
  @Column({ nullable: true })
  createdByUserId?: string;

  @Column({ nullable: true })
  modifiedByUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

/**
 * ChecklistItem Entity
 * Individual items within a checklist
 */
@Entity('checklist_items')
@Index(['checklistId', 'sequence'])
export class ChecklistItem extends BaseEntity {
  @Column()
  @Index()
  checklistId: string;

  @Column()
  title: string; // "Provide laptop and access", "Schedule first 1:1"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 1 })
  sequence: number; // Order within checklist

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedByUserId?: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  completionNotes?: string;

  // Dependencies
  @Column({ type: 'simple-array', nullable: true })
  dependsOnItemIds?: string[]; // Must complete these items first

  // Due date (relative or absolute)
  @Column({ nullable: true })
  dueInDays?: number; // Due X days after checklist start

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  // Assignment
  @Column({ nullable: true })
  assignedToUserId?: string;

  @Column({ nullable: true })
  assignedToRole?: string; // Or assign by role (HR, Manager, etc.)

  // Optional/Mandatory
  @Column({ default: true })
  isRequired: boolean;

  // Attachments
  @Column({ type: 'simple-array', nullable: true })
  attachmentIds?: string[];

  // Related Task
  @Column({ nullable: true })
  relatedTaskId?: string; // Link to Task entity if task created

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
