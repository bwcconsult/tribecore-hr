import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PPEType {
  SAFETY_HELMET = 'SAFETY_HELMET',
  SAFETY_GOGGLES = 'SAFETY_GOGGLES',
  FACE_SHIELD = 'FACE_SHIELD',
  EAR_PROTECTION = 'EAR_PROTECTION',
  RESPIRATOR = 'RESPIRATOR',
  SAFETY_GLOVES = 'SAFETY_GLOVES',
  SAFETY_BOOTS = 'SAFETY_BOOTS',
  HI_VIS_CLOTHING = 'HI_VIS_CLOTHING',
  SAFETY_HARNESS = 'SAFETY_HARNESS',
  PROTECTIVE_CLOTHING = 'PROTECTIVE_CLOTHING',
  KNEE_PADS = 'KNEE_PADS',
  OTHER = 'OTHER',
}

export enum PPEStatus {
  IN_STOCK = 'IN_STOCK',
  ISSUED = 'ISSUED',
  IN_USE = 'IN_USE',
  NEEDS_REPLACEMENT = 'NEEDS_REPLACEMENT',
  DISPOSED = 'DISPOSED',
}

@Entity('ppe_management')
export class PPEManagement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  ppeNumber: string;

  @Column({
    type: 'enum',
    enum: PPEType,
  })
  ppeType: PPEType;

  @Column()
  description: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  modelNumber: string;

  @Column({ nullable: true })
  ceMarking: string; // CE marking number for UK/EU compliance

  @Column({ nullable: true })
  ukcaMarking: string; // UK Conformity Assessed marking

  @Column({ type: 'simple-array', nullable: true })
  standards: string[]; // e.g., EN 397, EN 166

  // Stock Management
  @Column({ type: 'int' })
  quantityInStock: number;

  @Column({ type: 'int' })
  minimumStockLevel: number;

  @Column({ type: 'int', nullable: true })
  reorderLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  supplierContactDetails: string;

  @Column({ nullable: true })
  storageLocation: string;

  // Issue Records
  @Column({ type: 'jsonb', nullable: true })
  issueRecords: Array<{
    employeeId: string;
    employeeName: string;
    dateIssued: Date;
    quantity: number;
    size?: string;
    issuedBy: string;
    conditionOnIssue: string;
    signatureReceived: boolean;
    expectedReturnDate?: Date;
    returnedDate?: Date;
    conditionOnReturn?: string;
  }>;

  // Training & Competency
  @Column({ default: false })
  trainingRequired: boolean;

  @Column({ type: 'simple-array', nullable: true })
  trainedUsers: string[];

  @Column({ type: 'text', nullable: true })
  usageInstructions: string;

  @Column({ type: 'text', nullable: true })
  maintenanceInstructions: string;

  // Inspection & Maintenance
  @Column({ nullable: true })
  inspectionFrequency: string; // e.g., "Daily", "Weekly", "Monthly"

  @Column({ type: 'jsonb', nullable: true })
  inspectionRecords: Array<{
    date: Date;
    inspectedBy: string;
    condition: 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
    defectsFound: string[];
    actionTaken: string;
    nextInspectionDate: Date;
  }>;

  @Column({ type: 'date', nullable: true })
  lastInspectionDate: Date;

  @Column({ type: 'date', nullable: true })
  nextInspectionDate: Date;

  // Lifecycle Management
  @Column({ nullable: true })
  expectedLifespan: string; // e.g., "6 months", "1 year"

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ default: false })
  requiresReplacement: boolean;

  @Column({ type: 'date', nullable: true })
  disposalDate: Date;

  @Column({ nullable: true })
  disposalMethod: string;

  @Column({ nullable: true })
  disposedBy: string;

  // Risk Assessment Linkage
  @Column({ type: 'simple-array', nullable: true })
  relatedRiskAssessments: string[]; // IDs of risk assessments requiring this PPE

  @Column({ type: 'simple-array', nullable: true })
  relatedTasks: string[]; // Tasks requiring this PPE

  @Column({ type: 'simple-array', nullable: true })
  departments: string[]; // Departments using this PPE

  // Compliance & Standards
  @Column({ default: true })
  isCompliant: boolean;

  @Column({ type: 'text', nullable: true })
  complianceNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  testCertificates: Array<{
    testType: string;
    testDate: Date;
    testResult: string;
    certificateNumber: string;
    expiryDate: Date;
    documentUrl: string;
  }>;

  // Documentation
  @Column({ type: 'simple-array', nullable: true })
  documents: string[]; // User manuals, certificates, etc.

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({
    type: 'enum',
    enum: PPEStatus,
    default: PPEStatus.IN_STOCK,
  })
  status: PPEStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    hazardsProtectedAgainst?: string[];
    limitations?: string[];
    compatibilityNotes?: string;
    legislationReferences?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
