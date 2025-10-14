import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsArray, IsInt } from 'class-validator';
import { SurveyType, SurveyStatus } from '../entities/survey.entity';

export class CreateSurveyDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SurveyType)
  type: SurveyType;

  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsArray()
  questions: Array<{
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'YES_NO' | 'SCALE';
    required: boolean;
    options?: string[];
    order: number;
  }>;

  @IsOptional()
  targetAudience?: {
    departments?: string[];
    roles?: string[];
    employmentTypes?: string[];
  };

  @IsOptional()
  @IsInt()
  targetCount?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
