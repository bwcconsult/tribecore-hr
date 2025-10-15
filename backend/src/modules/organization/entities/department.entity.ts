import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';

@Entity('departments')
@Index(['organizationId', 'code'], { unique: true })
export class Department extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  parentDepartmentId?: string;

  @ManyToOne(() => Department, (dept) => dept.children, { nullable: true })
  @JoinColumn({ name: 'parentDepartmentId' })
  parentDepartment?: Department;

  @OneToMany(() => Department, (dept) => dept.parentDepartment)
  children: Department[];

  @Column({ nullable: true })
  headOfDepartmentId?: string; // Employee ID

  @Column({ default: 0 })
  employeeCount: number;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  costCenter?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: {
    floor?: string;
    building?: string;
    contactEmail?: string;
    contactPhone?: string;
    budget?: number;
    [key: string]: any;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  level: number; // Hierarchy level (0 = top level)

  @Column({ nullable: true })
  color?: string; // For visualization

  @Column({ nullable: true })
  icon?: string; // Icon identifier
}
