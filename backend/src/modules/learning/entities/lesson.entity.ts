import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum LessonType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  QUIZ = 'QUIZ',
  INTERACTIVE = 'INTERACTIVE',
  READING = 'READING',
  ASSIGNMENT = 'ASSIGNMENT',
  PRACTICAL = 'PRACTICAL',
  ASSESSMENT = 'ASSESSMENT',
}

@Entity('lessons')
export class Lesson extends BaseEntity {
  @Column()
  moduleId: string;

  @ManyToOne('CourseModule', 'lessons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module: any;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: LessonType,
  })
  type: LessonType;

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  contentUrl: string;

  @Column({ type: 'text', nullable: true })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  documentUrl: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  quiz: {
    questions: Array<{
      id: string;
      question: string;
      type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
      options?: string[];
      correctAnswer: string | string[];
      points: number;
      explanation?: string;
    }>;
    passingScore: number;
    timeLimit?: number;
    attempts: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  interactiveContent: {
    type: 'SCENARIO' | 'SIMULATION' | 'DRAG_DROP' | 'MATCHING';
    config: any;
  };

  @Column({ default: false })
  isPreview: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  completionCriteria: {
    minDuration?: number;
    requireQuizPass?: boolean;
    requireAssignment?: boolean;
    minScore?: number;
  };
}
