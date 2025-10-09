import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum CourseType {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID',
  SELF_PACED = 'SELF_PACED',
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  EXPIRED = 'EXPIRED',
}

@Entity('courses')
export class Course extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  category?: string;

  @Column({
    type: 'enum',
    enum: CourseType,
  })
  type: CourseType;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ nullable: true })
  instructor?: string;

  @Column({ nullable: true })
  instructorBio?: string;

  @Column({ type: 'int', default: 0 })
  durationHours: number;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  modules?: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'ASSIGNMENT';
      contentUrl?: string;
      duration?: number;
      order: number;
    }>;
  }>;

  @Column({ default: false })
  isMandatory: boolean;

  @Column({ type: 'jsonb', nullable: true })
  targetAudience?: {
    departments?: string[];
    roles?: string[];
    minTenure?: number;
  };

  @Column({ type: 'date', nullable: true })
  publishedDate?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'int', default: 0 })
  enrollmentCount: number;

  @Column({ type: 'int', default: 0 })
  completionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: false })
  hasCertificate: boolean;

  @Column({ nullable: true })
  certificateTemplate?: string;

  @Column({ type: 'text', nullable: true })
  prerequisites?: string;
}

@Entity('course_enrollments')
export class CourseEnrollment extends BaseEntity {
  @Column()
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  enrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  completionDate?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  status: EnrollmentStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'int', default: 0 })
  hoursCompleted: number;

  @Column({ type: 'jsonb', nullable: true })
  completedLessons?: string[];

  @Column({ type: 'int', nullable: true })
  score?: number;

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ nullable: true })
  certificateUrl?: string;

  @Column({ default: false })
  isMandatory: boolean;

  @Column({ nullable: true })
  assignedBy?: string;
}
