import { IsString, IsOptional, IsEnum, IsInt, IsNumber, IsBoolean } from 'class-validator';
import { ClientTier } from '../entities/client-account.entity';

export class CreateClientAccountDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ClientTier)
  tier?: ClientTier;

  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  crmId?: string;

  @IsOptional()
  @IsString()
  successManagerId?: string;

  @IsOptional()
  @IsString()
  billingCurrency?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsInt()
  employeeCount?: number;

  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  metadata?: any;
}

export class UpdateClientAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ClientTier)
  tier?: ClientTier;

  @IsOptional()
  @IsString()
  successManagerId?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  metadata?: any;
}
