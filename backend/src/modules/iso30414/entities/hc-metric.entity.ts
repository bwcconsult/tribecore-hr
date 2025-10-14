import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';

export enum MetricCategory {
  COSTS = 'COSTS', // Workforce costs
  PRODUCTIVITY = 'PRODUCTIVITY', // Output per FTE
  RECRUITMENT = 'RECRUITMENT', // Time to fill, quality of hire
  TURNOVER = 'TURNOVER', // Attrition rates
  DIVERSITY = 'DIVERSITY', // DEI metrics
  LEADERSHIP = 'LEADERSHIP', // Pipeline, succession
  HEALTH_SAFETY = 'HEALTH_SAFETY', // Incidents, injuries
  SKILLS = 'SKILLS', // Skills coverage, training
  CULTURE = 'CULTURE', // Engagement, eNPS
  COMPLIANCE = 'COMPLIANCE', // Legal, regulatory
}

export enum MetricFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

/**
 * Human Capital Metric Entity
 * ISO 30414 compliant metric tracking
 */
@Entity('hc_metrics')
@Index(['organizationId', 'category', 'periodStart'])
export class HCMetric extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Metric identification
  @Column()
  metricCode: string; // 'TOTAL_WORKFORCE_COST', 'REVENUE_PER_FTE', etc.

  @Column()
  metricName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: MetricCategory,
  })
  @Index()
  category: MetricCategory;

  @Column({
    type: 'enum',
    enum: MetricFrequency,
  })
  frequency: MetricFrequency;

  // Period
  @Column({ type: 'date' })
  @Index()
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ nullable: true })
  fiscalYear?: string; // 'FY2025'

  @Column({ nullable: true })
  quarter?: string; // 'Q1', 'Q2', 'Q3', 'Q4'

  // Value
  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  numericValue?: number;

  @Column({ nullable: true })
  textValue?: string;

  @Column({ nullable: true })
  unit?: string; // 'USD', '%', 'days', 'count', etc.

  // Calculation details
  @Column({ type: 'jsonb', nullable: true })
  calculationInputs?: {
    [key: string]: any; // Store inputs used in calculation
  };

  @Column({ type: 'text', nullable: true })
  calculationFormula?: string;

  @Column({ type: 'timestamp', nullable: true })
  calculatedAt?: Date;

  @Column({ nullable: true })
  calculatedBy?: string;

  // Comparison
  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  previousPeriodValue?: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  changePercent?: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  industryBenchmark?: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  targetValue?: number;

  // Quality & audit
  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verifiedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ nullable: true })
  dataSource?: string; // 'PAYROLL', 'HRIS', 'SURVEY', 'MANUAL'

  @Column({ nullable: true })
  dataQualityScore?: number; // 0-100

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Reporting
  @Column({ default: false })
  includeInBoardReport: boolean;

  @Column({ default: false })
  includeInESGReport: boolean;

  @Column({ default: true })
  isPublic: boolean; // Can be shared externally

  // Breakdown/segmentation
  @Column({ type: 'jsonb', nullable: true })
  breakdown?: {
    byDepartment?: Record<string, number>;
    byLocation?: Record<string, number>;
    byGender?: Record<string, number>;
    byAge?: Record<string, number>;
    byTenure?: Record<string, number>;
    custom?: Record<string, any>;
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
