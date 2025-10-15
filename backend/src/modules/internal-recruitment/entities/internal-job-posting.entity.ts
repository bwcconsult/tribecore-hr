import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum JobType {
  TRANSFER = 'TRANSFER',
  PROMOTION = 'PROMOTION',
  LATERAL_MOVE = 'LATERAL_MOVE',
  DEVELOPMENTAL = 'DEVELOPMENTAL',
  TEMPORARY = 'TEMPORARY',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum VisibilityLevel {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  SPECIFIC_DEPARTMENTS = 'SPECIFIC_DEPARTMENTS',
  SPECIFIC_LEVELS = 'SPECIFIC_LEVELS',
  HIGH_POTENTIAL_ONLY = 'HIGH_POTENTIAL_ONLY',
  INVITE_ONLY = 'INVITE_ONLY',
}

@Entity('internal_job_postings')
@Index(['organizationId'])
@Index(['departmentId'])
@Index(['status'])
@Index(['postedDate'])
export class InternalJobPosting extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  jobTitle: string;

  @Column()
  jobCode: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column()
  departmentId: string;

  @Column()
  departmentName: string;

  @Column({ nullable: true })
  teamId: string;

  @Column({ nullable: true })
  teamName: string;

  @Column()
  locationId: string;

  @Column()
  locationName: string;

  @Column({ nullable: true })
  reportingToEmployeeId: string;

  @Column({ nullable: true })
  reportingToName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'jsonb' })
  requiredSkills: Array<{
    skillId: string;
    skillName: string;
    proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    isRequired: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  preferredSkills: string[];

  @Column({ type: 'int', nullable: true })
  minYearsExperience: number;

  @Column({ type: 'int', nullable: true })
  minCurrentTenure: number; // Months in current role

  @Column({ nullable: true })
  minPerformanceRating: string; // e.g., 'Meets Expectations'

  @Column({ type: 'jsonb', nullable: true })
  eligibilityCriteria: {
    minGradeLevel?: string;
    maxGradeLevel?: string;
    eligibleDepartments?: string[];
    eligibleLocations?: string[];
    requireManagerApproval?: boolean;
  };

  @Column({
    type: 'enum',
    enum: VisibilityLevel,
    default: VisibilityLevel.ALL_EMPLOYEES,
  })
  visibilityLevel: VisibilityLevel;

  @Column({ type: 'jsonb', nullable: true })
  targetAudience: {
    departmentIds?: string[];
    gradeLevels?: string[];
    specificEmployeeIds?: string[];
  };

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  salaryCurrency: string;

  @Column({ nullable: true })
  gradeLevel: string;

  @Column({ type: 'boolean', default: false })
  isRemote: boolean;

  @Column({ type: 'boolean', default: false })
  isHybrid: boolean;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  postedDate: Date;

  @Column({ type: 'date', nullable: true })
  closingDate: Date;

  @Column()
  postedBy: string;

  @Column({ nullable: true })
  hiringManagerId: string;

  @Column({ nullable: true })
  hiringManagerName: string;

  @Column({ type: 'int', default: 1 })
  numberOfOpenings: number;

  @Column({ type: 'int', default: 0 })
  applicationCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'boolean', default: true })
  requireManagerApproval: boolean;

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'boolean', default: false })
  isSuccessionFill: boolean;

  @Column({ nullable: true })
  successionPlanId: string;

  @Column({ type: 'jsonb', nullable: true })
  applicationProcess: {
    steps: Array<{
      step: number;
      name: string;
      description: string;
      requiresApproval: boolean;
      approverRole?: string;
    }>;
    estimatedTimeToFill: number; // days
  };

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ type: 'jsonb', nullable: true })
  developmentOpportunities: string[];

  @Column({ type: 'text', nullable: true })
  reasonForOpening: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    careerPathId?: string;
    isPromotionOpportunity?: boolean;
    isDevelopmentalRole?: boolean;
    rotationDuration?: number; // months
    [key: string]: any;
  };
}
