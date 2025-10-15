import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PathType {
  VERTICAL = 'VERTICAL', // Upward progression
  LATERAL = 'LATERAL', // Same level, different function
  DIAGONAL = 'DIAGONAL', // Mix of both
  SPECIALIST = 'SPECIALIST', // Deep expertise in one area
  GENERALIST = 'GENERALIST', // Broad experience across areas
}

@Entity('career_paths')
@Index(['organizationId'])
@Index(['startingPositionId'])
@Index(['isActive'])
export class CareerPath extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  pathName: string;

  @Column()
  pathCode: string;

  @Column({
    type: 'enum',
    enum: PathType,
  })
  pathType: PathType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  startingPositionId: string;

  @Column()
  startingPositionTitle: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  departmentName: string;

  @Column({ nullable: true })
  careerFamily: string; // e.g., 'Engineering', 'Sales', 'Operations'

  @Column({ nullable: true })
  careerTrack: string; // e.g., 'Individual Contributor', 'Manager', 'Executive'

  @Column({ type: 'jsonb' })
  stages: Array<{
    stageNumber: number;
    positionId: string;
    positionTitle: string;
    gradeLevel: string;
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    typicalTenure: number; // months
    keyResponsibilities: string[];
    requiredCompetencies: Array<{
      competencyId: string;
      competencyName: string;
      proficiencyLevel: string;
    }>;
    requiredSkills: Array<{
      skillId: string;
      skillName: string;
      proficiencyLevel: string;
    }>;
    experienceRequired: number; // years
    educationRequired?: string;
    certificationsRequired?: string[];
    nextStagePositions: string[]; // IDs of next possible positions
  }>;

  @Column({ type: 'int' })
  totalStages: number;

  @Column({ type: 'int', nullable: true })
  estimatedDuration: number; // months to complete entire path

  @Column({ type: 'jsonb', nullable: true })
  milestones: Array<{
    milestone: string;
    description: string;
    stage: number;
    criteria: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  developmentRecommendations: Array<{
    category: 'TRAINING' | 'CERTIFICATION' | 'PROJECT' | 'MENTORSHIP' | 'ROTATION';
    title: string;
    description: string;
    relevantForStage: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedDuration?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  alternativePaths: Array<{
    pathId: string;
    pathName: string;
    transitionPoint: number; // stage where you can switch
    reason: string;
  }>;

  @Column({ type: 'int', default: 0 })
  employeesOnPath: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'date', nullable: true })
  lastUpdatedDate: Date;

  @Column({ nullable: true })
  lastUpdatedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  successMetrics: {
    completionRate?: number;
    averageTimeToComplete?: number;
    retentionRate?: number;
    successStories?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    targetAudience?: string[];
    isLeadershipPath?: boolean;
    isTechnicalPath?: boolean;
    requiresSponsor?: boolean;
    [key: string]: any;
  };
}
