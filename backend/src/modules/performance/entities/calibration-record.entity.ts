import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ReviewCycle } from './review-cycle.entity';

export enum PotentialLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('calibration_records')
export class CalibrationRecord extends BaseEntity {
  @Column()
  cycleId: string;

  @ManyToOne(() => ReviewCycle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycleId' })
  cycle: ReviewCycle;

  @Column()
  userId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  preCalibrationRating: number; // Manager's initial rating

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  finalRating: number; // Post-calibration rating

  @Column({
    type: 'enum',
    enum: PotentialLevel,
    nullable: true,
  })
  potential: PotentialLevel; // For 9-box grid

  @Column({ type: 'text', nullable: true })
  calibrationNotes: string;

  @Column({ type: 'text', nullable: true })
  justification: string; // Why the rating changed

  @Column({ nullable: true })
  approverId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approverId' })
  approver: Employee;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ default: false })
  isDisputed: boolean;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  changeLog: Array<{
    timestamp: Date;
    changedBy: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  biasIndicators: {
    varianceFromPeerMean?: number;
    ratingInflation?: boolean;
    ratingDeflation?: boolean;
    demographicBias?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    department?: string;
    level?: string;
    tenure?: number;
    compImpact?: string; // Merit increase percentage
    promotionRecommended?: boolean;
    retentionRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}
