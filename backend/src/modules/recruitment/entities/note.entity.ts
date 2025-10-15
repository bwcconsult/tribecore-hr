import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ObjectType {
  REQUISITION = 'REQUISITION',
  APPLICATION = 'APPLICATION',
  CANDIDATE = 'CANDIDATE',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  CHECK = 'CHECK',
  JOB_POSTING = 'JOB_POSTING',
}

export enum NoteVisibility {
  PUBLIC = 'PUBLIC', // Visible to all team members on the object
  ROLE_RESTRICTED = 'ROLE_RESTRICTED', // Visible only to specific roles
  PRIVATE = 'PRIVATE', // Visible only to author
  RESTRICTED = 'RESTRICTED', // Legal/ER only
  CANDIDATE_VISIBLE = 'CANDIDATE_VISIBLE', // Visible to candidate in portal
}

@Entity('recruitment_notes')
export class Note extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ObjectType,
  })
  objectType: ObjectType;

  @Column()
  objectId: string;

  @Column()
  organizationId: string;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  authorRole: string;

  @Column({
    type: 'enum',
    enum: NoteVisibility,
    default: NoteVisibility.PUBLIC,
  })
  visibility: NoteVisibility;

  // Content (supports Markdown)
  @Column({ type: 'text' })
  bodyMd: string;

  @Column({ type: 'text', nullable: true })
  bodyHtml: string; // Rendered markdown

  // Threading
  @Column({ nullable: true })
  parentId: string; // For threaded replies

  @Column({ default: false })
  isThread: boolean;

  @Column({ type: 'int', default: 0 })
  replyCount: number;

  @Column({ default: false })
  threadResolved: boolean;

  // Tags and mentions
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', default: [] })
  mentions: Array<{
    userId: string;
    userName: string;
    position: number; // Position in text
  }>;

  // Pinning
  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'int', nullable: true })
  pinnedOrder: number;

  @Column({ nullable: true })
  pinnedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  pinnedAt: Date;

  // System vs human
  @Column({ default: false })
  isSystemGenerated: boolean;

  @Column({ nullable: true })
  eventType: string; // STAGE_CHANGED, OFFER_SENT, etc.

  // Editing
  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ nullable: true })
  previousVersionId: string; // Link to previous version

  // Required reason categories (for compliance)
  @Column({ nullable: true })
  reasonCategory: string; // REJECTED, DECLINED, BACKWARD_STAGE, etc.

  @Column({ type: 'jsonb', nullable: true })
  reasonCodes: string[];

  // Attachments
  @Column({ type: 'jsonb', default: [] })
  attachments: Array<{
    id: string;
    fileName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  // Reactions (optional engagement)
  @Column({ type: 'jsonb', default: {} })
  reactions: {
    [emoji: string]: Array<{
      userId: string;
      userName: string;
      addedAt: Date;
    }>;
  };

  // PII detection flags
  @Column({ default: false })
  containsPII: boolean;

  @Column({ default: false })
  isPIIMasked: boolean;

  @Column({ type: 'jsonb', nullable: true })
  piiFields: string[]; // Fields that contain PII

  // Access control for role-restricted
  @Column({ type: 'jsonb', nullable: true })
  allowedRoles: string[]; // ['RECRUITER', 'HRBP', 'HIRING_MANAGER']

  // Read tracking
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastViewedAt: Date;

  // Template tracking
  @Column({ default: false })
  isFromTemplate: boolean;

  @Column({ nullable: true })
  templateId: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    emailThreadId?: string;
    slackThreadId?: string;
    source?: 'WEB' | 'EMAIL' | 'SLACK' | 'API' | 'MOBILE';
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };

  /**
   * Check if user can view
   */
  canView(userId: string, userRoles: string[]): boolean {
    if (this.authorId === userId) return true;
    if (this.visibility === NoteVisibility.PUBLIC) return true;
    if (this.visibility === NoteVisibility.PRIVATE) return false;
    if (this.visibility === NoteVisibility.ROLE_RESTRICTED) {
      return this.allowedRoles?.some(role => userRoles.includes(role)) || false;
    }
    if (this.visibility === NoteVisibility.RESTRICTED) {
      return userRoles.includes('LEGAL') || userRoles.includes('ER');
    }
    return false;
  }

  /**
   * Mask PII
   */
  maskPII(): void {
    if (this.containsPII && !this.isPIIMasked) {
      // Implement PII masking logic
      this.bodyMd = this.bodyMd.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****'); // SSN
      this.bodyMd = this.bodyMd.replace(/\b\d{16}\b/g, '****-****-****-****'); // Credit card
      this.isPIIMasked = true;
    }
  }
}
