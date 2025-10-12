import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, IsArray, IsObject } from 'class-validator';
import { RecognitionType, RecognitionCategory } from '../entities/recognition.entity';

export class CreateRecognitionDto {
  @IsString()
  organizationId: string;

  @IsString()
  recipientId: string;

  @IsEnum(RecognitionType)
  type: RecognitionType;

  @IsEnum(RecognitionCategory)
  category: RecognitionCategory;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  badgeId?: string;

  @IsInt()
  @IsOptional()
  pointsAwarded?: number;

  @IsObject()
  @IsOptional()
  metadata?: {
    projectName?: string;
    teamMembers?: string[];
    attachments?: string[];
  };
}

export class CreateBadgeDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  pointsValue?: number;

  @IsObject()
  @IsOptional()
  criteria?: {
    minTenureMonths?: number;
    minRecognitionsReceived?: number;
    specificAchievement?: string;
  };
}

export class AwardBadgeDto {
  @IsString()
  employeeId: string;

  @IsString()
  badgeId: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  recognitionId?: string;
}
