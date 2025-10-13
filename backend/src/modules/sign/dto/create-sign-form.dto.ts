import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateSignFormDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsBoolean()
  @IsOptional()
  requireOtp?: boolean;

  @IsInt()
  @IsOptional()
  responseLimit?: number;

  @IsBoolean()
  @IsOptional()
  avoidDuplicates?: boolean;

  @IsInt()
  @IsOptional()
  duplicateCheckDays?: number;

  @IsOptional()
  settings?: any;
}
