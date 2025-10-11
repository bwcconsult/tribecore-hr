import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExpenseItemDto {
  @ApiProperty({ description: 'Expense category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Amount in specified currency' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code (ISO 4217)', default: 'GBP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Date of expense (YYYY-MM-DD)' })
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({ description: 'Vendor/merchant name' })
  @IsString()
  @IsOptional()
  vendor?: string;

  @ApiProperty({ description: 'Description of expense' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Project ID (if applicable)' })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Department ID (if applicable)' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Mileage distance (for mileage expenses)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  mileageDistance?: number;

  @ApiPropertyOptional({ description: 'Mileage rate per unit' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  mileageRate?: number;

  @ApiPropertyOptional({ description: 'Start location (for mileage)' })
  @IsString()
  @IsOptional()
  startLocation?: string;

  @ApiPropertyOptional({ description: 'End location (for mileage)' })
  @IsString()
  @IsOptional()
  endLocation?: string;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Tax rate percentage' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Is billable to client', default: false })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({ description: 'Client ID (if billable)' })
  @IsUUID()
  @IsOptional()
  clientId?: string;
}
