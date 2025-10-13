import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ProtectedCharacteristic {
  AGE = 'AGE',
  DISABILITY = 'DISABILITY',
  GENDER_REASSIGNMENT = 'GENDER_REASSIGNMENT',
  MARRIAGE_CIVIL_PARTNERSHIP = 'MARRIAGE_CIVIL_PARTNERSHIP',
  PREGNANCY_MATERNITY = 'PREGNANCY_MATERNITY',
  RACE = 'RACE',
  RELIGION_BELIEF = 'RELIGION_BELIEF',
  SEX = 'SEX',
  SEXUAL_ORIENTATION = 'SEXUAL_ORIENTATION',
}

export enum DiscriminationType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  HARASSMENT = 'HARASSMENT',
  VICTIMISATION = 'VICTIMISATION',
  FAILURE_TO_MAKE_ADJUSTMENTS = 'FAILURE_TO_MAKE_ADJUSTMENTS',
}

export enum EqualityCaseStatus {
  REPORTED = 'REPORTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  MEDIATION = 'MEDIATION',
  FORMAL_PROCESS = 'FORMAL_PROCESS',
  RESOLVED = 'RESOLVED',
  ESCALATED_TO_TRIBUNAL = 'ESCALATED_TO_TRIBUNAL',
  CLOSED = 'CLOSED',
}

@Entity('equality_cases')
export class EqualityCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  caseNumber: string;

  @Column()
  employeeId: string;

  @Column()
  reportedBy: string;

  @Column({
    type: 'enum',
    enum: ProtectedCharacteristic,
  })
  protectedCharacteristic: ProtectedCharacteristic;

  @Column({
    type: 'enum',
    enum: DiscriminationType,
  })
  discriminationType: DiscriminationType;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  witnessStatements: string;

  @Column({ type: 'simple-array', nullable: true })
  witnesses: string[];

  @Column({ nullable: true })
  allegedDiscriminator: string;

  @Column({
    type: 'enum',
    enum: EqualityCaseStatus,
    default: EqualityCaseStatus.REPORTED,
  })
  status: EqualityCaseStatus;

  @Column({ nullable: true })
  investigator: string;

  @Column({ type: 'date', nullable: true })
  investigationStartDate: Date;

  @Column({ type: 'text', nullable: true })
  investigationFindings: string;

  @Column({ type: 'text', nullable: true })
  actionsTaken: string;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    date: Date;
    event: string;
    description: string;
    performedBy: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  @Column({ default: false })
  escalatedToTribunal: boolean;

  @Column({ type: 'date', nullable: true })
  tribunalDate: Date;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  compensationAmount: number;

  @Column({ default: false })
  requiresReasonableAdjustments: boolean;

  @Column({ type: 'jsonb', nullable: true })
  reasonableAdjustments: Array<{
    adjustment: string;
    implementationDate: Date;
    cost: number;
    status: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
