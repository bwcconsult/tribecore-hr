import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum ObjectiveStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  AT_RISK = 'AT_RISK',
  ON_TRACK = 'ON_TRACK',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  ARCHIVED = 'ARCHIVED',
}

export enum ObjectiveVisibility {
  PUBLIC = 'PUBLIC', // Visible to entire org
  TEAM = 'TEAM', // Visible to team only
  PRIVATE = 'PRIVATE', // Only owner and manager
}

export enum ConfidenceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('objectives')
export class Objective extends BaseEntity {
  @Column()
  ownerId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'ownerId' })
  owner: Employee;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  weight: number; // Percentage weight (0-100)

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne('Objective', 'children', { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: any;

  @OneToMany('Objective', 'parent')
  children: any[];

  @Column({
    type: 'enum',
    enum: ObjectiveVisibility,
    default: ObjectiveVisibility.PUBLIC,
  })
  visibility: ObjectiveVisibility;

  @Column({
    type: 'enum',
    enum: ObjectiveStatus,
    default: ObjectiveStatus.DRAFT,
  })
  status: ObjectiveStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 0-100%

  @Column({
    type: 'enum',
    enum: ConfidenceLevel,
    default: ConfidenceLevel.MEDIUM,
  })
  confidence: ConfidenceLevel;

  @Column({ type: 'text', nullable: true })
  blockers: string;

  @Column({ type: 'simple-array', nullable: true })
  evidenceLinks: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  template: string; // Delivery, Quality, Cost, People, Learning

  @Column({ default: false })
  discussInNextOneOnOne: boolean;

  @Column({ type: 'date', nullable: true })
  lastCheckInAt: Date;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @Column()
  createdBy: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'createdBy' })
  creator: Employee;

  @Column({ nullable: true })
  alignedToCompanyPillar: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    checkInFrequency?: string; // weekly, bi-weekly, monthly
    approvedBy?: string;
    approvedAt?: Date;
    archivedReason?: string;
  };
}
