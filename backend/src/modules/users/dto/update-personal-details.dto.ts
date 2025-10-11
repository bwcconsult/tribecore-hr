import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  CIVIL_PARTNERSHIP = 'CIVIL_PARTNERSHIP',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export class UpdatePersonalDetailsDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Preferred name' })
  @IsString()
  @IsOptional()
  preferredName?: string;

  @ApiPropertyOptional({ description: 'Preferred pronouns (e.g., he/him, she/her, they/them)' })
  @IsString()
  @IsOptional()
  pronouns?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Nationality (ISO country code)' })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Marital status', enum: MaritalStatus })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Personal email' })
  @IsString()
  @IsOptional()
  personalEmail?: string;

  @ApiPropertyOptional({ description: 'Work phone' })
  @IsString()
  @IsOptional()
  workPhone?: string;

  @ApiPropertyOptional({ description: 'Personal phone' })
  @IsString()
  @IsOptional()
  personalPhone?: string;
}
