import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum AttachmentType {
  RESUME = 'RESUME',
  COVER_LETTER = 'COVER_LETTER',
  PORTFOLIO = 'PORTFOLIO',
  CERTIFICATE = 'CERTIFICATE',
  LICENSE = 'LICENSE',
  ID_DOCUMENT = 'ID_DOCUMENT',
  VISA = 'VISA',
  WORK_PERMIT = 'WORK_PERMIT',
  REFERENCE_LETTER = 'REFERENCE_LETTER',
  TRANSCRIPT = 'TRANSCRIPT',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  OFFER_LETTER = 'OFFER_LETTER',
  CONTRACT = 'CONTRACT',
  SIGNED_CONTRACT = 'SIGNED_CONTRACT',
  OTHER = 'OTHER',
}

export enum AttachmentStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  VIRUS_SCANNING = 'VIRUS_SCANNING',
  READY = 'READY',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

@Entity('recruitment_attachments')
@Index(['objectType', 'objectId'])
@Index(['candidateId'])
export class Attachment extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  objectType: string; // APPLICATION, CANDIDATE, NOTE, OFFER, CHECK

  @Column()
  objectId: string;

  @Column({ nullable: true })
  candidateId: string;

  @Column({ nullable: true })
  applicationId: string;

  @Column({ nullable: true })
  noteId: string;

  @Column()
  uploadedBy: string;

  @Column()
  uploadedByName: string;

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @Column({
    type: 'enum',
    enum: AttachmentStatus,
    default: AttachmentStatus.UPLOADING,
  })
  status: AttachmentStatus;

  // File details
  @Column()
  fileName: string;

  @Column()
  originalFileName: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'bigint' })
  size: number; // bytes

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  extension: string;

  // Security
  @Column()
  hash: string; // SHA256 for deduplication & integrity

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ default: false })
  virusScanPassed: boolean;

  @Column({ nullable: true })
  virusScanResult: string;

  @Column({ type: 'timestamp', nullable: true })
  virusScannedAt: Date;

  // Access control
  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isCandidateVisible: boolean;

  @Column({ type: 'jsonb', nullable: true })
  allowedRoles: string[];

  // Retention
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedBy: string;

  // AI/OCR extraction
  @Column({ default: false })
  isProcessed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  extractedData: {
    text?: string;
    entities?: Array<{ type: string; value: string; confidence: number }>;
    skills?: string[];
    education?: any[];
    experience?: any[];
    languages?: string[];
    [key: string]: any;
  };

  // Version control
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ nullable: true })
  previousVersionId: string;

  @Column({ nullable: true })
  latestVersionId: string;

  // Download tracking
  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastDownloadedAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    ocrLanguage?: string;
    pageCount?: number;
    dimensions?: { width: number; height: number };
    [key: string]: any;
  };

  /**
   * Check if expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Check if ready for download
   */
  isReadyForDownload(): boolean {
    return this.status === AttachmentStatus.READY && 
           this.virusScanPassed && 
           !this.isDeleted && 
           !this.isExpired();
  }

  /**
   * Get file size in human readable format
   */
  getHumanSize(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
