import { IsString, IsDate, IsEnum, IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingStatus, TaskStatus } from '../entities/onboarding.entity';

class TaskDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  completedAt?: Date;

  @IsString()
  @IsOptional()
  completedBy?: string;

  @IsString()
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsArray()
  @IsOptional()
  documents?: string[];
}

export class CreateOnboardingDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  completionDate?: Date;

  @IsEnum(OnboardingStatus)
  @IsOptional()
  status?: OnboardingStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks: TaskDto[];

  @IsNumber()
  @IsOptional()
  completedTasksCount?: number;

  @IsNumber()
  totalTasksCount: number;

  @IsNumber()
  @IsOptional()
  progressPercentage?: number;

  @IsString()
  @IsOptional()
  assignedBuddyId?: string;

  @IsOptional()
  feedback?: {
    rating?: number;
    comments?: string;
    submittedAt?: Date;
  };

  @IsString()
  @IsOptional()
  notes?: string;
}
