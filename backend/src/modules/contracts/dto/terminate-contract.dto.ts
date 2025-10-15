import { IsString, IsOptional, IsDateString, IsBoolean, IsArray } from 'class-validator';

export class TerminateContractDto {
  @IsString()
  terminationReason: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsBoolean()
  requiresNotice?: boolean;

  @IsOptional()
  @IsString()
  noticeDocument?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assetsToReturn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataToReturn?: string[];

  @IsOptional()
  @IsString()
  finalInvoiceNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificationsToRevoke?: string[];

  @IsOptional()
  closeoutNotes?: Record<string, any>;
}
