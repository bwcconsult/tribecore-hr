import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AgencyWorkerStatus {
  ACTIVE = 'ACTIVE',
  QUALIFYING_PERIOD = 'QUALIFYING_PERIOD',
  EQUAL_TREATMENT_ELIGIBLE = 'EQUAL_TREATMENT_ELIGIBLE',
  ENDED = 'ENDED',
}

@Entity('agency_workers')
@Index(['workerId', 'assignmentStartDate'])
export class AgencyWorker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  workerId: string;

  @Column()
  agencyName: string;

  @Column({ nullable: true })
  agencyContact: string;

  @Column({ type: 'date' })
  assignmentStartDate: Date;

  @Column({ type: 'date', nullable: true })
  assignmentEndDate: Date;

  @Column()
  role: string;

  @Column()
  department: string;

  @Column({
    type: 'enum',
    enum: AgencyWorkerStatus,
    default: AgencyWorkerStatus.QUALIFYING_PERIOD,
  })
  status: AgencyWorkerStatus;

  @Column({ type: 'int', default: 0 })
  weeksWorked: number;

  @Column({ type: 'date', nullable: true })
  equalTreatmentEligibleDate: Date; // After 12 weeks

  @Column({ default: false })
  equalTreatmentApplied: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  comparableEmployeeRate: number;

  @Column({ default: false })
  payParityAchieved: boolean;

  @Column({ type: 'jsonb', nullable: true })
  entitlements: {
    annualLeave: boolean;
    sickPay: boolean;
    maternityPaternityPay: boolean;
    accessToFacilities: boolean;
    accessToVacancies: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  weeklyRecords: Array<{
    weekStartDate: Date;
    weekEndDate: Date;
    hoursWorked: number;
    daysBroken: number;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
