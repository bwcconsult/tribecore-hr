import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InspectionType {
  GENERAL_WORKPLACE = 'GENERAL_WORKPLACE',
  FIRE_SAFETY = 'FIRE_SAFETY',
  ELECTRICAL_SAFETY = 'ELECTRICAL_SAFETY',
  MACHINERY_EQUIPMENT = 'MACHINERY_EQUIPMENT',
  WELFARE_FACILITIES = 'WELFARE_FACILITIES',
  WORKSTATION = 'WORKSTATION',
  VEHICLE = 'VEHICLE',
  STORAGE_AREAS = 'STORAGE_AREAS',
  ACCESS_EGRESS = 'ACCESS_EGRESS',
  HOUSEKEEPING = 'HOUSEKEEPING',
}

export enum InspectionFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  BI_ANNUALLY = 'BI_ANNUALLY',
  ANNUALLY = 'ANNUALLY',
  AS_REQUIRED = 'AS_REQUIRED',
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

@Entity('workplace_inspections')
export class WorkplaceInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  inspectionNumber: string;

  @Column({
    type: 'enum',
    enum: InspectionType,
  })
  type: InspectionType;

  @Column()
  location: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  department: string;

  @Column()
  inspector: string;

  @Column({ type: 'date' })
  inspectionDate: Date;

  @Column({ type: 'date', nullable: true })
  nextInspectionDate: Date;

  @Column({
    type: 'enum',
    enum: InspectionFrequency,
  })
  frequency: InspectionFrequency;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.SCHEDULED,
  })
  status: InspectionStatus;

  // Inspection Checklist
  @Column({ type: 'jsonb' })
  checklist: Array<{
    id: string;
    category: string;
    item: string;
    requirement: string;
    compliant: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'N/A';
    observations: string;
    evidence?: string; // Photo URL, etc.
    actionRequired: boolean;
  }>;

  // Observations & Findings
  @Column({ type: 'jsonb', nullable: true })
  hazardsIdentified: Array<{
    id: string;
    hazard: string;
    location: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    immediateActionTaken: string;
    furtherActionRequired: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  goodPractices: Array<{
    practice: string;
    location: string;
    notes: string;
  }>;

  // Overall Scores
  @Column({ type: 'int' })
  totalItems: number;

  @Column({ type: 'int' })
  compliantItems: number;

  @Column({ type: 'int' })
  nonCompliantItems: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  complianceScore: number; // Percentage

  @Column({ nullable: true })
  overallRating: string; // e.g., "Excellent", "Good", "Satisfactory", "Unsatisfactory"

  // Actions Required
  @Column({ type: 'jsonb', nullable: true })
  actions: Array<{
    id: string;
    action: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE';
    category: string;
    assignedTo: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    completedDate?: Date;
    verifiedBy?: string;
    verificationDate?: Date;
  }>;

  // Follow-up Inspection
  @Column({ default: false })
  followUpRequired: boolean;

  @Column({ type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ nullable: true })
  followUpBy: string;

  @Column({ default: false })
  followUpCompleted: boolean;

  @Column({ type: 'text', nullable: true })
  followUpNotes: string;

  // Management Review
  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'text', nullable: true })
  managementComments: string;

  // Documentation
  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  // Weather Conditions (if outdoor inspection)
  @Column({ nullable: true })
  weatherConditions: string;

  // Summary
  @Column({ type: 'text', nullable: true })
  executiveSummary: string;

  @Column({ type: 'text', nullable: true })
  inspectorComments: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    templateId?: string;
    previousInspectionId?: string;
    comparisonNotes?: string;
    improvementsSinceLastInspection?: string[];
    legislationReferences?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
