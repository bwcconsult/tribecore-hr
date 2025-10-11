import { IsNotEmpty, IsString, IsOptional, IsDate, IsBoolean, IsEnum, IsNumber, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialDayType } from '../entities/absence-request.entity';

export class CreateAbsenceRequestDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  isPartialDay?: boolean;

  @IsOptional()
  @IsEnum(PartialDayType)
  partialDayType?: PartialDayType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  hours?: number;

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}

export class ApproveAbsenceRequestDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class RejectAbsenceRequestDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class AbsenceRequestQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  scope?: 'self' | 'team' | 'org';
}
