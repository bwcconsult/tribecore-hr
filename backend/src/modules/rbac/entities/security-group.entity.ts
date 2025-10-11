import { Entity, Column, Index, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SecurityGroupType {
  DEPARTMENT = 'DEPARTMENT',
  TEAM = 'TEAM',
  PROJECT = 'PROJECT',
  LOCATION = 'LOCATION',
  CUSTOM = 'CUSTOM',
}

/**
 * SecurityGroup Entity
 * Defines hierarchical groups for data access control
 * Used for manager reporting lines, department access, etc.
 */
@Entity('security_groups')
export class SecurityGroup extends BaseEntity {
  @Column()
  name: string; // Engineering Team, London Office, HR Department

  @Column({
    type: 'enum',
    enum: SecurityGroupType,
  })
  type: SecurityGroupType;

  @Column({ nullable: true })
  description?: string;

  // Hierarchical structure
  @Column({ nullable: true })
  @Index()
  parentGroupId?: string;

  @ManyToOne(() => SecurityGroup, { nullable: true })
  @JoinColumn({ name: 'parentGroupId' })
  parentGroup?: SecurityGroup;

  // Manager/Owner of this group
  @Column({ nullable: true })
  @Index()
  managerId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: User;

  // Members of this group
  @ManyToMany(() => User)
  @JoinTable({
    name: 'security_group_members',
    joinColumn: { name: 'groupId' },
    inverseJoinColumn: { name: 'userId' },
  })
  members?: User[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional group metadata
}
