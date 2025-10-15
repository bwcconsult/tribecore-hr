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
import { Department } from './department.entity';
import { Position } from './position.entity';

export enum NodeType {
  EMPLOYEE = 'EMPLOYEE',
  POSITION = 'POSITION', // Vacant position
  DEPARTMENT = 'DEPARTMENT', // Department node
}

@Entity('org_chart_nodes')
export class OrgChartNode extends BaseEntity {
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'enum', enum: NodeType })
  nodeType: NodeType;

  @Column({ nullable: true })
  employeeId?: string; // Reference to Employee

  @Column({ nullable: true })
  positionId?: string;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'positionId' })
  position?: Position;

  @Column({ nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @Column({ nullable: true })
  parentNodeId?: string;

  @ManyToOne(() => OrgChartNode, (node) => node.children, { nullable: true })
  @JoinColumn({ name: 'parentNodeId' })
  parentNode?: OrgChartNode;

  @OneToMany(() => OrgChartNode, (node) => node.parentNode)
  children: OrgChartNode[];

  @Column({ type: 'int', default: 0 })
  level: number; // Hierarchy level

  @Column({ type: 'simple-array', nullable: true })
  path?: string[]; // Array of ancestor IDs for quick traversal

  @Column({ default: 0 })
  directReports: number;

  @Column({ default: 0 })
  totalReports: number; // Including indirect reports

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveFrom?: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo?: Date;

  @Column({ type: 'simple-json', nullable: true })
  displaySettings?: {
    color?: string;
    icon?: string;
    highlighted?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}
