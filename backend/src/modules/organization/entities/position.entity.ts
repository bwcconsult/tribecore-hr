import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { Department } from './department.entity';

export enum PositionLevel {
  EXECUTIVE = 'EXECUTIVE', // C-Level, VP
  SENIOR_MANAGEMENT = 'SENIOR_MANAGEMENT', // Directors, Senior Managers
  MIDDLE_MANAGEMENT = 'MIDDLE_MANAGEMENT', // Managers, Team Leads
  PROFESSIONAL = 'PROFESSIONAL', // Senior specialists, experts
  INTERMEDIATE = 'INTERMEDIATE', // Mid-level staff
  ENTRY = 'ENTRY', // Junior, entry-level
  INTERN = 'INTERN', // Interns, trainees
}

@Entity('positions')
@Index(['organizationId', 'code'], { unique: true })
export class Position extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @Column({ type: 'enum', enum: PositionLevel })
  level: PositionLevel;

  @Column({ nullable: true })
  reportsToPositionId?: string;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'reportsToPositionId' })
  reportsTo?: Position;

  @Column({ type: 'int', default: 0 })
  hierarchyLevel: number; // 0 = CEO, 1 = reports to CEO, etc.

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minSalary?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxSalary?: number;

  @Column({ type: 'simple-array', nullable: true })
  requiredSkills?: string[];

  @Column({ type: 'simple-array', nullable: true })
  responsibilities?: string[];

  @Column({ type: 'simple-json', nullable: true })
  requirements?: {
    education?: string;
    experience?: string;
    certifications?: string[];
    [key: string]: any;
  };

  @Column({ default: 0 })
  headcount: number; // Number of people in this position

  @Column({ default: 0 })
  vacantPositions: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}
