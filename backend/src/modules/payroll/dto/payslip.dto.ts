import {
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayslipStatus, PaymentMethod } from '../entities/payslip.entity';

export class GeneratePayslipDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  payRunId?: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsDateString()
  payDate: string;

  @IsString()
  country: string;

  @IsString()
  currency: string;

  @IsNumber()
  baseSalary: number;

  @IsEnum(['MONTHLY', 'BIWEEKLY', 'WEEKLY'])
  payFrequency: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @IsOptional()
  @IsArray()
  allowances?: Array<{
    code: string;
    label: string;
    amount: number;
    taxable: boolean;
  }>;

  @IsOptional()
  @IsArray()
  bonuses?: Array<{
    code: string;
    label: string;
    amount: number;
  }>;

  @IsOptional()
  @IsArray()
  deductions?: Array<{
    code: string;
    label: string;
    amount: number;
    isPreTax: boolean;
  }>;

  @IsOptional()
  priorYTD?: any;

  @IsOptional()
  taxInfo?: any;

  @IsOptional()
  leaveData?: any;

  @IsOptional()
  bankInstructions?: any;
}

export class BulkGeneratePayslipsDto {
  @IsString()
  payRunId: string;

  @IsArray()
  @IsString({ each: true })
  employeeIds: string[];

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsDateString()
  payDate: string;
}

export class RegeneratePayslipDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsArray()
  adjustments?: Array<{
    type: 'earning' | 'deduction' | 'tax';
    code: string;
    newAmount: number;
    reason: string;
  }>;
}

export class PayslipFilterDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  payRunId?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  period?: string; // YYYY-MM

  @IsOptional()
  @IsEnum(PayslipStatus)
  status?: PayslipStatus;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class DisputePayslipDto {
  @IsString()
  payslipId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  affectedLines?: string[]; // codes of affected lines

  @IsOptional()
  @IsArray()
  attachments?: string[];
}

export class PublishPayslipsDto {
  @IsArray()
  @IsString({ each: true })
  payslipIds: string[];

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  generatePDF?: boolean;
}

export class PayslipComparisonDto {
  @IsString()
  payslip1Id: string;

  @IsString()
  payslip2Id: string;
}

export class VerifyPayslipDto {
  @IsString()
  payslipId: string;

  @IsString()
  token: string;
}

export class CreateEarningCodeDto {
  @IsString()
  code: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  countries: string[];

  @IsBoolean()
  taxable: boolean;

  @IsBoolean()
  niable: boolean;

  @IsBoolean()
  pensionable: boolean;

  @IsOptional()
  @IsBoolean()
  isBonusType?: boolean;

  @IsOptional()
  @IsBoolean()
  isOvertimeType?: boolean;

  @IsOptional()
  glMapping?: any;
}

export class CreateDeductionCodeDto {
  @IsString()
  code: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  countries: string[];

  @IsBoolean()
  isPreTax: boolean;

  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @IsOptional()
  @IsNumber()
  defaultRate?: number;

  @IsOptional()
  glMapping?: any;
}

export class CreateTaxCodeDto {
  @IsString()
  country: string;

  @IsString()
  code: string;

  @IsString()
  label: string;

  @IsString()
  basis: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  rateStructure: any;

  @IsOptional()
  formula?: any;

  @IsOptional()
  @IsString()
  legislationRef?: string;
}
