import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { RepaymentMethod } from '../entities/ewa-request.entity';

export class CreateEWARequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsNumber()
  @Min(1)
  requestedAmount: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(RepaymentMethod)
  @IsOptional()
  repaymentMethod?: RepaymentMethod;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  installmentCount?: number;
}

export class ApproveEWARequestDto {
  @IsNumber()
  @Min(0)
  approvedAmount: number;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectEWARequestDto {
  @IsString()
  rejectionReason: string;

  @IsString()
  @IsOptional()
  rejectedBy?: string;
}
