import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateClauseDto {
  @IsString()
  clauseKey: string;

  @IsString()
  title: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsString()
  clauseLibraryId?: string;

  @IsOptional()
  @IsBoolean()
  isDeviation?: boolean;

  @IsOptional()
  @IsString()
  deviationReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  riskScore?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
