import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum OnboardingStatus {
  OFFER_PENDING = 'OFFER_PENDING',
  OFFER_SIGNED = 'OFFER_SIGNED',
  PRE_BOARDING = 'PRE_BOARDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('onboard_cases')
export class OnboardCase extends BaseEntity {
  @Column({ nullable: true })
  candidateId: string; // Reference to recruitment candidate

  @Column({ nullable: true })
  employeeId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  organizationId: string;

  @Column({ length: 3 })
  country: string; // ISO code

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  department: string;

  @Column()
  jobTitle: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.OFFER_PENDING,
  })
  status: OnboardingStatus;

  @Column({ nullable: true })
  roleBlueprintId: string;

  @Column({ nullable: true })
  hiringManagerId: string;

  @Column({ nullable: true })
  buddyId: string;

  @Column({ nullable: true })
  mentorId: string;

  // Pre-boarding
  @Column({ default: false })
  preBoardingPortalAccessed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  preBoardingCompletedAt: Date;

  // Provisioning
  @Column({ default: false })
  provisioningComplete: boolean;

  @Column({ type: 'timestamp', nullable: true })
  provisioningCompletedAt: Date;

  // Day 1
  @Column({ default: false })
  day1ChecklistComplete: boolean;

  @Column({ default: false })
  welcomeMeetingHeld: boolean;

  // Compliance
  @Column({ default: false })
  rightToWorkVerified: boolean;

  @Column({ default: false })
  backgroundCheckComplete: boolean;

  @Column({ default: false })
  policiesSignedOff: boolean;

  // Benefits & Payroll
  @Column({ default: false })
  benefitsEnrolled: boolean;

  @Column({ default: false })
  payrollSetupComplete: boolean;

  // Training
  @Column({ type: 'int', default: 0 })
  trainingCoursesAssigned: number;

  @Column({ type: 'int', default: 0 })
  trainingCoursesCompleted: number;

  // Probation
  @Column({ type: 'int', default: 90 })
  probationPeriodDays: number;

  @Column({ type: 'date', nullable: true })
  probationEndDate: Date;

  @Column({ default: false })
  probationReviewScheduled: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    salary?: number;
    currency?: string;
    equipmentPreferences?: any;
    dietaryRequirements?: string;
    accessibilityNeeds?: string;
    emergencyContact?: any;
    [key: string]: any;
  };

  /**
   * Calculate days until start
   */
  getDaysUntilStart(): number {
    const now = new Date();
    const start = new Date(this.startDate);
    const diff = start.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if ready for day 1
   */
  isReadyForDay1(): boolean {
    return (
      this.provisioningComplete &&
      this.rightToWorkVerified &&
      this.backgroundCheckComplete &&
      this.payrollSetupComplete
    );
  }

  /**
   * Calculate onboarding completion %
   */
  getCompletionPercentage(): number {
    const checks = [
      this.preBoardingCompletedAt !== null,
      this.provisioningComplete,
      this.rightToWorkVerified,
      this.backgroundCheckComplete,
      this.policiesSignedOff,
      this.benefitsEnrolled,
      this.payrollSetupComplete,
      this.day1ChecklistComplete,
      this.welcomeMeetingHeld,
      this.trainingCoursesCompleted === this.trainingCoursesAssigned,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }
}
