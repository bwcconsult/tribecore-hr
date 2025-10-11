import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreateReimbursementDto {
  @ApiProperty({ description: 'Amount to reimburse' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'GBP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Batch number for grouped payments' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Scheduled payment date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank sort code' })
  @IsString()
  @IsOptional()
  bankSortCode?: string;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Payroll period (YYYY-MM)' })
  @IsString()
  @IsOptional()
  payrollPeriod?: string;
}
