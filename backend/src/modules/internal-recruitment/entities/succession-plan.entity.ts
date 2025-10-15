import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CriticalityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ReadinessLevel {
  READY_NOW = 'READY_NOW',
  READY_1_YEAR = 'READY_1_YEAR',
  READY_2_YEARS = 'READY_2_YEARS',
  READY_3_PLUS_YEARS = 'READY_3_PLUS_YEARS',
  NOT_READY = 'NOT_READY',
}

export enum RiskLevel {
  HIGH_RISK = 'HIGH_RISK', // High flight risk or retirement
  MEDIUM_RISK = 'MEDIUM_RISK',
  LOW_RISK = 'LOW_RISK',
}

@Entity('succession_plans')
@Index(['organizationId'])
@Index(['positionId'])
@Index(['incumbentEmployeeId'])
@Index(['criticalityLevel'])
export class SuccessionPlan extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  planCode: string;

  @Column()
  positionId: string;

  @Column()
  positionTitle: string;

  @Column()
  departmentId: string;

  @Column()
  departmentName: string;

  @Column({ nullable: true })
  incumbentEmployeeId: string;

  @Column({ nullable: true })
  incumbentName: string;

  @Column({
    type: 'enum',
    enum: CriticalityLevel,
  })
  criticalityLevel: CriticalityLevel;

  @Column({ type: 'text', nullable: true })
  criticalityReason: string;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    nullable: true,
  })
  incumbentRiskLevel: RiskLevel;

  @Column({ type: 'date', nullable: true })
  anticipatedVacancyDate: Date;

  @Column({ type: 'text', nullable: true })
  vacancyReason: string; // retirement, promotion, transfer, departure

  @Column({ type: 'jsonb' })
  keyResponsibilities: string[];

  @Column({ type: 'jsonb' })
  requiredCompetencies: Array<{
    competencyId: string;
    competencyName: string;
    proficiencyLevel: string;
    isEssential: boolean;
  }>;

  @Column({ type: 'jsonb' })
  requiredSkills: Array<{
    skillId: string;
    skillName: string;
    proficiencyLevel: string;
    isEssential: boolean;
  }>;

  @Column({ type: 'int', nullable: true })
  minYearsExperience: number;

  @Column({ type: 'jsonb' })
  successors: Array<{
    employeeId: string;
    employeeName: string;
    currentPosition: string;
    department: string;
    readinessLevel: ReadinessLevel;
    readinessAssessmentDate: Date;
    overallFitScore: number; // 0-100
    strengthsGaps: {
      strengths: string[];
      gaps: string[];
    };
    developmentPlan: {
      developmentActions: Array<{
        action: string;
        timeline: string;
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
        completionDate?: Date;
      }>;
      estimatedReadyDate: Date;
    };
    isPrimarySuccessor: boolean;
    isEmergencyBackup: boolean;
  }>;

  @Column({ type: 'int', default: 0 })
  successorCount: number;

  @Column({ type: 'int', default: 0 })
  readyNowCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  benchStrength: number; // 0-100 score

  @Column({ type: 'date', nullable: true })
  lastReviewedDate: Date;

  @Column({ nullable: true })
  lastReviewedBy: string;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  contingencyPlan: {
    emergencyBackup: string;
    interimSolution?: string;
    externalRecruitmentPlan?: string;
    knowledgeTransferPlan?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    talentReviewId?: string;
    isLeadershipRole?: boolean;
    isRevenueImpact?: boolean;
    estimatedReplacementCost?: number;
    [key: string]: any;
  };
}
