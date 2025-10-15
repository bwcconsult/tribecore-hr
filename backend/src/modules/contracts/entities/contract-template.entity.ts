import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('contract_templates')
@Index(['organizationId', 'type', 'isActive'])
export class ContractTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  name: string;

  @Column()
  type: string; // EMPLOYMENT, VENDOR, NDA, etc.

  @Column('text', { nullable: true })
  description: string;

  @Column('text')
  content: string; // HTML/Rich text template

  @Column({ nullable: true })
  documentUrl: string; // URL to DOCX/PDF template

  @Column('simple-array')
  mergeFields: string[]; // [{{EMPLOYEE_NAME}}, {{START_DATE}}, {{SALARY}}]

  @Column('simple-array', { nullable: true })
  defaultClauseKeys: string[]; // Clause library keys to include

  @Column({ nullable: true })
  jurisdiction: string;

  @Column('simple-array', { nullable: true })
  applicableDepartments: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  requiresLegalReview: boolean;

  @Column({ default: false })
  requiresFinanceApproval: boolean;

  // Auto-routing rules
  @Column('simple-json', { nullable: true })
  approvalRules: Record<string, any>; // Policy-based routing logic

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  supersedesId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
