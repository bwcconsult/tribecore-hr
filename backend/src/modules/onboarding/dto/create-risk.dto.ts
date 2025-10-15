import { IsString, IsOptional, IsEnum, IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { RiskSeverity, RiskStatus } from '../entities/risk.entity';

export class CreateRiskDto {
  @IsString()
  caseId: string;

  @IsEnum(RiskSeverity)
  severity: RiskSeverity;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  mitigation?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  targetResolutionDate?: Date;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsInt()
  probability?: number;

  @IsOptional()
  metadata?: any;
}

export class UpdateRiskDto {
  @IsOptional()
  @IsEnum(RiskSeverity)
  severity?: RiskSeverity;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  mitigation?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  targetResolutionDate?: Date;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsInt()
  probability?: number;

  @IsOptional()
  metadata?: any;
}
