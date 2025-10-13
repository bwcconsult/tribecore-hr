import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { AdvanceStatus, PaymentMethod } from '../entities/advance.entity';

export class CreateAdvanceDto {
  @IsNotEmpty()
  @IsUUID()
  employeeId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsUUID()
  tripId?: string;
}
