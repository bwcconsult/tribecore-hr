import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Skill } from './skill.entity';

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum SkillSource {
  SELF_REPORTED = 'SELF_REPORTED',
  MANAGER_ENDORSED = 'MANAGER_ENDORSED',
  PEER_ENDORSED = 'PEER_ENDORSED',
  ASSESSMENT = 'ASSESSMENT',
  CERTIFICATION = 'CERTIFICATION',
  PROJECT = 'PROJECT',
}

@Entity('employee_skills')
@Index(['employeeId', 'skillId'], { unique: true })
export class EmployeeSkill extends BaseEntity {
  @Column()
  @Index()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  @Index()
  skillId: string;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
  })
  proficiencyLevel: ProficiencyLevel;

  @Column({ type: 'int', nullable: true })
  proficiencyScore?: number; // 0-100

  @Column({
    type: 'enum',
    enum: SkillSource,
  })
  source: SkillSource;

  @Column({ type: 'date', nullable: true })
  acquiredDate?: Date;

  @Column({ type: 'date', nullable: true })
  lastUsedDate?: Date;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verifiedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'int', default: 0 })
  endorsementCount: number;

  @Column({ default: true })
  willingToMentor: boolean;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: {
    certifications?: string[];
    projects?: string[];
    assessments?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
