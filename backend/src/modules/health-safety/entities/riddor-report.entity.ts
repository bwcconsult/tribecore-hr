import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RIDDORCategory {
  DEATH = 'DEATH',
  SPECIFIED_INJURY = 'SPECIFIED_INJURY',
  OVER_SEVEN_DAY_INJURY = 'OVER_SEVEN_DAY_INJURY',
  OCCUPATIONAL_DISEASE = 'OCCUPATIONAL_DISEASE',
  DANGEROUS_OCCURRENCE = 'DANGEROUS_OCCURRENCE',
  GAS_INCIDENT = 'GAS_INCIDENT',
}

export enum SpecifiedInjuryType {
  FRACTURE = 'FRACTURE',
  AMPUTATION = 'AMPUTATION',
  PERMANENT_LOSS_OF_SIGHT = 'PERMANENT_LOSS_OF_SIGHT',
  CRUSH_INJURY_TO_HEAD_OR_TORSO = 'CRUSH_INJURY_TO_HEAD_OR_TORSO',
  SERIOUS_BURNS = 'SERIOUS_BURNS',
  SCALPING = 'SCALPING',
  UNCONSCIOUSNESS_CAUSED_BY_ASPHYXIA = 'UNCONSCIOUSNESS_CAUSED_BY_ASPHYXIA',
  INJURY_FROM_EXPLOSIVE = 'INJURY_FROM_EXPLOSIVE',
  INJURY_FROM_ELECTRICAL_SHOCK = 'INJURY_FROM_ELECTRICAL_SHOCK',
}

export enum OccupationalDisease {
  CARPAL_TUNNEL_SYNDROME = 'CARPAL_TUNNEL_SYNDROME',
  SEVERE_CRAMP = 'SEVERE_CRAMP',
  OCCUPATIONAL_DERMATITIS = 'OCCUPATIONAL_DERMATITIS',
  HAND_ARM_VIBRATION_SYNDROME = 'HAND_ARM_VIBRATION_SYNDROME',
  OCCUPATIONAL_ASTHMA = 'OCCUPATIONAL_ASTHMA',
  TENDONITIS = 'TENDONITIS',
  ANY_OCCUPATIONAL_CANCER = 'ANY_OCCUPATIONAL_CANCER',
  DISEASE_FROM_BIOLOGICAL_AGENT = 'DISEASE_FROM_BIOLOGICAL_AGENT',
  LUNG_DISEASE = 'LUNG_DISEASE',
}

export enum RIDDORStatus {
  DRAFT = 'DRAFT',
  REPORTABLE = 'REPORTABLE',
  REPORTED_TO_HSE = 'REPORTED_TO_HSE',
  HSE_INVESTIGATING = 'HSE_INVESTIGATING',
  CLOSED = 'CLOSED',
}

@Entity('riddor_reports')
export class RIDDORReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  riddorNumber: string;

  @Column({ nullable: true })
  hseReference: string; // Reference from HSE after reporting

  @Column()
  incidentId: string; // Links to Incident entity

  @Column({
    type: 'enum',
    enum: RIDDORCategory,
  })
  category: RIDDORCategory;

  @Column({ type: 'timestamp' })
  incidentDateTime: Date;

  @Column()
  reportedBy: string;

  @Column({ type: 'date' })
  reportDate: Date;

  @Column({ default: false })
  reportedWithin10Days: boolean; // Deaths & specified injuries: within 10 days

  @Column({ default: false })
  reportedWithin15Days: boolean; // Over-7-day injuries: within 15 days

  @Column({
    type: 'enum',
    enum: RIDDORStatus,
    default: RIDDORStatus.DRAFT,
  })
  status: RIDDORStatus;

  // Injured/Affected Person
  @Column({ type: 'jsonb' })
  affectedPerson: {
    fullName: string;
    dateOfBirth: Date;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    occupation: string;
    employmentStatus: 'EMPLOYEE' | 'SELF_EMPLOYED' | 'TRAINEE' | 'CONTRACTOR' | 'MEMBER_OF_PUBLIC';
    employeeNumber: string;
    address: string;
    contactNumber: string;
  };

  // Incident Details
  @Column()
  location: string;

  @Column({ type: 'text' })
  detailedDescription: string;

  @Column({ type: 'text' })
  activityAtTime: string;

  // Injury/Disease Details
  @Column({
    type: 'enum',
    enum: SpecifiedInjuryType,
    nullable: true,
  })
  specifiedInjuryType: SpecifiedInjuryType;

  @Column({
    type: 'enum',
    enum: OccupationalDisease,
    nullable: true,
  })
  occupationalDisease: OccupationalDisease;

  @Column({ type: 'text', nullable: true })
  injuryDetails: string;

  @Column({ type: 'text', nullable: true })
  bodyPartAffected: string;

  @Column({ type: 'int', nullable: true })
  daysOffWork: number;

  @Column({ default: false })
  hospitalizationRequired: boolean;

  @Column({ nullable: true })
  hospitalName: string;

  @Column({ default: false })
  fatalInjury: boolean;

  @Column({ type: 'date', nullable: true })
  dateOfDeath: Date;

  // Dangerous Occurrence Details (if applicable)
  @Column({ nullable: true })
  dangerousOccurrenceType: string;

  @Column({ type: 'text', nullable: true })
  dangerousOccurrenceDetails: string;

  // Root Cause & Investigation
  @Column({ type: 'text', nullable: true })
  immediateCause: string;

  @Column({ type: 'text', nullable: true })
  underlyingCause: string;

  @Column({ type: 'text', nullable: true })
  contributingFactors: string;

  @Column({ nullable: true })
  investigationOfficer: string;

  @Column({ type: 'text', nullable: true })
  investigationFindings: string;

  // Preventive Actions
  @Column({ type: 'jsonb', nullable: true })
  preventiveActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: 'PENDING' | 'COMPLETED';
    completedDate?: Date;
  }>;

  // HSE Interaction
  @Column({ default: false })
  hseInspectionConducted: boolean;

  @Column({ type: 'date', nullable: true })
  hseInspectionDate: Date;

  @Column({ nullable: true })
  hseInspectorName: string;

  @Column({ type: 'text', nullable: true })
  hseFindings: string;

  @Column({ default: false })
  enforcementActionTaken: boolean;

  @Column({ nullable: true })
  enforcementDetails: string;

  // Report Submission
  @Column({ nullable: true })
  submissionMethod: string; // Online, telephone, email

  @Column({ type: 'jsonb', nullable: true })
  submissionDetails: {
    submittedBy: string;
    submissionDate: Date;
    confirmationReceived: boolean;
    hseAcknowledgement: string;
  };

  // Witnesses
  @Column({ type: 'jsonb', nullable: true })
  witnesses: Array<{
    name: string;
    contactDetails: string;
    statementProvided: boolean;
    statementDate?: Date;
  }>;

  // Supporting Documentation
  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ type: 'simple-array', nullable: true })
  medicalReports: string[];

  // Legal & Insurance
  @Column({ default: false })
  insuranceNotified: boolean;

  @Column({ type: 'date', nullable: true })
  insuranceNotificationDate: Date;

  @Column({ nullable: true })
  insuranceClaimNumber: string;

  @Column({ default: false })
  legalActionPotential: boolean;

  @Column({ type: 'text', nullable: true })
  legalNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    legislationReferences?: string[];
    hseGuidanceUsed?: string[];
    additionalNotes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
