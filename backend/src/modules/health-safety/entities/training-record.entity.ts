import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TrainingType {
  INDUCTION = 'INDUCTION',
  FIRE_SAFETY = 'FIRE_SAFETY',
  FIRST_AID = 'FIRST_AID',
  MANUAL_HANDLING = 'MANUAL_HANDLING',
  WORKING_AT_HEIGHT = 'WORKING_AT_HEIGHT',
  COSHH = 'COSHH',
  DSE = 'DSE',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  PPE = 'PPE',
  CONFINED_SPACES = 'CONFINED_SPACES',
  MACHINERY_OPERATION = 'MACHINERY_OPERATION',
  ELECTRICAL_SAFETY = 'ELECTRICAL_SAFETY',
  HEALTH_SURVEILLANCE = 'HEALTH_SURVEILLANCE',
  ACCIDENT_INVESTIGATION = 'ACCIDENT_INVESTIGATION',
  SUPERVISOR_TRAINING = 'SUPERVISOR_TRAINING',
  REFRESHER = 'REFRESHER',
  OTHER = 'OTHER',
}

export enum TrainingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REQUIRES_REFRESHER = 'REQUIRES_REFRESHER',
}

export enum CompetencyLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  TRAINER = 'TRAINER',
}

@Entity('training_records')
export class TrainingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  trainingNumber: string;

  @Column()
  employeeId: string;

  @Column()
  employeeName: string;

  @Column()
  department: string;

  @Column()
  jobRole: string;

  @Column({
    type: 'enum',
    enum: TrainingType,
  })
  trainingType: TrainingType;

  @Column()
  trainingTitle: string;

  @Column({ type: 'text', nullable: true })
  trainingDescription: string;

  @Column()
  provider: string; // Internal or external provider

  @Column({ nullable: true })
  trainer: string;

  @Column({ type: 'date' })
  trainingDate: Date;

  @Column({ type: 'int' })
  durationHours: number;

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.SCHEDULED,
  })
  status: TrainingStatus;

  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  @Column({ default: false })
  certificateIssued: boolean;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  certificateFiles: string[];

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'int', nullable: true })
  validityMonths: number; // For auto-calculating refresher needs

  @Column({ default: false })
  requiresRefresher: boolean;

  @Column({ type: 'date', nullable: true })
  nextRefresherDate: Date;

  @Column({
    type: 'enum',
    enum: CompetencyLevel,
    nullable: true,
  })
  competencyLevel: CompetencyLevel;

  @Column({ type: 'jsonb', nullable: true })
  assessmentResults: {
    score?: number;
    maxScore?: number;
    percentage?: number;
    passed: boolean;
    assessorName?: string;
    assessmentDate?: Date;
    feedback?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  learningObjectives: Array<{
    objective: string;
    achieved: boolean;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  skillsAcquired: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attendees: string[]; // For group training sessions

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ default: false })
  isLegalRequirement: boolean; // Required by law vs best practice

  @Column({ type: 'simple-array', nullable: true })
  legislationReferences: string[]; // e.g., ["HASAWA 1974", "COSHH 2002"]

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    bookingReference?: string;
    managerApproval?: string;
    approvalDate?: Date;
    trainingMethod?: string; // Online, classroom, practical, etc.
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
