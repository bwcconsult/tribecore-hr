import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
  FILLED = 'FILLED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum ApplicationStatus {
  NEW = 'NEW',
  SCREENING = 'SCREENING',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  HIRED = 'HIRED',
}

@Entity('jobs')
export class Job extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  department: string;

  @Column()
  location: string;

  @Column({ default: false })
  isRemote: boolean;

  @Column({
    type: 'enum',
    enum: EmploymentType,
  })
  employmentType: EmploymentType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMin?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMax?: number;

  @Column({ nullable: true })
  salaryCurrency?: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({ type: 'int', default: 1 })
  openings: number;

  @Column({ type: 'date', nullable: true })
  publishedDate?: Date;

  @Column({ type: 'date', nullable: true })
  closingDate?: Date;

  @Column({ nullable: true })
  hiringManager?: string;

  @Column({ type: 'jsonb', nullable: true })
  requirements?: {
    education?: string[];
    experience?: string;
    skills?: string[];
    certifications?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  responsibilities?: string[];

  @Column({ type: 'jsonb', nullable: true })
  benefits?: string[];

  @Column({ type: 'jsonb', nullable: true })
  interviewProcess?: Array<{
    stage: string;
    description: string;
    duration?: number;
  }>;

  @Column({ type: 'int', default: 0 })
  applicationsCount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('job_applications')
export class JobApplication extends BaseEntity {
  @Column()
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  resumeUrl?: string;

  @Column({ nullable: true })
  coverLetterUrl?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  linkedInUrl?: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.NEW,
  })
  status: ApplicationStatus;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'jsonb', nullable: true })
  answers?: Record<string, any>;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  referredBy?: string;

  @Column({ nullable: true })
  currentCompany?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  currentSalary?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  expectedSalary?: number;

  @Column({ type: 'int', nullable: true })
  noticePeriodDays?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  interviews?: Array<{
    date: Date;
    interviewer: string;
    type: string;
    feedback?: string;
    rating?: number;
  }>;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ type: 'date', nullable: true })
  offerDate?: Date;

  @Column({ type: 'date', nullable: true })
  offerAcceptedDate?: Date;
}
