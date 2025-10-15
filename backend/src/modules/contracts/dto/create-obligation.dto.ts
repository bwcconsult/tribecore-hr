import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { ObligationType } from '../entities/obligation.entity';

export class CreateObligationDto {
  @IsString()
  contractId: string;

  @IsEnum(ObligationType)
  type: ObligationType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsString()
  ownerTeam?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  kpiMetric?: string;

  @IsOptional()
  @IsNumber()
  kpiTarget?: number;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrencePattern?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceCreditAmount?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CompleteObligationDto {
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsNumber()
  kpiActual?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];

  @IsOptional()
  @IsString()
  completionNotes?: string;
}
