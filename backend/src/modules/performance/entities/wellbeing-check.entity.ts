import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum WellbeingVisibility {
  PRIVATE_TO_EMPLOYEE = 'PRIVATE_TO_EMPLOYEE',
  VISIBLE_TO_MANAGER = 'VISIBLE_TO_MANAGER',
  VISIBLE_TO_HR = 'VISIBLE_TO_HR',
  AGGREGATED_ONLY = 'AGGREGATED_ONLY', // HR can see aggregated, not individual
}

@Entity('wellbeing_checks')
export class WellbeingCheck extends BaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'userId' })
  user: Employee;

  @Column({ type: 'int' })
  happiness: number; // 1-10

  @Column({ type: 'int' })
  motivation: number; // 1-10

  @Column({ type: 'int' })
  workLifeBalance: number; // 1-10

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: WellbeingVisibility,
    default: WellbeingVisibility.VISIBLE_TO_MANAGER,
  })
  visibility: WellbeingVisibility;

  @Column({ type: 'simple-array', nullable: true })
  concerns: string[]; // Workload, Career growth, Team dynamics, etc.

  @Column({ type: 'simple-array', nullable: true })
  positives: string[]; // What's going well

  @Column({ default: false })
  requestsSupport: boolean;

  @Column({ type: 'text', nullable: true })
  supportNeeded: string;

  @Column({ default: false })
  flaggedForReview: boolean; // Auto-flagged if scores are low

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  managerResponse: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    weekNumber?: number;
    correlatedPerformanceChange?: boolean;
    workloadHours?: number;
    onLeave?: boolean;
  };
}
