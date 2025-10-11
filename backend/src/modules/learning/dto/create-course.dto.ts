import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseType, CourseStatus, EnrollmentStatus } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(CourseType)
  type: CourseType;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsString()
  @IsOptional()
  instructor?: string;

  @IsString()
  @IsOptional()
  instructorBio?: string;

  @IsNumber()
  @IsOptional()
  durationHours?: number;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsOptional()
  modules?: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'ASSIGNMENT';
      contentUrl?: string;
      duration?: number;
      order: number;
    }>;
  }>;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsOptional()
  targetAudience?: {
    departments?: string[];
    roles?: string[];
    minTenure?: number;
  };

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishedDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @IsBoolean()
  @IsOptional()
  hasCertificate?: boolean;

  @IsString()
  @IsOptional()
  certificateTemplate?: string;

  @IsString()
  @IsOptional()
  prerequisites?: string;
}

export class CreateEnrollmentDto {
  @IsString()
  courseId: string;

  @IsString()
  employeeId: string;

  @IsDate()
  @Type(() => Date)
  enrollmentDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsString()
  @IsOptional()
  assignedBy?: string;
}
