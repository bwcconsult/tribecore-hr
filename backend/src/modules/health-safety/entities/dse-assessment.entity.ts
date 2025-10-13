import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DSEAssessmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED',
}

export enum RiskRating {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('dse_assessments')
export class DSEAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  assessmentNumber: string;

  @Column()
  employeeId: string;

  @Column()
  employeeName: string;

  @Column()
  department: string;

  @Column()
  workstation: string;

  @Column({ type: 'date' })
  assessmentDate: Date;

  @Column()
  assessor: string;

  @Column({
    type: 'enum',
    enum: DSEAssessmentStatus,
    default: DSEAssessmentStatus.NOT_STARTED,
  })
  status: DSEAssessmentStatus;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // User Information
  @Column({ type: 'int' })
  dailyHoursAtDSE: number;

  @Column({ default: false })
  isHabitualUser: boolean; // >1 hour continuously or significant DSE use

  @Column({ default: false })
  hasVisionCorrectionPresscribed: boolean;

  @Column({ default: false })
  eyeTestRequired: boolean;

  @Column({ type: 'date', nullable: true })
  lastEyeTestDate: Date;

  // Workstation Setup Assessment
  @Column({ type: 'jsonb' })
  displayScreen: {
    adjustable: boolean;
    glareReflection: boolean;
    brightnessContrast: boolean;
    imageStable: boolean;
    screenClean: boolean;
    riskRating: RiskRating;
    issues: string[];
    actions: string[];
  };

  @Column({ type: 'jsonb' })
  keyboardMouse: {
    keyboardSeparate: boolean;
    keyboardTiltable: boolean;
    mouseUsable: boolean;
    sufficientSpace: boolean;
    wristSupport: boolean;
    riskRating: RiskRating;
    issues: string[];
    actions: string[];
  };

  @Column({ type: 'jsonb' })
  desk: {
    sufficientSize: boolean;
    matteFinish: boolean;
    stableConstruction: boolean;
    adequateSpace: boolean;
    cableManagement: boolean;
    riskRating: RiskRating;
    issues: string[];
    actions: string[];
  };

  @Column({ type: 'jsonb' })
  chair: {
    adjustableHeight: boolean;
    adjustableBackrest: boolean;
    lumbarSupport: boolean;
    swivel: boolean;
    stable: boolean;
    footrestRequired: boolean;
    riskRating: RiskRating;
    issues: string[];
    actions: string[];
  };

  @Column({ type: 'jsonb' })
  environment: {
    adequateLighting: boolean;
    noGlare: boolean;
    appropriateTemperature: boolean;
    adequateVentilation: boolean;
    lowNoise: boolean;
    adequateSpace: boolean;
    riskRating: RiskRating;
    issues: string[];
    actions: string[];
  };

  @Column({ type: 'jsonb' })
  software: {
    suitableForTask: boolean;
    userFriendly: boolean;
    errorMessages: boolean;
    feedbackProvided: boolean;
    riskRating: RiskRating;
    issues: string[];
    actions: string[];
  };

  // Health Symptoms
  @Column({ type: 'jsonb', nullable: true })
  healthSymptoms: {
    backPain: boolean;
    neckPain: boolean;
    shoulderPain: boolean;
    armPain: boolean;
    wristPain: boolean;
    eyeStrain: boolean;
    headaches: boolean;
    fatigue: boolean;
    other: string;
  };

  // Overall Risk & Actions
  @Column({
    type: 'enum',
    enum: RiskRating,
  })
  overallRisk: RiskRating;

  @Column({ type: 'jsonb' })
  actions: Array<{
    id: string;
    action: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    assignedTo: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    completedDate?: Date;
    cost?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  equipmentProvided: Array<{
    item: string;
    description: string;
    dateProvided: Date;
    cost: number;
  }>;

  // DSE Training
  @Column({ default: false })
  dseTrainingCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  trainingDate: Date;

  @Column({ type: 'text', nullable: true })
  trainingDetails: string;

  // User Self-Assessment
  @Column({ default: false })
  userSelfAssessmentCompleted: boolean;

  @Column({ type: 'text', nullable: true })
  userComments: string;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    workingFrom?: 'OFFICE' | 'HOME' | 'HYBRID';
    homeOfficeAssessed?: boolean;
    laptopUser?: boolean;
    multipleMonitors?: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
