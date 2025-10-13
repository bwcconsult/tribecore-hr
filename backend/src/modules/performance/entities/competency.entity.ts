import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CompetencyCategory {
  TECHNICAL = 'TECHNICAL',
  LEADERSHIP = 'LEADERSHIP',
  COLLABORATION = 'COLLABORATION',
  COMMUNICATION = 'COMMUNICATION',
  PROBLEM_SOLVING = 'PROBLEM_SOLVING',
  CUSTOMER_FOCUS = 'CUSTOMER_FOCUS',
  INNOVATION = 'INNOVATION',
  DELIVERY = 'DELIVERY',
}

@Entity('competencies')
export class Competency extends BaseEntity {
  @Column({ unique: true })
  key: string; // e.g., 'technical_depth', 'problem_solving'

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: CompetencyCategory,
  })
  category: CompetencyCategory;

  @Column({ type: 'jsonb' })
  levelDescriptors: {
    [level: string]: {
      // e.g., 'junior', 'mid', 'senior', 'staff', 'principal'
      expectedBehaviors: string[];
      examples: string[];
    };
  };

  @Column({ type: 'simple-array', nullable: true })
  applicableRoles: string[]; // null = all roles

  @Column({ type: 'simple-array', nullable: true })
  applicableDepartments: string[]; // null = all departments

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    relatedSkills?: string[];
    learningResources?: string[];
    associatedValues?: string[];
  };
}
