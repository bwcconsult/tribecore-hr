import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber, IsObject } from 'class-validator';
import { ShiftType, ShiftStatus } from '../entities/shift.entity';

export class CreateShiftDto {
  @IsString()
  employeeId: string;

  @IsString()
  @IsOptional()
  rotaId?: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsEnum(ShiftType)
  @IsOptional()
  shiftType?: ShiftType;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsNumber()
  @IsOptional()
  breakDurationMinutes?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isOpenShift?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateShiftDto {
  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @IsEnum(ShiftType)
  @IsOptional()
  shiftType?: ShiftType;

  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsNumber()
  @IsOptional()
  breakDurationMinutes?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isOpenShift?: boolean;
}

export class CreateRotaDto {
  @IsString()
  name: string;

  @IsString()
  organizationId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  settings?: {
    allowSwaps: boolean;
    requireApproval: boolean;
    autoAssignOpenShifts: boolean;
    notifyEmployees: boolean;
  };
}

export class AssignShiftDto {
  @IsString()
  employeeId: string;

  @IsString()
  assignedBy: string;
}

export class SwapShiftDto {
  @IsString()
  targetShiftId: string;

  @IsString()
  requestedBy: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
