import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType } from '../entities/document.entity';
import { CreateRecipientDto } from './create-recipient.dto';

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  noteToRecipients?: string;

  @IsBoolean()
  @IsOptional()
  sendInOrder?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientDto)
  @IsOptional()
  recipients?: CreateRecipientDto[];

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsOptional()
  settings?: any;
}
