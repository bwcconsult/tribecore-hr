import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus, EmploymentType } from '../entities/job.entity';

export class CreateJobDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  department: string;

  @IsString()
  location: string;

  @IsBoolean()
  @IsOptional()
  isRemote?: boolean;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsNumber()
  @IsOptional()
  openings?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishedDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  closingDate?: Date;

  @IsString()
  @IsOptional()
  hiringManager?: string;

  @IsOptional()
  requirements?: {
    education?: string[];
    experience?: string;
    skills?: string[];
    certifications?: string[];
  };

  @IsArray()
  @IsOptional()
  responsibilities?: string[];

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsOptional()
  interviewProcess?: Array<{
    stage: string;
    description: string;
    duration?: number;
  }>;

  @IsString()
  @IsOptional()
  notes?: string;
}
