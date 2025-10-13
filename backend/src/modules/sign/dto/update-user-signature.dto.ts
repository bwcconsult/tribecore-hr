import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class UpdateUserSignatureDto {
  @IsString()
  @IsOptional()
  signatureData?: string;

  @IsString()
  @IsOptional()
  initialData?: string;

  @IsString()
  @IsOptional()
  stampData?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsBoolean()
  @IsOptional()
  delegateEnabled?: boolean;

  @IsUUID()
  @IsOptional()
  delegateUserId?: string;
}
