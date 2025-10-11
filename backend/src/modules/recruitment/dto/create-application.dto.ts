import { IsString, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApplicationStatus } from '../entities/job.entity';

export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsString()
  @IsOptional()
  coverLetterUrl?: string;

  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @IsString()
  @IsOptional()
  linkedInUrl?: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsOptional()
  answers?: Record<string, any>;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  referredBy?: string;

  @IsString()
  @IsOptional()
  currentCompany?: string;

  @IsNumber()
  @IsOptional()
  currentSalary?: number;

  @IsNumber()
  @IsOptional()
  expectedSalary?: number;

  @IsNumber()
  @IsOptional()
  noticePeriodDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
