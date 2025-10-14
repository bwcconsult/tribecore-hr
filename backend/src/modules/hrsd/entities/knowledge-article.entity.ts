import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ArticleVisibility {
  PUBLIC = 'PUBLIC', // All employees
  INTERNAL = 'INTERNAL', // HR team only
  MANAGERS = 'MANAGERS', // Managers only
  SPECIFIC_GROUPS = 'SPECIFIC_GROUPS', // Defined groups
}

/**
 * Knowledge Article Entity
 * Knowledge base for employee self-service
 */
@Entity('knowledge_articles')
@Index(['organizationId', 'status'])
@Index(['category', 'subcategory'])
export class KnowledgeArticle extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Article identification
  @Column({ unique: true })
  @Index()
  articleNumber: string; // KB-2025-0001

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text' })
  content: string; // Rich text/HTML content

  // Categorization
  @Column()
  @Index()
  category: string; // 'Payroll', 'Benefits', 'Leave', etc.

  @Column({ nullable: true })
  subcategory?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'simple-array', nullable: true })
  relatedTopics?: string[];

  // Status
  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  @Index()
  status: ArticleStatus;

  @Column({
    type: 'enum',
    enum: ArticleVisibility,
    default: ArticleVisibility.PUBLIC,
  })
  visibility: ArticleVisibility;

  @Column({ type: 'simple-array', nullable: true })
  visibleToGroups?: string[]; // Security group IDs

  // Authoring
  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  lastEditedBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  lastEditedAt?: Date;

  // Publishing
  @Column({ nullable: true, type: 'timestamp' })
  publishedAt?: Date;

  @Column({ nullable: true })
  publishedBy?: string;

  @Column({ nullable: true, type: 'timestamp' })
  archivedAt?: Date;

  @Column({ nullable: true })
  archivedBy?: string;

  // Usage analytics
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number; // "Was this helpful?" Yes count

  @Column({ type: 'int', default: 0 })
  notHelpfulCount: number;

  @Column({ type: 'int', default: 0 })
  deflectionCount: number; // Cases avoided by this article

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageRating?: number; // 1-5 stars

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  // SEO & search
  @Column({ type: 'simple-array', nullable: true })
  keywords?: string[];

  @Column({ type: 'text', nullable: true })
  searchableText?: string; // Flattened text for full-text search

  // Related content
  @Column({ type: 'simple-array', nullable: true })
  relatedArticles?: string[]; // Article IDs

  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[]; // Document URLs

  @Column({ type: 'simple-array', nullable: true })
  videoLinks?: string[];

  // Versioning
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ nullable: true })
  previousVersionId?: string;

  // Review & maintenance
  @Column({ nullable: true, type: 'date' })
  lastReviewDate?: Date;

  @Column({ nullable: true, type: 'date' })
  nextReviewDate?: Date;

  @Column({ nullable: true })
  reviewOwner?: string; // User ID responsible for keeping updated

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

/**
 * Article Feedback Entity
 * Track user feedback on knowledge articles
 */
@Entity('article_feedback')
@Index(['articleId', 'createdAt'])
export class ArticleFeedback extends BaseEntity {
  @Column()
  @Index()
  articleId: string;

  @ManyToOne(() => KnowledgeArticle)
  @JoinColumn({ name: 'articleId' })
  article: KnowledgeArticle;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  helpful: boolean;

  @Column({ type: 'int', nullable: true })
  rating?: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
