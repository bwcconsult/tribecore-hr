import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsOptional()
  fields?: any;

  @IsOptional()
  settings?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
