import { IsString, IsOptional, IsEnum, IsDate, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { COTaskOwnerTeam, COTaskStatus } from '../entities/co-task.entity';

export class CreateCOTaskDto {
  @IsString()
  workstreamId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(COTaskOwnerTeam)
  ownerTeam: COTaskOwnerTeam;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsEnum(COTaskStatus)
  status?: COTaskStatus;

  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @IsOptional()
  @IsInt()
  slaHours?: number;

  @IsOptional()
  metadata?: any;
}

export class UpdateCOTaskDto {
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
  @IsEnum(COTaskStatus)
  status?: COTaskStatus;

  @IsOptional()
  @IsString()
  blockReason?: string;

  @IsOptional()
  metadata?: any;
}
