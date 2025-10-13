import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftType, CaptureSource } from '../entities/shift.entity';
import { WorkType } from '../entities/time-block.entity';
import { Country, Sector } from '../entities/work-rule-set.entity';

/**
 * DTO for creating/clocking in a shift
 */
export class CreateShiftDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  project?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  scheduledStart: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  scheduledEnd: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  actualStart?: Date;

  @ApiPropertyOptional({ enum: ShiftType })
  @IsEnum(ShiftType)
  @IsOptional()
  shiftType?: ShiftType;

  @ApiProperty({ enum: CaptureSource })
  @IsEnum(CaptureSource)
  source: CaptureSource;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isEmergency?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRemote?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taskDescription?: string;
}

/**
 * DTO for punching in/out
 */
export class PunchDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  biometricToken?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for adding a break
 */
export class AddBreakDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  start: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  end: Date;

  @ApiProperty()
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty()
  @IsEnum(['MEAL', 'REST', 'OTHER'])
  type: 'MEAL' | 'REST' | 'OTHER';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for classifying/calculating overtime
 */
export class ClassifyOvertimeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shiftId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  employeeBaseRate?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  weeklyHoursWorked?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  consecutiveDaysWorked?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dryRun?: boolean; // Preview only, don't save
}

/**
 * DTO for bulk approval
 */
export class BulkApproveDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  shiftIds: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;
}

/**
 * DTO for creating comp-time redemption
 */
export class RedeemCompTimeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.25)
  @Max(80)
  hoursToRedeem: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  leaveRequestId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * DTO for creating on-call period
 */
export class CreateOnCallDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  windowStart: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  windowEnd: Date;

  @ApiProperty()
  @IsEnum(['ON_CALL', 'STANDBY', 'BEEPER'])
  type: 'ON_CALL' | 'STANDBY' | 'BEEPER';

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  flatRate?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  callOutMinimumHours?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  skillRequired?: string;
}

/**
 * DTO for recording call-out
 */
export class RecordCallOutDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  onCallStandbyId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  calledAt: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  respondedAt?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  workHours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  travelHours?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;
}

/**
 * DTO for creating budget
 */
export class CreateBudgetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  project?: string;

  @ApiProperty()
  @IsEnum(['WEEK', 'MONTH', 'QUARTER', 'YEAR'])
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  periodStart: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  periodEnd: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  capHours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  capAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty()
  @IsBoolean()
  isHardCap: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  warningThresholdPercent?: number;
}

/**
 * DTO for policy initialization
 */
export class InitializePoliciesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ type: [String], enum: Country })
  @IsArray()
  @IsEnum(Country, { each: true })
  @IsOptional()
  countries?: Country[];
}

/**
 * DTO for querying overtime
 */
export class QueryOvertimeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  project?: string;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'PAID'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

/**
 * DTO for fatigue check
 */
export class CheckFatigueDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  asOfDate?: Date;
}

/**
 * DTO for rest compliance check
 */
export class CheckRestComplianceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  proposedShiftStart: Date;

  @ApiProperty({ enum: Country })
  @IsEnum(Country)
  country: Country;

  @ApiPropertyOptional({ enum: Sector })
  @IsEnum(Sector)
  @IsOptional()
  sector?: Sector;
}

/**
 * DTO for exporting to payroll
 */
export class ExportToPayrollDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payrollId: string;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  periodStart?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  periodEnd?: Date;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  costCenters?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  lockLines?: boolean; // Lock lines after export
}

/**
 * Response DTO for overtime calculation
 */
export class OvertimeCalculationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  shiftId: string;

  @ApiProperty()
  totalOvertimeHours: number;

  @ApiProperty()
  totalOvertimeAmount: number;

  @ApiProperty({ type: [Object] })
  overtimeLines: any[]; // OvertimeLine entities

  @ApiProperty({ type: [String] })
  warnings: string[];
}

/**
 * Response DTO for fatigue score
 */
export class FatigueScoreResponseDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

  @ApiProperty()
  factors: {
    hoursWorked: number;
    nightShifts: number;
    consecutiveDays: number;
    overtimeHours: number;
    restDeficit: number;
    shiftLength: number;
  };

  @ApiProperty({ type: [String] })
  recommendations: string[];

  @ApiProperty({ type: [Object] })
  breaches: any[];
}
