import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OffboardingStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OffboardingReason {
  RESIGNATION = 'RESIGNATION',
  REDUNDANCY = 'REDUNDANCY',
  RETIREMENT = 'RETIREMENT',
  DISMISSAL = 'DISMISSAL',
  CONTRACT_END = 'CONTRACT_END',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  OTHER = 'OTHER',
}

@Entity('offboarding_processes')
export class OffboardingProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: OffboardingStatus,
    default: OffboardingStatus.PLANNED,
  })
  status: OffboardingStatus;

  @Column({
    type: 'enum',
    enum: OffboardingReason,
  })
  reason: OffboardingReason;

  @Column()
  lastWorkingDay: Date;

  @Column({ nullable: true })
  noticeGivenDate: Date;

  @Column({ type: 'int', nullable: true })
  noticePeriodDays: number;

  @Column({ nullable: true })
  initiatedBy: string;

  @Column({ nullable: true })
  managerId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  exitInterviewNotes: string;

  @Column({ nullable: true })
  exitInterviewDate: Date;

  @Column({ nullable: true })
  exitInterviewConductedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  redundancyDetails: {
    isRedundancy: boolean;
    redundancyPackage?: number;
    redundancyReason?: string;
    consultationStartDate?: Date;
    consultationEndDate?: Date;
    alternativeRolesOffered?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  finalSettlement: {
    finalSalary?: number;
    accruedLeave?: number;
    leavePayment?: number;
    severancePay?: number;
    bonuses?: number;
    otherPayments?: number;
    totalPayment?: number;
    paymentDate?: Date;
  };

  @Column({ type: 'simple-array', nullable: true })
  assetIds: string[];

  @Column({ type: 'simple-array', nullable: true })
  completedTasks: string[];

  @Column({ type: 'simple-array', nullable: true })
  pendingTasks: string[];

  @Column({ default: false })
  accessRevoked: boolean;

  @Column({ nullable: true })
  accessRevokedDate: Date;

  @Column({ default: false })
  referenceProvided: boolean;

  @Column({ nullable: true })
  referenceProvidedDate: Date;

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
