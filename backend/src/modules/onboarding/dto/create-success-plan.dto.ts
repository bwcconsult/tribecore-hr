import { IsString, IsOptional, IsEnum, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewCadence } from '../entities/success-plan.entity';

export class CreateSuccessPlanDto {
  @IsString()
  caseId: string;

  @IsOptional()
  @IsArray()
  objectives?: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    achieved: boolean;
  }>;

  @IsOptional()
  @IsArray()
  kpis?: Array<{
    id: string;
    name: string;
    target: number;
    actual?: number;
    unit: string;
    frequency: string;
  }>;

  @IsOptional()
  @IsEnum(ReviewCadence)
  reviewCadence?: ReviewCadence;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextReviewDate?: Date;

  @IsOptional()
  metadata?: any;
}

export class UpdateSuccessPlanDto {
  @IsOptional()
  @IsArray()
  objectives?: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    achieved: boolean;
  }>;

  @IsOptional()
  @IsArray()
  kpis?: Array<{
    id: string;
    name: string;
    target: number;
    actual?: number;
    unit: string;
    frequency: string;
  }>;

  @IsOptional()
  @IsEnum(ReviewCadence)
  reviewCadence?: ReviewCadence;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextReviewDate?: Date;

  @IsOptional()
  metadata?: any;
}
