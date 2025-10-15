import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('onboarding_templates')
export class OnboardingTemplate extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 3 })
  country: string; // ISO code

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => require('./checklist-item.entity').ChecklistItem, item => item.template, { cascade: true })
  checklistItems: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    estimatedDays?: number;
    targetRole?: string;
    department?: string;
    [key: string]: any;
  };
}
