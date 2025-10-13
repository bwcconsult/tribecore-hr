import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ContractType {
  PERMANENT = 'PERMANENT',
  FIXED_TERM = 'FIXED_TERM',
  TEMPORARY = 'TEMPORARY',
  ZERO_HOURS = 'ZERO_HOURS',
  APPRENTICESHIP = 'APPRENTICESHIP',
  AGENCY = 'AGENCY',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  SENT_TO_EMPLOYEE = 'SENT_TO_EMPLOYEE',
  SIGNED = 'SIGNED',
  ACTIVE = 'ACTIVE',
  AMENDED = 'AMENDED',
  TERMINATED = 'TERMINATED',
  EXPIRED = 'EXPIRED',
}

@Entity('employment_contracts')
@Index(['employeeId', 'status'])
export class EmploymentContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  employeeId: string;

  @Column({ unique: true })
  contractNumber: string;

  @Column({
    type: 'enum',
    enum: ContractType,
  })
  contractType: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column()
  jobTitle: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  reportingTo: string;

  @Column()
  workLocation: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({ default: 'GBP' })
  currency: string;

  @Column()
  salaryPeriod: string; // 'ANNUAL', 'MONTHLY', 'WEEKLY', 'HOURLY'

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hoursPerWeek: number;

  @Column({ type: 'jsonb', nullable: true })
  workingPattern: {
    monday: { hours: number; startTime?: string; endTime?: string };
    tuesday: { hours: number; startTime?: string; endTime?: string };
    wednesday: { hours: number; startTime?: string; endTime?: string };
    thursday: { hours: number; startTime?: string; endTime?: string };
    friday: { hours: number; startTime?: string; endTime?: string };
    saturday: { hours: number; startTime?: string; endTime?: string };
    sunday: { hours: number; startTime?: string; endTime?: string };
  };

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  annualLeaveEntitlement: number; // weeks

  @Column({ type: 'int', nullable: true })
  noticePeriodDays: number;

  @Column({ type: 'int', nullable: true })
  probationPeriodDays: number;

  @Column({ type: 'date', nullable: true })
  probationEndDate: Date;

  @Column({ default: false })
  probationPassed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  benefits: Array<{
    benefit: string;
    value: number;
    description: string;
  }>;

  @Column({ type: 'text', nullable: true })
  pensionScheme: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employerPensionContribution: number; // percentage

  @Column({ type: 'text', nullable: true })
  restrictiveCovenants: string;

  @Column({ default: false })
  confidentialityClause: boolean;

  @Column({ default: false })
  nonCompeteClause: boolean;

  @Column({ type: 'int', nullable: true })
  nonCompeteMonths: number;

  @Column({ default: false })
  intellectualPropertyClause: boolean;

  @Column({ type: 'text', nullable: true })
  additionalTerms: string;

  @Column({ nullable: true })
  contractTemplateId: string;

  @Column({ nullable: true })
  documentUrl: string;

  @Column({ type: 'date', nullable: true })
  sentToEmployeeDate: Date;

  @Column({ type: 'date', nullable: true })
  signedDate: Date;

  @Column({ nullable: true })
  signedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  amendments: Array<{
    date: Date;
    amendedBy: string;
    changes: string;
    reason: string;
    newContractId?: string;
  }>;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ nullable: true })
  terminationReason: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
