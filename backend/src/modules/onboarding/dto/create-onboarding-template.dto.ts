import { IsString, IsOptional, IsArray, IsBoolean, IsInt, IsObject } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  ownerRole: string;

  @IsInt()
  durationDays: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @IsOptional()
  @IsInt()
  slaHours?: number;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class CreateOnboardingTemplateDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsInt()
  version?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsArray()
  checklistItems: CreateChecklistItemDto[];

  @IsOptional()
  @IsObject()
  metadata?: any;
}
