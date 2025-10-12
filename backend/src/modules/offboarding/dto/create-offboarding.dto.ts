import { IsString, IsEnum, IsOptional, IsDateString, IsInt, IsBoolean, IsObject, IsArray, IsNumber } from 'class-validator';
import { OffboardingReason } from '../entities/offboarding.entity';
import { TaskCategory } from '../entities/offboarding-task.entity';

export class CreateOffboardingDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsEnum(OffboardingReason)
  reason: OffboardingReason;

  @IsDateString()
  lastWorkingDay: Date;

  @IsDateString()
  @IsOptional()
  noticeGivenDate?: Date;

  @IsInt()
  @IsOptional()
  noticePeriodDays?: number;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  redundancyDetails?: {
    isRedundancy: boolean;
    redundancyPackage?: number;
    redundancyReason?: string;
    consultationStartDate?: Date;
    consultationEndDate?: Date;
    alternativeRolesOffered?: string[];
  };
}

export class CreateOffboardingTaskDto {
  @IsString()
  offboardingProcessId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskCategory)
  category: TaskCategory;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class CreateExitInterviewDto {
  @IsString()
  offboardingProcessId: string;

  @IsString()
  employeeId: string;

  @IsDateString()
  interviewDate: Date;

  @IsNumber()
  @IsOptional()
  overallSatisfactionRating?: number;

  @IsObject()
  @IsOptional()
  ratings?: {
    workEnvironment?: number;
    management?: number;
    careerDevelopment?: number;
    compensation?: number;
    workLifeBalance?: number;
    teamCollaboration?: number;
  };

  @IsString()
  @IsOptional()
  reasonForLeaving?: string;

  @IsString()
  @IsOptional()
  whatWentWell?: string;

  @IsString()
  @IsOptional()
  areasForImprovement?: string;

  @IsString()
  @IsOptional()
  wouldRecommendCompany?: string;

  @IsString()
  @IsOptional()
  additionalComments?: string;

  @IsBoolean()
  @IsOptional()
  wouldRehire?: boolean;

  @IsBoolean()
  @IsOptional()
  openToReturning?: boolean;

  @IsArray()
  @IsOptional()
  improvementSuggestions?: string[];
}

export class UpdateFinalSettlementDto {
  @IsNumber()
  @IsOptional()
  finalSalary?: number;

  @IsNumber()
  @IsOptional()
  accruedLeave?: number;

  @IsNumber()
  @IsOptional()
  leavePayment?: number;

  @IsNumber()
  @IsOptional()
  severancePay?: number;

  @IsNumber()
  @IsOptional()
  bonuses?: number;

  @IsNumber()
  @IsOptional()
  otherPayments?: number;

  @IsDateString()
  @IsOptional()
  paymentDate?: Date;
}
