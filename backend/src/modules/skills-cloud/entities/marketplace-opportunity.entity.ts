import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum OpportunityType {
  PROJECT = 'PROJECT',
  GIG = 'GIG',
  MENTORSHIP = 'MENTORSHIP',
  STRETCH_ASSIGNMENT = 'STRETCH_ASSIGNMENT',
  ROTATION = 'ROTATION',
}

export enum OpportunityStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity('marketplace_opportunities')
export class MarketplaceOpportunity extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column({ unique: true })
  opportunityId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: OpportunityType,
  })
  opportunityType: OpportunityType;

  @Column({
    type: 'enum',
    enum: OpportunityStatus,
    default: OpportunityStatus.OPEN,
  })
  @Index()
  status: OpportunityStatus;

  @Column({ type: 'simple-array' })
  requiredSkills: string[]; // Skill IDs

  @Column({ type: 'simple-array', nullable: true })
  optionalSkills?: string[];

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'int', nullable: true })
  durationWeeks?: number;

  @Column({ type: 'int', nullable: true })
  commitmentPercentage?: number; // 25% = 1 day/week

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column()
  postedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  postedAt: Date;

  @Column({ nullable: true })
  assignedTo?: string; // Employee ID

  @Column({ type: 'int', default: 0 })
  applicantCount: number;

  @Column({ type: 'jsonb', nullable: true })
  benefits?: string[]; // 'Skill development', 'Networking', 'Visibility'

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
