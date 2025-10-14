import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Requisition } from './requisition.entity';

export enum PostingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

@Entity('job_postings')
export class JobPosting extends BaseEntity {
  @Column()
  requisitionId: string;

  @ManyToOne(() => Requisition)
  @JoinColumn({ name: 'requisitionId' })
  requisition: Requisition;

  @Column()
  organizationId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  competencies: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @Column({ default: false })
  showSalary: boolean;

  @Column()
  employmentType: string; // Full-time, Part-time, Contract

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  remote: boolean;

  @Column({ default: false })
  hybrid: boolean;

  @Column({ default: false })
  requiresVisaSponsorship: boolean;

  @Column({
    type: 'enum',
    enum: PostingStatus,
    default: PostingStatus.DRAFT,
  })
  status: PostingStatus;

  @Column({ type: 'date', nullable: true })
  postedAt: Date;

  @Column({ type: 'date', nullable: true })
  closedAt: Date;

  // Channels (where posted)
  @Column({ type: 'jsonb', default: [] })
  channels: Array<{
    name: string; // LinkedIn, Indeed, Company Site
    url: string;
    postedAt: Date;
    externalId?: string;
  }>;

  // Metrics
  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'int', default: 0 })
  applications: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    benefits?: string[];
    keywords?: string[];
    utm_source?: string;
    utm_campaign?: string;
    [key: string]: any;
  };
}
