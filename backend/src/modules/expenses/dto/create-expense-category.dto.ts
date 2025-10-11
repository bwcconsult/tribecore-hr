import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExpenseType } from '../enums/expense-types.enum';

export class CreateExpenseCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique category code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category type', enum: ExpenseType, default: ExpenseType.OTHER })
  @IsEnum(ExpenseType)
  @IsOptional()
  type?: ExpenseType;

  @ApiPropertyOptional({ description: 'Parent category ID (for sub-categories)' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Is category active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Receipt required for this category', default: false })
  @IsBoolean()
  @IsOptional()
  requiresReceipt?: boolean;

  @ApiPropertyOptional({ description: 'Default maximum amount for this category' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  defaultMaxAmount?: number;

  @ApiPropertyOptional({ description: 'General Ledger code for accounting' })
  @IsString()
  @IsOptional()
  glCode?: string;
}
