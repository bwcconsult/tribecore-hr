import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ManualHandlingRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REQUIRES_UPDATE = 'REQUIRES_UPDATE',
}

@Entity('manual_handling_assessments')
export class ManualHandlingAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  assessmentNumber: string;

  @Column()
  taskDescription: string;

  @Column()
  location: string;

  @Column()
  department: string;

  @Column({ type: 'simple-array' })
  personsAtRisk: string[];

  @Column()
  assessor: string;

  @Column({ type: 'date' })
  assessmentDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({
    type: 'enum',
    enum: AssessmentStatus,
    default: AssessmentStatus.DRAFT,
  })
  status: AssessmentStatus;

  // Task Analysis
  @Column({ type: 'jsonb' })
  taskDetails: {
    frequency: string; // e.g., "10 times per hour", "occasionally"
    duration: string;
    loadWeight: number; // in kg
    loadDimensions: string;
    loadType: string; // Box, sack, equipment, etc.
    distanceCarried: number; // in meters
    verticalMovement: number; // in meters
    twistingRequired: boolean;
    reachingRequired: boolean;
  };

  // TILE Risk Assessment (Task, Individual, Load, Environment)
  @Column({ type: 'jsonb' })
  taskRisks: {
    holdingLoadsAwayFromBody: boolean;
    twistingTrunk: boolean;
    stooping: boolean;
    reaching: boolean;
    largeVerticalMovement: boolean;
    longCarryingDistances: boolean;
    strenuousPushing: boolean;
    unpredictableMovement: boolean;
    repetitiveHandling: boolean;
    insufficientRest: boolean;
    riskScore: number;
    riskLevel: ManualHandlingRisk;
  };

  @Column({ type: 'jsonb' })
  individualRisks: {
    requiresUnusualStrength: boolean;
    hazardToPregnantWorkers: boolean;
    hazardToDisabled: boolean;
    requiresSpecialTraining: boolean;
    requiresSpecialPPE: boolean;
    healthConditions: string;
    riskScore: number;
    riskLevel: ManualHandlingRisk;
  };

  @Column({ type: 'jsonb' })
  loadRisks: {
    heavy: boolean;
    bulky: boolean;
    difficultToGrasp: boolean;
    unstable: boolean;
    sharpEdges: boolean;
    hotCold: boolean;
    unpredictableMovement: boolean;
    contentsMayShift: boolean;
    riskScore: number;
    riskLevel: ManualHandlingRisk;
  };

  @Column({ type: 'jsonb' })
  environmentRisks: {
    constrainedSpace: boolean;
    unevenFloors: boolean;
    variationsInLevels: boolean;
    poorLighting: boolean;
    extremeTemperatures: boolean;
    strongWinds: boolean;
    poorVentilation: boolean;
    obstructions: boolean;
    riskScore: number;
    riskLevel: ManualHandlingRisk;
  };

  // Overall Risk Assessment
  @Column({
    type: 'enum',
    enum: ManualHandlingRisk,
  })
  overallRisk: ManualHandlingRisk;

  @Column({ type: 'int' })
  totalRiskScore: number; // Sum of all risk scores

  // Control Measures
  @Column({ type: 'jsonb' })
  controlMeasures: {
    existing: Array<{
      measure: string;
      effectiveness: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    additional: Array<{
      measure: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      assignedTo: string;
      dueDate: Date;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      completedDate?: Date;
    }>;
  };

  // Hierarchy of Controls Applied
  @Column({ type: 'jsonb', nullable: true })
  hierarchyOfControls: {
    eliminate: string[]; // Can the task be eliminated?
    reduce: string[]; // Can load weight/frequency be reduced?
    mechanicalAids: string[]; // Trolleys, hoists, conveyors
    workplaceRedesign: string[]; // Better layout, height adjustments
    teamLifting: boolean;
    trainingProvided: boolean;
    ppeProvided: string[]; // Gloves, safety boots, etc.
  };

  // Training Requirements
  @Column({ default: false })
  trainingRequired: boolean;

  @Column({ type: 'simple-array', nullable: true })
  trainedPersonnel: string[];

  @Column({ type: 'date', nullable: true })
  lastTrainingDate: Date;

  @Column({ type: 'date', nullable: true })
  nextTrainingDate: Date;

  // Residual Risk
  @Column({
    type: 'enum',
    enum: ManualHandlingRisk,
    nullable: true,
  })
  residualRisk: ManualHandlingRisk;

  @Column({ type: 'text', nullable: true })
  residualRiskJustification: string;

  // Can Task Be Avoided?
  @Column({ default: false })
  canTaskBeAvoided: boolean;

  @Column({ type: 'text', nullable: true })
  avoidanceRationale: string;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  diagrams: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    industryGuidelines?: string[];
    hseGuidance?: string[];
    legislationReferences?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
