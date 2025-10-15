import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { JobType, VisibilityLevel } from '../entities/internal-job-posting.entity';

export class CreateJobPostingDto {
  @IsString()
  organizationId: string;

  @IsString()
  jobTitle: string;

  @IsEnum(JobType)
  jobType: JobType;

  @IsString()
  departmentId: string;

  @IsString()
  departmentName: string;

  @IsString()
  locationId: string;

  @IsString()
  locationName: string;

  @IsString()
  description: string;

  @IsArray()
  requiredSkills: Array<{
    skillId: string;
    skillName: string;
    proficiencyLevel: string;
    isRequired: boolean;
  }>;

  @IsEnum(VisibilityLevel)
  @IsOptional()
  visibilityLevel?: VisibilityLevel;

  @IsNumber()
  @IsOptional()
  numberOfOpenings?: number;

  @IsDateString()
  @IsOptional()
  closingDate?: string;

  @IsBoolean()
  @IsOptional()
  requireManagerApproval?: boolean;
}
