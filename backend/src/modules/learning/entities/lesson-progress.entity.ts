import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseEnrollment } from './course.entity';
import { Lesson } from './lesson.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum LessonProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('lesson_progress')
export class LessonProgress extends BaseEntity {
  @Column()
  enrollmentId: string;

  @ManyToOne(() => CourseEnrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: CourseEnrollment;

  @Column()
  lessonId: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: LessonProgressStatus,
    default: LessonProgressStatus.NOT_STARTED,
  })
  status: LessonProgressStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'int', default: 0 })
  timeSpentSeconds: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ type: 'int', nullable: true })
  quizScore: number;

  @Column({ type: 'int', default: 0 })
  quizAttempts: number;

  @Column({ type: 'jsonb', nullable: true })
  quizAnswers: Array<{
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
    attemptNumber: number;
    timestamp: Date;
  }>;

  @Column({ type: 'text', nullable: true })
  assignmentSubmission: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    videoPosition?: number;
    documentPage?: number;
    interactions?: any[];
    lastPosition?: any;
  };
}
