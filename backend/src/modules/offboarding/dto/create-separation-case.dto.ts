import { IsString, IsEnum, IsDate, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SeparationType } from '../entities/separation-case.entity';

export class CreateSeparationCaseDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsEnum(SeparationType)
  type: SeparationType;

  @IsString()
  @IsOptional()
  reasonCode?: string;

  @IsString()
  @IsOptional()
  reasonDetails?: string;

  @IsDate()
  @Type(() => Date)
  proposedLeaveDate: Date;

  @IsString()
  createdBy: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
