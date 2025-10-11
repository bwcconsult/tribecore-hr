import { IsString, IsOptional, IsNumber, IsBoolean, IsDate, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeEntryStatus } from '../entities/time-entry.entity';

export class CreateTimeEntryDto {
  @IsString()
  employeeId: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  startTime: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  durationMinutes: number;

  @IsNumber()
  hours: number;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  taskName?: string;

  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsEnum(TimeEntryStatus)
  @IsOptional()
  status?: TimeEntryStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class CreateProjectDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  projectManager?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsArray()
  @IsOptional()
  team?: string[];

  @IsString()
  @IsOptional()
  tags?: string;
}
