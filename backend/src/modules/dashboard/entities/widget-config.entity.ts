import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

export enum WidgetType {
  TASKS_INBOX = 'TASKS_INBOX',
  ABSENCE_SUMMARY = 'ABSENCE_SUMMARY',
  QUICK_TILES = 'QUICK_TILES',
  TEAM_CHART = 'TEAM_CHART',
  UPCOMING_ABSENCES = 'UPCOMING_ABSENCES',
  PENDING_APPROVALS = 'PENDING_APPROVALS',
  TRAINING_SUMMARY = 'TRAINING_SUMMARY',
  SAVED_SEARCHES = 'SAVED_SEARCHES',
  CUSTOM = 'CUSTOM',
}

/**
 * WidgetConfig Entity
 * Configures dashboard widgets per role
 */
@Entity('widget_configs')
@Index(['role', 'widgetType'])
export class WidgetConfig extends BaseEntity {
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Index()
  role: UserRole;

  @Column({
    type: 'enum',
    enum: WidgetType,
  })
  @Index()
  widgetType: WidgetType;

  @Column()
  title: string; // Display title for the widget

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ default: false })
  isRequired: boolean; // Cannot be disabled by users

  @Column({ default: 1 })
  defaultOrder: number; // Default position in dashboard

  // Layout Configuration
  @Column({ type: 'jsonb', nullable: true })
  layout?: {
    width: 'FULL' | 'HALF' | 'THIRD' | 'QUARTER';
    height: 'AUTO' | 'SMALL' | 'MEDIUM' | 'LARGE';
    minHeight?: number;
    maxHeight?: number;
  };

  // Widget-specific Configuration
  @Column({ type: 'jsonb', nullable: true })
  config?: {
    defaultFilters?: Record<string, any>;
    displayOptions?: Record<string, any>;
    refreshInterval?: number;
    maxItems?: number;
  };

  // Access Control
  @Column({ default: false })
  allowUserCustomization: boolean; // Users can hide/reorder

  @Column({ type: 'simple-array', nullable: true })
  requiredPermissions?: string[]; // Permission IDs required to see this widget

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
