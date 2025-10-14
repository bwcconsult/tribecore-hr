import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ConsultationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('redundancy_groups')
export class RedundancyGroup extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  businessUnit: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'int' })
  affectedHeadcount: number;

  @Column({ type: 'int', default: 0 })
  collectiveThreshold: number; // 20+ or 100+ for UK collective consultation

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  proposedCompletionDate: Date;

  @Column({
    type: 'enum',
    enum: ConsultationStatus,
    default: ConsultationStatus.NOT_STARTED,
  })
  consultationStatus: ConsultationStatus;

  // Consultation timeline (UK specific)
  @Column({ type: 'int', default: 30 })
  consultationDays: number; // 30 days for 20-99, 45 days for 100+

  @Column({ type: 'date', nullable: true })
  consultationStartDate: Date;

  @Column({ type: 'date', nullable: true })
  consultationEndDate: Date;

  @Column({ default: false })
  employeeRepsElected: boolean;

  @Column({ type: 'jsonb', default: [] })
  employeeReps: Array<{
    employeeId: string;
    name: string;
    electedAt: Date;
  }>;

  // Selection criteria
  @Column({ type: 'jsonb', default: [] })
  selectionCriteria: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    reverseScore: boolean; // true if lower is better (e.g., disciplinary)
    maxScore: number;
  }>;

  // Consultation meetings
  @Column({ type: 'jsonb', default: [] })
  consultationMeetings: Array<{
    date: Date;
    attendees: string[];
    minutes: string;
    documentsUrl: string[];
  }>;

  // Legal notices
  @Column({ default: false })
  hr1FormSubmitted: boolean; // UK: Notify Secretary of State

  @Column({ type: 'date', nullable: true })
  hr1SubmissionDate: Date;

  // Risks & appeals
  @Column({ type: 'jsonb', default: [] })
  risks: Array<{
    type: string;
    description: string;
    severity: string;
    mitigation: string;
  }>;

  @Column({ type: 'int', default: 0 })
  appealsCount: number;

  // Cost tracking
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSeveranceCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRetrainingCost: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    reason?: string;
    businessCase?: string;
    alternativesConsidered?: string[];
    [key: string]: any;
  };

  /**
   * Check if collective consultation required (UK)
   */
  requiresCollectiveConsultation(country: string): boolean {
    if (country === 'GB') {
      return this.affectedHeadcount >= 20;
    }
    // EU countries have similar rules
    return false;
  }

  /**
   * Calculate required consultation days (UK)
   */
  calculateConsultationDays(country: string): number {
    if (country === 'GB') {
      if (this.affectedHeadcount >= 100) return 45;
      if (this.affectedHeadcount >= 20) return 30;
    }
    return 0;
  }

  /**
   * Check if all legal requirements met
   */
  canProceedWithDismissals(): boolean {
    return (
      this.consultationStatus === ConsultationStatus.COMPLETED &&
      this.hr1FormSubmitted &&
      this.consultationEndDate <= new Date()
    );
  }
}
