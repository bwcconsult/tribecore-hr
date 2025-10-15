import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType, DataCategory } from '../entities/contract.entity';

export class CreateContractDto {
  @IsEnum(ContractType)
  type: ContractType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsString()
  counterpartyId: string;

  @IsString()
  counterpartyName: string;

  @IsOptional()
  @IsString()
  counterpartyEmail?: string;

  @IsOptional()
  @IsString()
  counterpartyType?: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  noticeDate?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  renewalTerm?: string;

  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  governingLaw?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @IsOptional()
  @IsBoolean()
  requiresDPIA?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSCC?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clauseKeys?: string[]; // Clause library keys to include

  @IsOptional()
  @IsString()
  templateId?: string; // Use a template

  @IsOptional()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
