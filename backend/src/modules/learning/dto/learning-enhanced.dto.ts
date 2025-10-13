import { IsString, IsInt, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { LessonType } from '../entities/lesson.entity';
import { TrainingCategory, ComplianceFrequency } from '../entities/mandatory-training.entity';

// Course Module DTOs
export class CreateModuleDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  learningObjectives?: string;

  @IsOptional()
  resources?: Array<{
    title: string;
    type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT';
    url: string;
  }>;
}

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  learningObjectives?: string;

  @IsOptional()
  resources?: Array<{
    title: string;
    type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT';
    url: string;
  }>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Lesson DTOs
export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  contentUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
      options?: string[];
      correctAnswer: string | string[];
      points: number;
      explanation?: string;
    }>;
    passingScore: number;
    timeLimit?: number;
    attempts: number;
  };

  @IsOptional()
  interactiveContent?: {
    type: 'SCENARIO' | 'SIMULATION' | 'DRAG_DROP' | 'MATCHING';
    config: any;
  };

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsOptional()
  completionCriteria?: {
    minDuration?: number;
    requireQuizPass?: boolean;
    requireAssignment?: boolean;
    minScore?: number;
  };
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LessonType)
  @IsOptional()
  type?: LessonType;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  contentUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  quiz?: any;

  @IsOptional()
  interactiveContent?: any;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  completionCriteria?: any;
}

// Progress DTOs
export class StartLessonDto {
  @IsString()
  enrollmentId: string;

  @IsString()
  lessonId: string;

  @IsString()
  employeeId: string;
}

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progressPercentage?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  timeSpentSeconds?: number;

  @IsOptional()
  metadata?: any;
}

export class SubmitQuizDto {
  @IsArray()
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
}

// Mandatory Training DTOs
export class CreateMandatoryTrainingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TrainingCategory)
  category: TrainingCategory;

  @IsArray()
  ukLegislation: string[];

  @IsEnum(ComplianceFrequency)
  frequency: ComplianceFrequency;

  @IsInt()
  @Min(1)
  validityMonths: number;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsArray()
  applicableTo: string[];

  @IsString()
  whatItCovers: string;

  @IsArray()
  learningOutcomes: string[];

  @IsArray()
  @IsOptional()
  targetRoles?: string[];

  @IsArray()
  @IsOptional()
  targetDepartments?: string[];

  @IsBoolean()
  @IsOptional()
  requiresAssessment?: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  minimumPassingScore?: number;

  @IsBoolean()
  @IsOptional()
  requiresCertification?: boolean;

  @IsString()
  @IsOptional()
  regulatoryBody?: string;

  @IsString()
  @IsOptional()
  penalties?: string;

  @IsOptional()
  courseStructure?: {
    modules: Array<{
      title: string;
      topics: string[];
      duration: number;
    }>;
  };

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateMandatoryTrainingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TrainingCategory)
  @IsOptional()
  category?: TrainingCategory;

  @IsArray()
  @IsOptional()
  ukLegislation?: string[];

  @IsEnum(ComplianceFrequency)
  @IsOptional()
  frequency?: ComplianceFrequency;

  @IsInt()
  @Min(1)
  @IsOptional()
  validityMonths?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @IsArray()
  @IsOptional()
  applicableTo?: string[];

  @IsString()
  @IsOptional()
  whatItCovers?: string;

  @IsArray()
  @IsOptional()
  learningOutcomes?: string[];

  @IsArray()
  @IsOptional()
  targetRoles?: string[];

  @IsArray()
  @IsOptional()
  targetDepartments?: string[];

  @IsBoolean()
  @IsOptional()
  requiresAssessment?: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  minimumPassingScore?: number;

  @IsBoolean()
  @IsOptional()
  requiresCertification?: boolean;

  @IsString()
  @IsOptional()
  regulatoryBody?: string;

  @IsString()
  @IsOptional()
  penalties?: string;

  @IsOptional()
  courseStructure?: any;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
