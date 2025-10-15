import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentKind } from '../entities/onboarding-document.entity';

export class CreateOnboardingDocumentDto {
  @IsString()
  organizationId: string;

  @IsString()
  caseId: string;

  @IsEnum(DocumentKind)
  kind: DocumentKind;

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
  @IsBoolean()
  eSigned?: boolean;

  @IsOptional()
  @IsString()
  eSignatureRef?: string;

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
