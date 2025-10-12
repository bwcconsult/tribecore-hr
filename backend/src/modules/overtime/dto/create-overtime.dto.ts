import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { OvertimeType } from '../entities/overtime-request.entity';

export class CreateOvertimeRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsDateString()
  date: Date;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsEnum(OvertimeType)
  @IsOptional()
  overtimeType?: OvertimeType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    shiftId?: string;
    isPreApproved?: boolean;
    attachments?: string[];
  };
}

export class CreateOvertimePolicyDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  regularOvertimeMultiplier?: number;

  @IsNumber()
  @IsOptional()
  weekendOvertimeMultiplier?: number;

  @IsNumber()
  @IsOptional()
  holidayOvertimeMultiplier?: number;

  @IsNumber()
  @IsOptional()
  nightShiftMultiplier?: number;

  @IsNumber()
  @IsOptional()
  weeklyThresholdHours?: number;

  @IsNumber()
  @IsOptional()
  dailyThresholdHours?: number;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsNumber()
  @IsOptional()
  maxOvertimeHoursPerWeek?: number;

  @IsNumber()
  @IsOptional()
  maxOvertimeHoursPerMonth?: number;
}
