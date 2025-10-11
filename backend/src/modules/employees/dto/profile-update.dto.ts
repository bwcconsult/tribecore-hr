import { IsString, IsOptional, IsDateString, IsEmail, IsEnum, IsBoolean } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
  OTHER = 'OTHER',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
  CIVIL_PARTNERSHIP = 'CIVIL_PARTNERSHIP',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  preferredName?: string;

  @IsString()
  @IsOptional()
  preferredPronouns?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsDateString()
  @IsOptional()
  maritalStatusEffectiveDate?: string;

  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @IsString()
  @IsOptional()
  personalPhone?: string;

  @IsString()
  @IsOptional()
  homeAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postcode?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class UpdateEmploymentDto {
  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  jobFamily?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  costCentre?: string;

  @IsDateString()
  @IsOptional()
  deploymentStartDate?: string;

  @IsDateString()
  @IsOptional()
  deploymentEndDate?: string;
}

export class CreateEmploymentActivityDto {
  @IsString()
  personId: string;

  @IsDateString()
  date: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  payload?: any;
}

export class CreateWorkScheduleDto {
  @IsString()
  personId: string;

  @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
  weekday: string;

  @IsOptional()
  hours?: number;

  @IsDateString()
  effectiveFrom: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsOptional()
  breakMinutes?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateEmergencyContactDto {
  @IsString()
  personId: string;

  @IsString()
  name: string;

  @IsEnum(['SPOUSE', 'PARTNER', 'PARENT', 'CHILD', 'SIBLING', 'FRIEND', 'OTHER'])
  relationship: string;

  @IsString()
  @IsOptional()
  relationshipOther?: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  alternativePhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  consentGiven?: boolean;
}

export class CreateDependantDto {
  @IsString()
  personId: string;

  @IsString()
  name: string;

  @IsEnum(['SPOUSE', 'PARTNER', 'PARENT', 'CHILD', 'SIBLING', 'FRIEND', 'OTHER'])
  relationship: string;

  @IsString()
  @IsOptional()
  relationshipOther?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsBoolean()
  @IsOptional()
  isDependent?: boolean;

  @IsBoolean()
  @IsOptional()
  isEmergencyContact?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  consentGiven?: boolean;
}
