import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClaimType {
  UNFAIR_DISMISSAL = 'UNFAIR_DISMISSAL',
  DISCRIMINATION = 'DISCRIMINATION',
  HARASSMENT = 'HARASSMENT',
  WRONGFUL_TERMINATION = 'WRONGFUL_TERMINATION',
  BREACH_OF_CONTRACT = 'BREACH_OF_CONTRACT',
  EMPLOYMENT_TRIBUNAL = 'EMPLOYMENT_TRIBUNAL',
}

export enum ClaimStatus {
  REPORTED = 'REPORTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_LITIGATION = 'IN_LITIGATION',
  SETTLED = 'SETTLED',
  CLOSED = 'CLOSED',
}

@Entity('hr_insurance_claims')
export class HRInsuranceClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  claimNumber: string;

  @Column({
    type: 'enum',
    enum: ClaimType,
  })
  type: ClaimType;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.REPORTED,
  })
  status: ClaimStatus;

  @Column()
  employeeId: string;

  @Column()
  reportedBy: string;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  claimAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  settlementAmount: number;

  @Column({ nullable: true })
  insuranceProvider: string;

  @Column({ nullable: true })
  policyNumber: string;

  @Column({ nullable: true })
  claimReferenceNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  @Column({ type: 'text', nullable: true })
  legalAdvice: string;

  @Column({ nullable: true })
  assignedLawyer: string;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    date: Date;
    event: string;
    description: string;
    performedBy: string;
  }>;

  @Column({ type: 'text', nullable: true })
  outcomeNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
