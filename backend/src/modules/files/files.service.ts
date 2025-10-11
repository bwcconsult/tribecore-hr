import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileCategory, FileStatus, StorageProvider } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '10485760'); // 10MB default
    this.allowedMimeTypes = (this.configService.get('ALLOWED_MIME_TYPES') || 
      'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      .split(',');
  }

  /**
   * Upload file
   */
  async uploadFile(
    file: Express.Multer.File,
    category: FileCategory,
    uploadedById: string,
    options?: {
      relatedEntityType?: string;
      relatedEntityId?: string;
      isPublic?: boolean;
      allowedUserIds?: string[];
      allowedRoles?: string[];
    },
  ): Promise<File> {
    // Validate file
    this.validateFile(file);

    const provider = this.getStorageProvider();
    const storedFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    const storagePath = `${category}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${storedFilename}`;

    // Create file record
    const fileEntity = this.fileRepository.create({
      filename: file.originalname,
      storedFilename,
      mimeType: file.mimetype,
      size: file.size,
      category,
      status: FileStatus.UPLOADING,
      storageProvider: provider,
      storagePath,
      uploadedById,
      relatedEntityType: options?.relatedEntityType,
      relatedEntityId: options?.relatedEntityId,
      isPublic: options?.isPublic || false,
      allowedUserIds: options?.allowedUserIds,
      allowedRoles: options?.allowedRoles,
    });

    await this.fileRepository.save(fileEntity);

    try {
      // Upload to storage
      switch (provider) {
        case StorageProvider.LOCAL:
          await this.uploadToLocal(file, storagePath);
          break;
        case StorageProvider.S3:
          await this.uploadToS3(file, storagePath);
          break;
        case StorageProvider.CLOUDINARY:
          await this.uploadToCloudinary(file, storagePath);
          break;
      }

      // Update status
      fileEntity.status = FileStatus.UPLOADED;
      fileEntity.storageUrl = this.getPublicUrl(storagePath, provider);
      
      // Generate thumbnail for images
      if (file.mimetype.startsWith('image/')) {
        fileEntity.thumbnailUrl = await this.generateThumbnail(fileEntity);
      }

      await this.fileRepository.save(fileEntity);

      // Queue virus scan (async)
      this.queueVirusScan(fileEntity.id);

      return fileEntity;
    } catch (error) {
      fileEntity.status = FileStatus.FAILED;
      await this.fileRepository.save(fileEntity);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(id: string, userId: string, userRoles: string[]): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check permissions
    if (!this.canAccessFile(file, userId, userRoles)) {
      throw new BadRequestException('Access denied');
    }

    return file;
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id, uploadedById: userId } });

    if (!file) {
      throw new NotFoundException('File not found or access denied');
    }

    // Delete from storage
    await this.deleteFromStorage(file);

    // Soft delete
    file.status = FileStatus.DELETED;
    file.deletedAt = new Date();
    await this.fileRepository.save(file);
  }

  /**
   * Validate file
   */
  private validateFile(file: Express.Multer.File): void {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  /**
   * Get storage provider
   */
  private getStorageProvider(): StorageProvider {
    const provider = this.configService.get('STORAGE_PROVIDER') || 'LOCAL';
    return StorageProvider[provider as keyof typeof StorageProvider];
  }

  /**
   * Upload to local storage
   */
  private async uploadToLocal(file: Express.Multer.File, storagePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, storagePath);
    const dir = path.dirname(fullPath);

    // Create directory if doesn't exist
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file.buffer);
  }

  /**
   * Upload to S3
   */
  private async uploadToS3(file: Express.Multer.File, storagePath: string): Promise<void> {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });

    await s3.upload({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: storagePath,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
  }

  /**
   * Upload to Cloudinary
   */
  private async uploadToCloudinary(file: Express.Multer.File, storagePath: string): Promise<void> {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });

    await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: storagePath,
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });
  }

  /**
   * Get public URL
   */
  private getPublicUrl(storagePath: string, provider: StorageProvider): string {
    switch (provider) {
      case StorageProvider.LOCAL:
        return `${this.configService.get('API_URL')}/files/download/${storagePath}`;
      case StorageProvider.S3:
        return `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${storagePath}`;
      case StorageProvider.CLOUDINARY:
        return `https://res.cloudinary.com/${this.configService.get('CLOUDINARY_CLOUD_NAME')}/image/upload/${storagePath}`;
      default:
        return storagePath;
    }
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(file: File): Promise<string | null> {
    // TODO: Implement thumbnail generation using sharp or similar
    return null;
  }

  /**
   * Queue virus scan
   */
  private queueVirusScan(fileId: string): void {
    // TODO: Implement virus scanning with ClamAV or similar
    // For now, just mark as scanned
    setTimeout(async () => {
      const file = await this.fileRepository.findOne({ where: { id: fileId } });
      if (file) {
        file.isScanned = true;
        file.isInfected = false;
        file.status = FileStatus.READY;
        await this.fileRepository.save(file);
      }
    }, 1000);
  }

  /**
   * Delete from storage
   */
  private async deleteFromStorage(file: File): Promise<void> {
    switch (file.storageProvider) {
      case StorageProvider.LOCAL:
        const fullPath = path.join(this.uploadDir, file.storagePath);
        await fs.unlink(fullPath).catch(() => {}); // Ignore errors
        break;
      case StorageProvider.S3:
        // TODO: Implement S3 deletion
        break;
      case StorageProvider.CLOUDINARY:
        // TODO: Implement Cloudinary deletion
        break;
    }
  }

  /**
   * Check if user can access file
   */
  private canAccessFile(file: File, userId: string, userRoles: string[]): boolean {
    if (file.isPublic) return true;
    if (file.uploadedById === userId) return true;
    if (file.allowedUserIds?.includes(userId)) return true;
    if (file.allowedRoles?.some((role) => userRoles.includes(role))) return true;
    return false;
  }
}
