import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT = 'SOFT',
  LEADERSHIP = 'LEADERSHIP',
  DOMAIN = 'DOMAIN',
  LANGUAGE = 'LANGUAGE',
  CERTIFICATION = 'CERTIFICATION',
}

@Entity('skills')
export class Skill extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column({ unique: true })
  skillCode: string; // 'SKILL-PYTHON', 'SKILL-LEADERSHIP'

  @Column()
  @Index()
  skillName: string; // 'Python Programming', 'Leadership'

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SkillCategory,
  })
  category: SkillCategory;

  @Column({ type: 'simple-array', nullable: true })
  aliases?: string[]; // 'React.js', 'ReactJS', 'React'

  @Column({ nullable: true })
  proficiencyLevels?: string; // '1-Beginner, 2-Intermediate, 3-Advanced, 4-Expert'

  @Column({ default: false })
  isCritical: boolean; // Strategic skill for org

  @Column({ default: false })
  isEmerging: boolean; // Trending/future skill

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
