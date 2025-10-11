import { Entity, Column, Index, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

/**
 * Permission Entity
 * Defines granular permissions for features, actions, and scopes
 * 
 * Examples:
 * - feature: 'absence', action: 'approve', scope: 'team'
 * - feature: 'employee', action: 'view', scope: 'org'
 * - feature: 'payroll', action: 'process', scope: 'system'
 */
@Entity('permissions')
@Index(['feature', 'action', 'scope'], { unique: true })
export class Permission extends BaseEntity {
  @Column()
  name: string; // Human-readable name: "Approve Team Absences"

  @Column()
  feature: string; // absence, employee, payroll, document, etc.

  @Column()
  action: string; // create, read, update, delete, approve, reject, etc.

  @Column()
  scope: string; // self, team, org, system

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [],
  })
  assignableRoles: UserRole[]; // Which roles can have this permission

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, any>; // Additional conditions (e.g., department, location)
}
