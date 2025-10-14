import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum JourneyType {
  NEW_HIRE = 'NEW_HIRE',
  PARENTAL_LEAVE = 'PARENTAL_LEAVE',
  RETURN_FROM_LEAVE = 'RETURN_FROM_LEAVE',
  RELOCATION = 'RELOCATION',
  PROMOTION = 'PROMOTION',
  ROLE_CHANGE = 'ROLE_CHANGE',
  SICK_LEAVE = 'SICK_LEAVE',
  BEREAVEMENT = 'BEREAVEMENT',
  RETIREMENT_PREP = 'RETIREMENT_PREP',
  OFFBOARDING = 'OFFBOARDING',
  CUSTOM = 'CUSTOM',
}

export enum JourneyStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

/**
 * Employee Journey Entity
 * Guided workflows for "moments that matter" in employee lifecycle
 */
@Entity('employee_journeys')
@Index(['organizationId', 'status'])
@Index(['employeeId', 'journeyType'])
export class EmployeeJourney extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Journey identification
  @Column({ unique: true })
  @Index()
  journeyId: string; // JOURNEY-2025-0001

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: JourneyType,
  })
  @Index()
  journeyType: JourneyType;

  @Column({
    type: 'enum',
    enum: JourneyStatus,
    default: JourneyStatus.NOT_STARTED,
  })
  @Index()
  status: JourneyStatus;

  // Employee
  @Column()
  @Index()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Dates
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedEndDate?: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate?: Date;

  @Column({ type: 'date', nullable: true })
  pausedDate?: Date;

  // Milestones & tasks
  @Column({ type: 'jsonb', nullable: true })
  milestones?: Array<{
    id: string;
    name: string;
    description?: string;
    dueDate?: string;
    completedDate?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    assignedTo?: string;
    order: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    category: string; // 'HR', 'IT', 'MANAGER', 'EMPLOYEE'
    assignedTo?: string;
    assignedToRole?: string;
    dueDate?: string;
    completedDate?: string;
    completedBy?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    mandatory: boolean;
    order: number;
    metadata?: Record<string, any>;
  }>;

  // Progress tracking
  @Column({ type: 'int', default: 0 })
  totalTasks: number;

  @Column({ type: 'int', default: 0 })
  completedTasks: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  // Support & resources
  @Column({ type: 'simple-array', nullable: true })
  resources?: string[]; // URLs to knowledge articles, guides

  @Column({ type: 'simple-array', nullable: true })
  contacts?: string[]; // User IDs for journey support

  @Column({ nullable: true })
  buddyId?: string; // Buddy/mentor assigned

  @Column({ nullable: true })
  coachId?: string; // HR coach assigned

  // Communications
  @Column({ type: 'jsonb', nullable: true })
  communications?: Array<{
    id: string;
    type: string; // 'EMAIL', 'NOTIFICATION', 'SMS'
    subject: string;
    sentTo: string[];
    sentAt: string;
    template?: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  automatedNotifications?: string[]; // Scheduled notification IDs

  // Feedback
  @Column({ type: 'int', nullable: true })
  satisfactionScore?: number; // 1-5

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ nullable: true, type: 'timestamp' })
  feedbackCollectedAt?: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

/**
 * Journey Template Entity
 * Reusable journey templates for different scenarios
 */
@Entity('journey_templates')
@Index(['organizationId', 'journeyType'])
export class JourneyTemplate extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: JourneyType,
  })
  journeyType: JourneyType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean; // Default template for this journey type

  // Template structure
  @Column({ type: 'int', nullable: true })
  durationDays?: number;

  @Column({ type: 'jsonb' })
  milestones: Array<{
    name: string;
    description?: string;
    daysFromStart: number;
    order: number;
  }>;

  @Column({ type: 'jsonb' })
  tasks: Array<{
    title: string;
    description?: string;
    category: string;
    assignedToRole: string; // 'HR', 'MANAGER', 'EMPLOYEE', 'IT'
    daysFromStart: number;
    mandatory: boolean;
    order: number;
    metadata?: Record<string, any>;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  resources?: string[];

  @Column({ type: 'jsonb', nullable: true })
  automatedCommunications?: Array<{
    type: string;
    templateId: string;
    sendTrigger: string; // 'JOURNEY_START', 'MILESTONE_COMPLETE', 'DAYS_BEFORE_END'
    sendToRole: string[];
    daysFromStart?: number;
  }>;

  // Metadata
  @Column()
  createdBy: string;

  @Column({ nullable: true })
  lastModifiedBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
