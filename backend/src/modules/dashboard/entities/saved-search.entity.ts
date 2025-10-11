import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SavedSearchCategory {
  PEOPLE = 'PEOPLE',
  ABSENCES = 'ABSENCES',
  CHECKLISTS = 'CHECKLISTS',
  TASKS = 'TASKS',
  DOCUMENTS = 'DOCUMENTS',
}

export enum SavedSearchScope {
  PRIVATE = 'PRIVATE', // Only owner
  TEAM = 'TEAM', // Owner's team
  SHARED = 'SHARED', // Explicitly shared users
  ORG = 'ORG', // Organization-wide
}

/**
 * SavedSearch Entity
 * Stores reusable search queries for People, Absences, Checklists, etc.
 */
@Entity('saved_searches')
@Index(['ownerId', 'category'])
export class SavedSearch extends BaseEntity {
  @Column()
  name: string; // "Holiday Balance Report", "Pending Absences"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SavedSearchCategory,
  })
  @Index()
  category: SavedSearchCategory;

  @Column()
  @Index()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner?: User;

  @Column({
    type: 'enum',
    enum: SavedSearchScope,
    default: SavedSearchScope.PRIVATE,
  })
  scope: SavedSearchScope;

  // Query Configuration
  @Column({ type: 'jsonb' })
  query: {
    filters: Array<{
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like' | 'between';
      value: any;
    }>;
    sort?: Array<{
      field: string;
      direction: 'ASC' | 'DESC';
    }>;
    columns?: string[]; // Which columns to display
    groupBy?: string;
  };

  // Sharing
  @Column({ type: 'simple-array', nullable: true })
  sharedWithUserIds?: string[];

  @Column({ type: 'simple-array', nullable: true })
  sharedWithRoles?: string[];

  // Usage Statistics
  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  lastUsedAt?: Date;

  // Favorites
  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: false })
  isPinned: boolean;

  // Auto-refresh for dashboards
  @Column({ default: false })
  autoRefresh: boolean;

  @Column({ nullable: true })
  refreshIntervalMinutes?: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
