import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum TrainingCategory {
  STATUTORY = 'STATUTORY',
  MANDATORY = 'MANDATORY',
  ROLE_SPECIFIC = 'ROLE_SPECIFIC',
  OPTIONAL = 'OPTIONAL',
}

export enum ComplianceFrequency {
  INDUCTION_ONLY = 'INDUCTION_ONLY',
  ANNUAL = 'ANNUAL',
  BIENNIAL = 'BIENNIAL',
  TRIENNIAL = 'TRIENNIAL',
  UPON_CHANGE = 'UPON_CHANGE',
  AS_NEEDED = 'AS_NEEDED',
}

@Entity('mandatory_training_templates')
export class MandatoryTrainingTemplate extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TrainingCategory,
  })
  category: TrainingCategory;

  @Column({ type: 'simple-array' })
  ukLegislation: string[];

  @Column({
    type: 'enum',
    enum: ComplianceFrequency,
  })
  frequency: ComplianceFrequency;

  @Column({ type: 'int' })
  validityMonths: number;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'simple-array' })
  applicableTo: string[];

  @Column({ type: 'text' })
  whatItCovers: string;

  @Column({ type: 'jsonb' })
  learningOutcomes: string[];

  @Column({ type: 'jsonb', nullable: true })
  targetRoles: string[];

  @Column({ type: 'jsonb', nullable: true })
  targetDepartments: string[];

  @Column({ default: false })
  requiresAssessment: boolean;

  @Column({ type: 'int', nullable: true })
  minimumPassingScore: number;

  @Column({ default: false })
  requiresCertification: boolean;

  @Column({ type: 'text', nullable: true })
  regulatoryBody: string;

  @Column({ type: 'text', nullable: true })
  penalties: string;

  @Column({ type: 'jsonb', nullable: true })
  courseStructure: {
    modules: Array<{
      title: string;
      topics: string[];
      duration: number;
    }>;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;
}
