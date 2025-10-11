import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  mimeType: string;
  hash: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private bucket: string;
  private useS3: boolean = false;
  private localStoragePath: string;

  constructor(private configService: ConfigService) {
    this.initializeStorage();
  }

  private initializeStorage() {
    const storageType = this.configService.get('STORAGE_TYPE', 'local'); // 's3' or 'local'
    
    if (storageType === 's3') {
      const region = this.configService.get('AWS_REGION', 'us-east-1');
      const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
      this.bucket = this.configService.get('AWS_S3_BUCKET', 'tribecore-receipts');

      if (accessKeyId && secretAccessKey) {
        this.s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
        this.useS3 = true;
        this.logger.log(`AWS S3 storage initialized (bucket: ${this.bucket})`);
      } else {
        this.logger.warn('AWS S3 credentials not found. Falling back to local storage.');
      }
    }

    // Local storage fallback
    if (!this.useS3) {
      this.localStoragePath = this.configService.get(
        'LOCAL_STORAGE_PATH',
        path.join(process.cwd(), 'uploads', 'receipts'),
      );
      
      // Ensure directory exists
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
      
      this.logger.log(`Local storage initialized (path: ${this.localStoragePath})`);
    }
  }

  /**
   * Upload file to storage (S3 or local)
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    claimId?: string,
  ): Promise<UploadResult> {
    // Generate unique filename
    const hash = crypto.createHash('md5').update(file).digest('hex');
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const key = `receipts/${userId}/${claimId || 'temp'}/${timestamp}_${hash}${ext}`;

    if (this.useS3 && this.s3Client) {
      return this.uploadToS3(file, key, mimeType, hash);
    } else {
      return this.uploadToLocal(file, key, mimeType, hash);
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(
    file: Buffer,
    key: string,
    mimeType: string,
    hash: string,
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          hash,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client!.send(command);

      // Generate presigned URL for temporary access
      const getCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client!, getCommand, { expiresIn: 3600 });

      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        key,
        url,
        bucket: this.bucket,
        size: file.length,
        mimeType,
        hash,
      };
    } catch (error) {
      this.logger.error(`Failed to upload to S3: ${error.message}`, error.stack);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(
    file: Buffer,
    key: string,
    mimeType: string,
    hash: string,
  ): Promise<UploadResult> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      const dirPath = path.dirname(filePath);

      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, file);

      const baseUrl = this.configService.get('API_BASE_URL', 'http://localhost:3001');
      const url = `${baseUrl}/api/v1/expenses/receipts/file/${encodeURIComponent(key)}`;

      this.logger.log(`File uploaded locally: ${filePath}`);

      return {
        key,
        url,
        bucket: 'local',
        size: file.length,
        mimeType,
        hash,
      };
    } catch (error) {
      this.logger.error(`Failed to upload locally: ${error.message}`, error.stack);
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  /**
   * Get file from storage
   */
  async getFile(key: string): Promise<Buffer> {
    if (this.useS3 && this.s3Client) {
      return this.getFileFromS3(key);
    } else {
      return this.getFileFromLocal(key);
    }
  }

  /**
   * Get file from S3
   */
  private async getFileFromS3(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client!.send(command);
      
      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to get file from S3: ${error.message}`, error.stack);
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  /**
   * Get file from local storage
   */
  private async getFileFromLocal(key: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      return fs.readFileSync(filePath);
    } catch (error) {
      this.logger.error(`Failed to get file locally: ${error.message}`, error.stack);
      throw new Error(`Local download failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.useS3 && this.s3Client) {
      return this.deleteFileFromS3(key);
    } else {
      return this.deleteFileFromLocal(key);
    }
  }

  /**
   * Delete from S3
   */
  private async deleteFileFromS3(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client!.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from S3: ${error.message}`, error.stack);
      throw new Error(`S3 deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete from local storage
   */
  private async deleteFileFromLocal(key: string): Promise<void> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted locally: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete locally: ${error.message}`, error.stack);
      throw new Error(`Local deletion failed: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    if (this.useS3 && this.s3Client) {
      return this.fileExistsInS3(key);
    } else {
      return this.fileExistsLocally(key);
    }
  }

  /**
   * Check if file exists in S3
   */
  private async fileExistsInS3(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client!.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if file exists locally
   */
  private async fileExistsLocally(key: string): Promise<boolean> {
    const filePath = path.join(this.localStoragePath, key);
    return fs.existsSync(filePath);
  }

  /**
   * Get presigned URL for file (S3 only)
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.useS3 || !this.s3Client) {
      // For local storage, return direct URL
      const baseUrl = this.configService.get('API_BASE_URL', 'http://localhost:3001');
      return `${baseUrl}/api/v1/expenses/receipts/file/${encodeURIComponent(key)}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
      throw new Error(`Presigned URL generation failed: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail (simplified - actual implementation would use sharp/jimp)
   */
  async generateThumbnail(imageBuffer: Buffer, maxWidth: number = 200): Promise<Buffer> {
    // For now, return original - in production, use image processing library
    this.logger.warn('Thumbnail generation not implemented - returning original');
    return imageBuffer;
  }
}
