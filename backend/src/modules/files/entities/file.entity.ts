import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum FileCategory {
  ABSENCE_ATTACHMENT = 'ABSENCE_ATTACHMENT',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  DOCUMENT = 'DOCUMENT',
  CONTRACT = 'CONTRACT',
  ID_PROOF = 'ID_PROOF',
  BANK_PROOF = 'BANK_PROOF',
  TRAINING_CERTIFICATE = 'TRAINING_CERTIFICATE',
  EXPENSE_RECEIPT = 'EXPENSE_RECEIPT',
  OTHER = 'OTHER',
}

export enum FileStatus {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  CLOUDINARY = 'CLOUDINARY',
  AZURE_BLOB = 'AZURE_BLOB',
}

/**
 * File Entity
 * Tracks all uploaded files with metadata
 */
@Entity('files')
@Index(['uploadedById', 'category'])
@Index(['status'])
export class File extends BaseEntity {
  @Column()
  filename: string; // Original filename

  @Column()
  storedFilename: string; // Filename in storage (with unique ID)

  @Column()
  mimeType: string; // e.g., application/pdf, image/jpeg

  @Column({ type: 'bigint' })
  size: number; // Size in bytes

  @Column({
    type: 'enum',
    enum: FileCategory,
  })
  @Index()
  category: FileCategory;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.UPLOADING,
  })
  @Index()
  status: FileStatus;

  @Column({
    type: 'enum',
    enum: StorageProvider,
  })
  storageProvider: StorageProvider;

  @Column()
  storagePath: string; // Path/key in storage

  @Column({ nullable: true })
  storageUrl?: string; // Public URL (if applicable)

  @Column({ nullable: true })
  thumbnailUrl?: string; // Thumbnail URL (for images)

  @Column()
  @Index()
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;

  // Related entity (polymorphic)
  @Column({ nullable: true })
  relatedEntityType?: string; // AbsenceRequest, SicknessEpisode, Employee, etc.

  @Column({ nullable: true })
  relatedEntityId?: string;

  // Security
  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowedUserIds?: string[]; // Who can access this file

  @Column({ type: 'simple-array', nullable: true })
  allowedRoles?: string[]; // Which roles can access

  // Virus scanning
  @Column({ default: false })
  isScanned: boolean;

  @Column({ default: false })
  isInfected: boolean;

  @Column({ nullable: true })
  scanResult?: string;

  // Retention
  @Column({ type: 'date', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'date', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // for videos
    pages?: number; // for PDFs
    [key: string]: any;
  };
}
