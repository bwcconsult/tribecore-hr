import { IsString, IsOptional, IsDate, IsEnum, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../entities/onboarding-task.entity';

export class CreateOnboardingTaskDto {
  @IsString()
  organizationId: string;

  @IsString()
  caseId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  assigneeRole: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @IsOptional()
  @IsInt()
  slaHours?: number;

  @IsOptional()
  metadata?: any;
}

export class UpdateOnboardingTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  blockReason?: string;

  @IsOptional()
  metadata?: any;
}
