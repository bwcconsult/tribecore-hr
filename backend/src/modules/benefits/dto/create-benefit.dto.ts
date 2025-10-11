import { IsString, IsEnum, IsOptional, IsNumber, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { BenefitType, BenefitStatus } from '../entities/benefit.entity';

export class CreateBenefitDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(BenefitType)
  type: BenefitType;

  @IsEnum(BenefitStatus)
  @IsOptional()
  status?: BenefitStatus;

  @IsNumber()
  @IsOptional()
  employerCost?: number;

  @IsNumber()
  @IsOptional()
  employeeCost?: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  policyNumber?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  effectiveDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @IsOptional()
  eligibility?: {
    minTenureMonths?: number;
    employmentTypes?: string[];
    departments?: string[];
    countries?: string[];
  };

  @IsOptional()
  coverage?: {
    coverageAmount?: number;
    deductible?: number;
    coinsurance?: number;
    dependents?: boolean;
    maxAge?: number;
  };

  @IsString()
  @IsOptional()
  terms?: string;

  @IsOptional()
  documents?: string[];
}

export class CreateEmployeeBenefitDto {
  @IsString()
  employeeId: string;

  @IsString()
  benefitId: string;

  @IsDate()
  @Type(() => Date)
  enrollmentDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  effectiveDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  terminationDate?: Date;

  @IsEnum(BenefitStatus)
  @IsOptional()
  status?: BenefitStatus;

  @IsNumber()
  employeeContribution: number;

  @IsNumber()
  employerContribution: number;

  @IsOptional()
  dependents?: Array<{
    name: string;
    relationship: string;
    dateOfBirth: Date;
  }>;

  @IsOptional()
  elections?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}
