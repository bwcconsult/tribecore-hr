import { IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollFrequency, Country } from '../../../common/enums';

export class CreatePayrollDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty()
  @IsDateString()
  payPeriodStart: Date;

  @ApiProperty()
  @IsDateString()
  payPeriodEnd: Date;

  @ApiProperty()
  @IsDateString()
  payDate: Date;

  @ApiProperty({ enum: PayrollFrequency })
  @IsEnum(PayrollFrequency)
  frequency: PayrollFrequency;

  @ApiProperty()
  @IsNumber()
  basicSalary: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  allowances?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bonuses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overtime?: number;

  @ApiProperty()
  @IsNumber()
  grossPay: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty({ enum: Country })
  @IsEnum(Country)
  country: Country;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  otherDeductions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
