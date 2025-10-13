import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum RiskOfLoss {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ImpactOfLoss {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ReadinessForPromotion {
  NOT_READY = 'NOT_READY',
  READY_IN_1_2_YEARS = 'READY_IN_1_2_YEARS',
  READY_NOW = 'READY_NOW',
  ALREADY_PERFORMING_AT_NEXT_LEVEL = 'ALREADY_PERFORMING_AT_NEXT_LEVEL',
}

export enum Mobility {
  OPEN_TO_RELOCATION = 'OPEN_TO_RELOCATION',
  OPEN_TO_REMOTE = 'OPEN_TO_REMOTE',
  LOCATION_BOUND = 'LOCATION_BOUND',
  FLEXIBLE = 'FLEXIBLE',
}

@Entity('talent_cards')
export class TalentCard extends BaseEntity {
  @Column({ unique: true })
  userId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceRating: number; // Latest calibrated rating

  @Column({ nullable: true })
  potential: string; // LOW, MEDIUM, HIGH (for 9-box)

  @Column({
    type: 'enum',
    enum: RiskOfLoss,
    nullable: true,
  })
  riskOfLoss: RiskOfLoss;

  @Column({
    type: 'enum',
    enum: ImpactOfLoss,
    nullable: true,
  })
  impactOfLoss: ImpactOfLoss;

  @Column({ type: 'text', nullable: true })
  keyStrengths: string;

  @Column({ type: 'text', nullable: true })
  developmentAreas: string;

  @Column({ type: 'simple-array', nullable: true })
  careerAspirations: string[];

  @Column({
    type: 'enum',
    enum: ReadinessForPromotion,
    nullable: true,
  })
  readinessForPromotion: ReadinessForPromotion;

  @Column({ nullable: true })
  targetRole: string;

  @Column({ type: 'date', nullable: true })
  targetPromotionDate: Date;

  @Column({
    type: 'enum',
    enum: Mobility,
    nullable: true,
  })
  mobility: Mobility;

  @Column({ type: 'simple-array', nullable: true })
  successorFor: string[]; // Role IDs or titles this person could succeed into

  @Column({ type: 'simple-array', nullable: true })
  potentialSuccessors: string[]; // User IDs who could succeed this person

  @Column({ type: 'text', nullable: true })
  retentionStrategy: string;

  @Column({ type: 'jsonb', nullable: true })
  developmentPlan: {
    goals: string[];
    trainingNeeded: string[];
    mentorshipNeeded: boolean;
    rotationOpportunities?: string[];
    timeline?: string;
  };

  @Column({ type: 'text', nullable: true })
  talentReviewNotes: string;

  @Column({ type: 'date', nullable: true })
  lastReviewedAt: Date;

  @Column({ nullable: true })
  lastReviewedBy: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'lastReviewedBy' })
  reviewer: Employee;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    nineBoxPosition?: { performance: number; potential: number }; // For grid positioning
    highPotential?: boolean;
    flightRisk?: boolean;
    keyTalent?: boolean;
    diversityMarkers?: string[];
  };
}
