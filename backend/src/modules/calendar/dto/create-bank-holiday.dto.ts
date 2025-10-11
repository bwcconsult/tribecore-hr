import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateBankHolidayDto {
  @IsString()
  region: string;

  @IsDateString()
  date: string;

  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBankHolidayDto {
  @IsString()
  @IsOptional()
  region?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
