import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Course } from './course.entity';

@Entity('course_modules')
export class CourseModule extends BaseEntity {
  @Column()
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany('Lesson', 'module', { cascade: true })
  lessons: any[];

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  learningObjectives: string;

  @Column({ type: 'jsonb', nullable: true })
  resources: Array<{
    title: string;
    type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT';
    url: string;
  }>;

  @Column({ default: true })
  isActive: boolean;
}
