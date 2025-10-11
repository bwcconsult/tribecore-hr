import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LEADERSHIP = 'LEADERSHIP',
  LANGUAGE = 'LANGUAGE',
  CERTIFICATION = 'CERTIFICATION',
  OTHER = 'OTHER',
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

@Entity('skills')
@Index(['category', 'name'])
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: SkillCategory,
    default: SkillCategory.TECHNICAL,
  })
  @Index()
  category: SkillCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('person_skills')
@Index(['personId', 'skillId'])
export class PersonSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column()
  @Index()
  skillId: string;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.BEGINNER,
  })
  level: ProficiencyLevel;

  @Column({ type: 'date', nullable: true })
  acquiredDate: Date;

  @Column({ type: 'date', nullable: true })
  lastUsedDate: Date;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience: number;

  // Validation/endorsement
  @Column({ nullable: true })
  validatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
