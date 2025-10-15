import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('career_progress')
@Index(['employeeId'])
@Index(['careerPathId'])
@Index(['organizationId'])
export class CareerProgress extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  employeeId: string;

  @Column()
  careerPathId: string;

  @Column()
  careerPathName: string;

  @Column({ type: 'int' })
  currentStage: number;

  @Column()
  currentPositionTitle: string;

  @Column({ type: 'date' })
  enrolledDate: Date;

  @Column({ type: 'date', nullable: true })
  currentStageStartDate: Date;

  @Column({ type: 'int', nullable: true })
  monthsInCurrentStage: number;

  @Column({ type: 'int', nullable: true })
  nextStageNumber: number;

  @Column({ nullable: true })
  nextStageTitle: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallProgress: number; // 0-100

  @Column({ type: 'jsonb' })
  stageProgress: Array<{
    stage: number;
    positionTitle: string;
    status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
    startDate?: Date;
    endDate?: Date;
    duration?: number; // months
    achievements?: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  skillsProgress: Array<{
    skillId: string;
    skillName: string;
    requiredLevel: string;
    currentLevel: string;
    isAcquired: boolean;
    acquiredDate?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  milestonesAchieved: Array<{
    milestoneId: string;
    milestone: string;
    achievedDate: Date;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  developmentActivities: Array<{
    activityId: string;
    activityType: string;
    title: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
    completionDate?: Date;
    notes?: string;
  }>;

  @Column({ type: 'date', nullable: true })
  estimatedCompletionDate: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  paceScore: number; // How fast progressing vs typical (1.0 = on pace)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date', nullable: true })
  lastUpdatedDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    mentorId?: string;
    sponsorId?: string;
    talentReviewId?: string;
    [key: string]: any;
  };
}
