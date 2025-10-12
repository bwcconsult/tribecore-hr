import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseItemDto {
  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsDateString()
  txnDate: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxCodeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  projectSplitPct?: number;
}

export class CreateExpenseClaimDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ type: [CreateExpenseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemDto)
  items: CreateExpenseItemDto[];
}
