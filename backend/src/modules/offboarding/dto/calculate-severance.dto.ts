import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CalculateSeveranceDto {
  @IsNumber()
  basePay: number;

  @IsNumber()
  tenureYears: number;

  @IsString()
  country: string;

  @IsNumber()
  @IsOptional()
  multiplier?: number;

  @IsNumber()
  @IsOptional()
  holidayHours?: number;

  @IsNumber()
  @IsOptional()
  toilHours?: number;

  @IsNumber()
  @IsOptional()
  age?: number;
}
