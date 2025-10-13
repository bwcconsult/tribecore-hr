import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FireRisk {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum FireAssessmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REQUIRES_UPDATE = 'REQUIRES_UPDATE',
}

@Entity('fire_risk_assessments')
export class FireRiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  assessmentNumber: string;

  @Column()
  premises: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  buildingDescription: string;

  @Column({ type: 'int' })
  numberOfFloors: number;

  @Column({ type: 'int' })
  maxOccupancy: number;

  @Column({ type: 'int', nullable: true })
  typicalOccupancy: number;

  @Column()
  assessor: string;

  @Column({ nullable: true })
  competentPerson: string; // Responsible person for fire safety

  @Column({ type: 'date' })
  assessmentDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({
    type: 'enum',
    enum: FireAssessmentStatus,
    default: FireAssessmentStatus.DRAFT,
  })
  status: FireAssessmentStatus;

  // People at Risk
  @Column({ type: 'jsonb' })
  peopleAtRisk: {
    employees: number;
    visitors: number;
    contractors: number;
    membersOfPublic: number;
    vulnerablePersons: Array<{
      type: 'DISABLED' | 'ELDERLY' | 'CHILDREN' | 'LONE_WORKERS' | 'OTHER';
      count: number;
      location: string;
      specialArrangements: string;
    }>;
  };

  // Fire Hazards Identified
  @Column({ type: 'jsonb' })
  fireHazards: Array<{
    id: string;
    hazardType: 'ELECTRICAL' | 'SMOKING' | 'COOKING' | 'HEATING' | 'FLAMMABLE_MATERIALS' | 'ARSON' | 'OTHER';
    location: string;
    description: string;
    likelihood: number; // 1-5
    severity: number; // 1-5
    riskRating: number;
    riskLevel: FireRisk;
    controlMeasures: string[];
  }>;

  // Fire Detection & Warning
  @Column({ type: 'jsonb' })
  detectionWarning: {
    automaticDetection: boolean;
    manualCallPoints: boolean;
    alarmSystem: boolean;
    alarmType: string;
    alarmAudibleEverywhere: boolean;
    emergencyLighting: boolean;
    lastTestedDate: Date;
    testingFrequency: string;
    maintenanceRecords: boolean;
    issues: string[];
  };

  // Means of Escape
  @Column({ type: 'jsonb' })
  meansOfEscape: Array<{
    floor: string;
    exitRoutes: string[];
    travelDistances: string;
    exitSignage: boolean;
    emergencyLighting: boolean;
    exitsClearAndUnlocked: boolean;
    exitDoorsCorrectDirection: boolean;
    refugeAreas: string[];
    issues: string[];
  }>;

  // Fire Fighting Equipment
  @Column({ type: 'jsonb' })
  fireFightingEquipment: {
    extinguishers: Array<{
      type: 'WATER' | 'FOAM' | 'CO2' | 'POWDER' | 'WET_CHEMICAL';
      location: string;
      lastServiceDate: Date;
      nextServiceDate: Date;
    }>;
    fireBlankests: number;
    sprinklerSystem: boolean;
    hoserReels: number;
    adequateCoverage: boolean;
    staffTrained: boolean;
    issues: string[];
  };

  // Emergency Plan & Procedures
  @Column({ type: 'text' })
  emergencyPlan: string;

  @Column({ type: 'jsonb' })
  evacuationProcedures: {
    writtenPlan: boolean;
    assemblyPoints: string[];
    fireMarshalss: string[];
    peepForVulnerable: boolean; // Personal Emergency Evacuation Plans
    staffTrained: boolean;
    drillsFrequency: string;
    lastDrillDate: Date;
    nextDrillDate: Date;
    issues: string[];
  };

  // Fire Safety Management
  @Column({ type: 'jsonb' })
  managementArrangements: {
    responsiblePerson: string;
    deputyPerson: string;
    trainingRecords: boolean;
    maintenanceRecords: boolean;
    inspectionSchedule: string;
    contractorControls: string;
    hotWorkPermits: boolean;
    housekeeping: string;
    arsonSecurity: string;
    issues: string[];
  };

  // Overall Risk Rating
  @Column({
    type: 'enum',
    enum: FireRisk,
  })
  overallRisk: FireRisk;

  // Actions Required
  @Column({ type: 'jsonb' })
  actions: Array<{
    id: string;
    action: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE';
    category: 'PHYSICAL' | 'PROCEDURAL' | 'TRAINING' | 'MAINTENANCE';
    assignedTo: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    completedDate?: Date;
    cost?: number;
  }>;

  // Regulatory Compliance
  @Column({ default: false })
  regulatoryOrderInPlace: boolean;

  @Column({ nullable: true })
  regulatoryOrderDetails: string;

  @Column({ default: false })
  localAuthorityNotified: boolean;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  floorPlans: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    buildingType?: string;
    constructionMaterials?: string[];
    specialFeatures?: string[];
    legislationReferences?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
