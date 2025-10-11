import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsBoolean, IsArray } from 'class-validator';

// Skills DTOs
export class CreateSkillDto {
  @IsString()
  name: string;

  @IsEnum(['TECHNICAL', 'SOFT_SKILLS', 'LEADERSHIP', 'LANGUAGE', 'CERTIFICATION', 'OTHER'])
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePersonSkillDto {
  @IsString()
  personId: string;

  @IsString()
  skillId: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  level: string;

  @IsDateString()
  @IsOptional()
  acquiredDate?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Education DTOs
export class CreateEducationDto {
  @IsString()
  personId: string;

  @IsString()
  institution: string;

  @IsString()
  degree: string;

  @IsString()
  @IsOptional()
  fieldOfStudy?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsBoolean()
  @IsOptional()
  isCurrentlyEnrolled?: boolean;

  @IsString()
  @IsOptional()
  achievements?: string;
}

// Qualification DTOs
export class CreateQualificationDto {
  @IsString()
  personId: string;

  @IsEnum(['DEGREE', 'DIPLOMA', 'CERTIFICATE', 'PROFESSIONAL_CERTIFICATION', 'LICENSE', 'OTHER'])
  type: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  credentialId?: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsBoolean()
  @IsOptional()
  doesNotExpire?: boolean;

  @IsString()
  @IsOptional()
  verificationUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// Language DTOs
export class CreateLanguageDto {
  @IsString()
  personId: string;

  @IsString()
  language: string;

  @IsString()
  @IsOptional()
  proficiency?: string; // CEFR level

  @IsBoolean()
  @IsOptional()
  isNative?: boolean;

  @IsBoolean()
  @IsOptional()
  canRead?: boolean;

  @IsBoolean()
  @IsOptional()
  canWrite?: boolean;

  @IsBoolean()
  @IsOptional()
  canSpeak?: boolean;
}

// License DTOs
export class CreateLicenseDto {
  @IsString()
  personId: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  restrictions?: string;
}

// Training Activity DTOs
export class CreateTrainingActivityDto {
  @IsString()
  personId: string;

  @IsEnum(['COURSE', 'WORKSHOP', 'SEMINAR', 'WEBINAR', 'CONFERENCE', 'ON_THE_JOB', 'MENTORING', 'SELF_STUDY', 'OTHER'])
  type: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueAt?: string;

  @IsNumber()
  @IsOptional()
  cpdHours?: number;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  assignedBy?: string;
}

export class UpdateTrainingActivityDto {
  @IsEnum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsString()
  @IsOptional()
  evidenceUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Development Plan DTOs
export class CreateDevelopmentPlanDto {
  @IsString()
  personId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsString()
  @IsOptional()
  mentorId?: string;

  @IsArray()
  @IsOptional()
  goals?: Array<{
    goal: string;
    targetDate?: string;
    status?: string;
    notes?: string;
  }>;
}

// Development Need DTOs
export class CreateDevelopmentNeedDto {
  @IsString()
  personId: string;

  @IsString()
  skillGap: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  priority?: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsString()
  @IsOptional()
  suggestedTraining?: string;
}
