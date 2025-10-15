import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardingTemplate } from './onboarding-template.entity';

@Entity('checklist_items')
export class ChecklistItem extends BaseEntity {
  @Column()
  templateId: string;

  @ManyToOne(() => OnboardingTemplate, template => template.checklistItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: OnboardingTemplate;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  ownerRole: string; // HR_ADMIN, IT_ADMIN, MANAGER, PAYROLL, etc.

  @Column({ type: 'int' })
  durationDays: number; // Negative = before start date, 0 = day 1, positive = after

  @Column({ default: true })
  required: boolean;

  @Column({ type: 'jsonb', default: [] })
  dependencies: string[]; // Task names that must be completed first

  @Column({ type: 'int', nullable: true })
  slaHours: number;

  @Column({ type: 'int', default: 0 })
  orderIndex: number; // For sorting

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category?: string;
    instructions?: string;
    documents?: string[];
    [key: string]: any;
  };
}
