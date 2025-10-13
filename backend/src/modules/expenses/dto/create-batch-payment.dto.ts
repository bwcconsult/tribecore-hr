import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { BatchPaymentMethod } from '../entities/batch-payment.entity';

export class CreateBatchPaymentDto {
  @IsNotEmpty()
  @IsString()
  batchName: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(BatchPaymentMethod)
  paymentMethod: BatchPaymentMethod;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
