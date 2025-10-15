import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EnvironmentType, EnvironmentStatus } from '../entities/environment.entity';

export class CreateEnvironmentDto {
  @IsString()
  caseId: string;

  @IsEnum(EnvironmentType)
  envType: EnvironmentType;

  @IsString()
  region: string;

  @IsString()
  domain: string;

  @IsOptional()
  @IsEnum(EnvironmentStatus)
  status?: EnvironmentStatus;

  @IsOptional()
  @IsString()
  apiKeyRef?: string;

  @IsOptional()
  @IsString()
  ssoConfig?: string;

  @IsOptional()
  metadata?: any;
}

export class UpdateEnvironmentDto {
  @IsOptional()
  @IsEnum(EnvironmentStatus)
  status?: EnvironmentStatus;

  @IsOptional()
  @IsString()
  apiKeyRef?: string;

  @IsOptional()
  @IsString()
  ssoConfig?: string;

  @IsOptional()
  metadata?: any;
}
