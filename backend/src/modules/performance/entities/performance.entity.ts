import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PerformanceReviewType } from '../../../common/enums';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('performance_reviews')
export class PerformanceReview extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  reviewerId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: Employee;

  @Column({
    type: 'enum',
    enum: PerformanceReviewType,
  })
  reviewType: PerformanceReviewType;

  @Column({ type: 'date' })
  reviewPeriodStart: Date;

  @Column({ type: 'date' })
  reviewPeriodEnd: Date;

  @Column({ type: 'date' })
  reviewDate: Date;

  @Column({ type: 'int' })
  overallRating: number; // 0-100 scale

  @Column({ type: 'jsonb', nullable: true })
  competencies?: Array<{
    name: string;
    rating: number; // 0-100 scale
    comments?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  goals?: Array<{
    description: string;
    status: string;
    achievement?: number;
    comments?: string;
  }>;

  @Column({ type: 'text', nullable: true })
  strengths?: string;

  @Column({ type: 'text', nullable: true })
  areasForImprovement?: string;

  @Column({ type: 'text', nullable: true })
  reviewerComments?: string;

  @Column({ type: 'text', nullable: true })
  employeeComments?: string;

  @Column({ type: 'jsonb', nullable: true })
  nextGoals?: Array<{
    description: string;
    targetDate?: Date;
    priority?: string;
  }>;

  @Column({ default: false })
  employeeAcknowledged: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
