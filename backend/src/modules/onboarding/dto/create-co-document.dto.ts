import { IsString, IsOptional, IsEnum, IsNumber, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CODocumentType } from '../entities/co-document.entity';

export class CreateCODocumentDto {
  @IsString()
  caseId: string;

  @IsEnum(CODocumentType)
  type: CODocumentType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @IsOptional()
  metadata?: any;
}

export class UpdateCODocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  signedAt?: Date;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  metadata?: any;
}
