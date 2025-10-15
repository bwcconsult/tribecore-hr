import { IsString, IsOptional, IsEnum, IsDate, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CheckinType } from '../entities/checkin.entity';

export class CreateCheckinDto {
  @IsString()
  organizationId: string;

  @IsString()
  caseId: string;

  @IsEnum(CheckinType)
  type: CheckinType;

  @IsDate()
  @Type(() => Date)
  scheduledFor: Date;

  @IsOptional()
  @IsString()
  submittedBy?: string;

  @IsOptional()
  @IsInt()
  rating?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  formJson?: any;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  nextAction?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextActionDue?: Date;
}

export class UpdateCheckinDto {
  @IsOptional()
  @IsInt()
  rating?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  formJson?: any;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  nextAction?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextActionDue?: Date;
}
