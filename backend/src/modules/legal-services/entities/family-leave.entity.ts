import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FamilyLeaveType {
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  ADOPTION = 'ADOPTION',
  SHARED_PARENTAL = 'SHARED_PARENTAL',
  PARENTAL = 'PARENTAL',
  CARER = 'CARER',
  TIME_OFF_FOR_DEPENDANTS = 'TIME_OFF_FOR_DEPENDANTS',
}

export enum FamilyLeaveStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  RETURNED = 'RETURNED',
  EXTENDED = 'EXTENDED',
  CANCELLED = 'CANCELLED',
}

@Entity('family_leave')
@Index(['employeeId', 'leaveType'])
export class FamilyLeave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  @Index()
  employeeId: string;

  @Column({ unique: true })
  leaveNumber: string;

  @Column({
    type: 'enum',
    enum: FamilyLeaveType,
  })
  leaveType: FamilyLeaveType;

  @Column({
    type: 'enum',
    enum: FamilyLeaveStatus,
    default: FamilyLeaveStatus.REQUESTED,
  })
  status: FamilyLeaveStatus;

  @Column({ type: 'date' })
  requestDate: Date;

  @Column({ type: 'date' })
  expectedStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date' })
  expectedReturnDate: Date;

  @Column({ type: 'date', nullable: true })
  actualReturnDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date; // For maternity/adoption

  @Column({ type: 'date', nullable: true })
  childBirthDate: Date;

  @Column({ type: 'int' })
  totalWeeksEntitled: number;

  @Column({ type: 'int' })
  paidWeeks: number;

  @Column({ type: 'int' })
  unpaidWeeks: number;

  @Column({ type: 'int', nullable: true })
  weeksTaken: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  statutoryPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  enhancedPay: number;

  @Column({ default: false })
  keepInTouchDaysUsed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  keepInTouchDays: Array<{
    date: Date;
    hours: number;
    pay: number;
  }>;

  @Column({ default: false })
  isSharedParentalLeave: boolean;

  @Column({ nullable: true })
  partnerEmployeeId: string;

  @Column({ type: 'jsonb', nullable: true })
  sharedParentalLeaveBlocks: Array<{
    startDate: Date;
    endDate: Date;
    weeks: number;
  }>;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  @Column({ default: false })
  rightToReturnConfirmed: boolean;

  @Column({ type: 'text', nullable: true })
  returnToWorkPlan: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
