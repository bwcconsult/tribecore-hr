import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IncidentType {
  ACCIDENT = 'ACCIDENT',
  NEAR_MISS = 'NEAR_MISS',
  DANGEROUS_OCCURRENCE = 'DANGEROUS_OCCURRENCE',
  OCCUPATIONAL_ILL_HEALTH = 'OCCUPATIONAL_ILL_HEALTH',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
}

export enum IncidentSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SERIOUS = 'SERIOUS',
  MAJOR = 'MAJOR',
  FATAL = 'FATAL',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  INVESTIGATED = 'INVESTIGATED',
  CLOSED = 'CLOSED',
  RIDDOR_REPORTABLE = 'RIDDOR_REPORTABLE',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  incidentNumber: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
  })
  severity: IncidentSeverity;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.REPORTED,
  })
  status: IncidentStatus;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  incidentDateTime: Date;

  @Column()
  location: string;

  @Column({ nullable: true })
  specificLocation: string;

  @Column()
  reportedBy: string;

  @Column({ nullable: true })
  witnessedBy: string;

  @Column({ type: 'simple-array', nullable: true })
  personsInvolved: string[];

  @Column({ type: 'simple-array', nullable: true })
  witnesses: string[];

  @Column({ type: 'text', nullable: true })
  immediateAction: string;

  @Column({ type: 'text', nullable: true })
  injuryDetails: string;

  @Column({ default: false })
  medicalTreatmentRequired: boolean;

  @Column({ default: false })
  hospitalVisit: boolean;

  @Column({ type: 'int', default: 0 })
  daysLost: number;

  @Column({ default: false })
  isRIDDORReportable: boolean;

  @Column({ nullable: true })
  riddorReference: string;

  @Column({ type: 'date', nullable: true })
  riddorReportedDate: Date;

  @Column({ nullable: true })
  investigationOfficer: string;

  @Column({ type: 'text', nullable: true })
  rootCause: string;

  @Column({ type: 'text', nullable: true })
  contributingFactors: string;

  @Column({ type: 'jsonb', nullable: true })
  correctiveActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
    completedDate?: Date;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ type: 'jsonb', nullable: true })
  costImpact: {
    medicalCosts?: number;
    propertyCosts?: number;
    productionLoss?: number;
    totalCost?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
