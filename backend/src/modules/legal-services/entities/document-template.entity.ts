import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateCategory {
  CONTRACT = 'CONTRACT',
  POLICY = 'POLICY',
  LETTER = 'LETTER',
  FORM = 'FORM',
  HANDBOOK = 'HANDBOOK',
  AGREEMENT = 'AGREEMENT',
}

@Entity('document_templates')
export class DocumentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  organizationId: string; // null for system templates

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
  })
  category: TemplateCategory;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text' })
  content: string; // HTML or markdown content with placeholders

  @Column({ type: 'jsonb', nullable: true })
  placeholders: Array<{
    key: string;
    label: string;
    type: string; // 'text', 'date', 'number', 'select'
    required: boolean;
    options?: string[];
  }>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemTemplate: boolean; // Created by TribeCore

  @Column({ nullable: true })
  previewUrl: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    jurisdiction?: string;
    industry?: string;
    updatedBy?: string;
    version?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
