import { IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingStatus } from '../entities/onboard-case.entity';

export class CreateOnboardingCaseDto {
  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsString()
  organizationId: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  jobTitle: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsEnum(OnboardingStatus)
  status?: OnboardingStatus;

  @IsOptional()
  @IsString()
  templateId?: string; // If creating from template

  @IsOptional()
  @IsString()
  roleBlueprintId?: string;

  @IsOptional()
  @IsString()
  hiringManagerId?: string;

  @IsOptional()
  @IsString()
  buddyId?: string;

  @IsOptional()
  @IsString()
  mentorId?: string;

  @IsOptional()
  metadata?: any;
}
