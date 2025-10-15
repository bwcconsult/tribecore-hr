import { IsString, IsOptional, IsEnum, IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientTier } from '../entities/client-account.entity';
import { ClientOnboardingStatus, RiskLevel } from '../entities/client-onboarding-case.entity';

export class CreateClientOnboardingCaseDto {
  @IsString()
  organizationId: string;

  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  csmId?: string;

  @IsEnum(ClientTier)
  tier: ClientTier;

  @IsString()
  region: string;

  @IsDate()
  @Type(() => Date)
  goLiveTarget: Date;

  @IsOptional()
  @IsEnum(ClientOnboardingStatus)
  status?: ClientOnboardingStatus;

  @IsOptional()
  @IsEnum(RiskLevel)
  risk?: RiskLevel;

  @IsOptional()
  gateChecks?: {
    securityApproved?: boolean;
    legalApproved?: boolean;
    billingApproved?: boolean;
    uatApproved?: boolean;
    runbookApproved?: boolean;
  };

  @IsOptional()
  metadata?: any;
}

export class UpdateClientOnboardingCaseDto {
  @IsOptional()
  @IsString()
  csmId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  goLiveTarget?: Date;

  @IsOptional()
  @IsEnum(ClientOnboardingStatus)
  status?: ClientOnboardingStatus;

  @IsOptional()
  @IsEnum(RiskLevel)
  risk?: RiskLevel;

  @IsOptional()
  @IsInt()
  completionPercentage?: number;

  @IsOptional()
  gateChecks?: {
    securityApproved?: boolean;
    legalApproved?: boolean;
    billingApproved?: boolean;
    uatApproved?: boolean;
    runbookApproved?: boolean;
  };

  @IsOptional()
  metadata?: any;
}
