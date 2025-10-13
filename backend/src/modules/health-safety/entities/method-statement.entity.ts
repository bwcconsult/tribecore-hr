import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MethodStatementStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_USE = 'IN_USE',
  SUPERSEDED = 'SUPERSEDED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('method_statements')
export class MethodStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  activity: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  client: string;

  @Column()
  preparedBy: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: MethodStatementStatus,
    default: MethodStatementStatus.DRAFT,
  })
  status: MethodStatementStatus;

  @Column({ type: 'jsonb' })
  scope: {
    objectives: string;
    limitations: string;
    assumptions: string;
  };

  @Column({ type: 'jsonb' })
  resources: {
    personnel: Array<{ role: string; quantity: number; qualifications: string[] }>;
    equipment: Array<{ item: string; quantity: number; inspectionRequired: boolean }>;
    materials: Array<{ item: string; quantity: number; hazardous: boolean }>;
  };

  @Column({ type: 'jsonb' })
  sequence: Array<{
    step: number;
    task: string;
    hazards: string[];
    controls: string[];
    ppe: string[];
    responsiblePerson: string;
    duration: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  relatedRiskAssessments: string[];

  @Column({ type: 'simple-array', nullable: true })
  permits: string[];

  @Column({ type: 'text', nullable: true })
  emergencyProcedures: string;

  @Column({ type: 'text', nullable: true })
  environmentalConsiderations: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'simple-array', nullable: true })
  diagrams: string[];

  @Column({ type: 'jsonb', nullable: true })
  trainingRequirements: {
    required: boolean;
    courses: string[];
    certifications: string[];
  };

  @Column({ type: 'simple-array', nullable: true })
  communicatedTo: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
