import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PerformanceRating {
  EXCEPTIONAL = 'EXCEPTIONAL',
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

export enum PotentialRating {
  HIGH_POTENTIAL = 'HIGH_POTENTIAL',
  MEDIUM_POTENTIAL = 'MEDIUM_POTENTIAL',
  LOW_POTENTIAL = 'LOW_POTENTIAL',
}

export enum TalentCategory {
  STAR = 'STAR', // High Performance, High Potential
  HIGH_PERFORMER = 'HIGH_PERFORMER', // High Performance, Medium Potential
  SOLID_PERFORMER = 'SOLID_PERFORMER', // Medium Performance, Medium Potential
  EMERGING_TALENT = 'EMERGING_TALENT', // Medium Performance, High Potential
  UNDERPERFORMER = 'UNDERPERFORMER', // Low Performance
  FLIGHT_RISK = 'FLIGHT_RISK',
}

export enum RetentionRisk {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Entity('talent_reviews')
@Index(['organizationId'])
@Index(['employeeId'])
@Index(['reviewCycle'])
@Index(['talentCategory'])
export class TalentReview extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  reviewCode: string;

  @Column()
  employeeId: string;

  @Column()
  employeeName: string;

  @Column()
  currentPosition: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  managerId: string;

  @Column({ nullable: true })
  managerName: string;

  @Column()
  reviewCycle: string; // e.g., '2025-Q1', 'Annual-2025'

  @Column({ type: 'date' })
  reviewDate: Date;

  @Column({
    type: 'enum',
    enum: PerformanceRating,
  })
  performanceRating: PerformanceRating;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  performanceScore: number; // 1-5 scale

  @Column({
    type: 'enum',
    enum: PotentialRating,
  })
  potentialRating: PotentialRating;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  potentialScore: number; // 1-5 scale

  @Column({
    type: 'enum',
    enum: TalentCategory,
  })
  talentCategory: TalentCategory;

  @Column({ type: 'int' })
  nineBoxX: number; // 1-3 (Performance axis)

  @Column({ type: 'int' })
  nineBoxY: number; // 1-3 (Potential axis)

  @Column({
    type: 'enum',
    enum: RetentionRisk,
  })
  retentionRisk: RetentionRisk;

  @Column({ type: 'text', nullable: true })
  retentionRiskReason: string;

  @Column({ type: 'jsonb', nullable: true })
  strengths: string[];

  @Column({ type: 'jsonb', nullable: true })
  developmentNeeds: string[];

  @Column({ type: 'jsonb', nullable: true })
  careerAspirations: {
    preferredNextRole?: string;
    preferredDepartment?: string;
    preferredLocation?: string;
    timeframe?: string;
    willingToRelocate?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  readinessForPromotion: {
    isReady: boolean;
    targetRole?: string;
    timeToReady?: string; // 'NOW', '6_MONTHS', '1_YEAR', '2_YEARS'
    gapsToBridge?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  successionPotential: {
    successorFor: Array<{
      positionId: string;
      positionTitle: string;
      readinessLevel: string;
    }>;
  };

  @Column({ type: 'jsonb' })
  developmentPlan: {
    goals: Array<{
      goal: string;
      timeline: string;
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      progress: number; // 0-100
    }>;
    actions: Array<{
      action: string;
      type: 'TRAINING' | 'COACHING' | 'PROJECT' | 'STRETCH_ASSIGNMENT' | 'MENTORSHIP';
      timeline: string;
      owner: string;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  talentActions: {
    retentionActions?: string[];
    developmentActions?: string[];
    mobilityActions?: string[];
    recognitionActions?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  competencyAssessment: Array<{
    competencyId: string;
    competencyName: string;
    currentLevel: string;
    targetLevel: string;
    gap: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  leadershipPotential: {
    hasLeadershipInterest: boolean;
    leadershipReadiness: 'READY' | 'DEVELOPING' | 'NOT_READY';
    leadershipStyle?: string;
    leadershipStrengths?: string[];
    leadershipGaps?: string[];
  };

  @Column({ type: 'boolean', default: false })
  isHighPotential: boolean;

  @Column({ type: 'boolean', default: false })
  isKeyTalent: boolean;

  @Column({ type: 'boolean', default: false })
  isFlightRisk: boolean;

  @Column({ type: 'text', nullable: true })
  managerComments: string;

  @Column({ type: 'text', nullable: true })
  hrComments: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  calibrationNotes: {
    calibratedBy?: string;
    calibrationDate?: Date;
    originalRating?: string;
    adjustedRating?: string;
    reason?: string;
  };

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    yearsWithCompany?: number;
    yearsInRole?: number;
    previousRatings?: Array<{
      cycle: string;
      performance: string;
      potential: string;
    }>;
    [key: string]: any;
  };
}
