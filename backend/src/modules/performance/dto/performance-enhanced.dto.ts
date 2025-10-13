import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ObjectiveStatus,
  ObjectiveVisibility,
  ConfidenceLevel,
} from '../entities/objective.entity';
import { ActionSourceType, ActionStatus } from '../entities/action.entity';
import { OneOnOneStatus } from '../entities/one-on-one.entity';
import { AgendaItemType, AgendaItemStatus } from '../entities/one-on-one-agenda-item.entity';
import { FeedbackType, FeedbackVisibility } from '../entities/feedback.entity';
import { RecognitionBadge } from '../entities/recognition.entity';
import { WellbeingVisibility } from '../entities/wellbeing-check.entity';
import { ReviewCycleType, ReviewCycleStatus, RatingScale } from '../entities/review-cycle.entity';
import { ReviewFormType, ReviewFormStatus } from '../entities/review-form.entity';
import { PotentialLevel } from '../entities/calibration-record.entity';
import { PIPStatus, PIPCadence } from '../entities/pip.entity';

// ============ OBJECTIVE DTOs ============
export class CreateObjectiveDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum(ObjectiveVisibility)
  visibility?: ObjectiveVisibility;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  alignedToCompanyPillar?: string;
}

export class UpdateObjectiveDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsEnum(ObjectiveStatus)
  status?: ObjectiveStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsEnum(ConfidenceLevel)
  confidence?: ConfidenceLevel;

  @IsOptional()
  @IsString()
  blockers?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceLinks?: string[];

  @IsOptional()
  @IsBoolean()
  discussInNextOneOnOne?: boolean;
}

export class CheckInObjectiveDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsEnum(ConfidenceLevel)
  confidence: ConfidenceLevel;

  @IsOptional()
  @IsString()
  blockers?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceLinks?: string[];

  @IsOptional()
  @IsBoolean()
  discussInNextOneOnOne?: boolean;
}

export class CreateMilestoneDto {
  @IsString()
  @IsNotEmpty()
  objectiveId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  acceptanceCriteria?: string;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsNumber()
  orderIndex: number;
}

// ============ ACTION DTOs ============
export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsEnum(ActionSourceType)
  sourceType: ActionSourceType;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsString()
  assignedBy?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateActionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsEnum(ActionStatus)
  status?: ActionStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;
}

export class BulkCompleteActionsDto {
  @IsArray()
  @IsString({ each: true })
  actionIds: string[];
}

// ============ 1:1 DTOs ============
export class CreateOneOnOneDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  managerId: string;

  @IsDate()
  @Type(() => Date)
  scheduledAt: Date;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsBoolean()
  autoGenerateAgenda?: boolean;
}

export class UpdateOneOnOneDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledAt?: Date;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(OneOnOneStatus)
  status?: OneOnOneStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  employeeNotes?: string;

  @IsOptional()
  @IsString()
  managerNotes?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class AddAgendaItemDto {
  @IsString()
  @IsNotEmpty()
  oneOnOneId: string;

  @IsEnum(AgendaItemType)
  type: AgendaItemType;

  @IsOptional()
  @IsString()
  refId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  orderIndex: number;

  @IsOptional()
  @IsString()
  addedBy?: string;
}

export class CompleteOneOnOneDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  decisions?: Array<{
    decision: string;
    owner: string;
    dueDate?: Date;
  }>;
}

// ============ FEEDBACK DTOs ============
export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];

  @IsOptional()
  @IsEnum(FeedbackVisibility)
  visibility?: FeedbackVisibility;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  addToNextOneOnOne?: boolean;

  @IsOptional()
  @IsString()
  relatedObjectiveId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

// ============ RECOGNITION DTOs ============
export class CreateRecognitionDto {
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @IsEnum(RecognitionBadge)
  badge: RecognitionBadge;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];

  @IsOptional()
  @IsString()
  relatedObjectiveId?: string;

  @IsOptional()
  @IsBoolean()
  shareToSlack?: boolean;

  @IsOptional()
  @IsBoolean()
  shareToTeams?: boolean;
}

// ============ WELLBEING DTOs ============
export class CreateWellbeingCheckDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  happiness: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  motivation: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  workLifeBalance: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(WellbeingVisibility)
  visibility?: WellbeingVisibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  concerns?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  positives?: string[];

  @IsOptional()
  @IsBoolean()
  requestsSupport?: boolean;

  @IsOptional()
  @IsString()
  supportNeeded?: string;
}

// ============ REVIEW CYCLE DTOs ============
export class CreateReviewCycleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ReviewCycleType)
  type: ReviewCycleType;

  @IsDate()
  @Type(() => Date)
  periodStart: Date;

  @IsDate()
  @Type(() => Date)
  periodEnd: Date;

  @IsDate()
  @Type(() => Date)
  selfReviewStartDate: Date;

  @IsDate()
  @Type(() => Date)
  selfReviewEndDate: Date;

  @IsDate()
  @Type(() => Date)
  managerReviewStartDate: Date;

  @IsDate()
  @Type(() => Date)
  managerReviewEndDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  peerReviewStartDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  peerReviewEndDate?: Date;

  @IsOptional()
  @IsEnum(RatingScale)
  ratingScale?: RatingScale;

  @IsOptional()
  @IsBoolean()
  enablePeerReviews?: boolean;

  @IsOptional()
  @IsBoolean()
  enableUpwardReviews?: boolean;

  @IsOptional()
  @IsBoolean()
  linkToCompensation?: boolean;

  @IsNotEmpty()
  config: any; // Complex object with sections, questions, etc.

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableDepartments?: string[];
}

// ============ REVIEW FORM DTOs ============
export class SubmitReviewFormDto {
  @IsNotEmpty()
  sections: any;

  @IsOptional()
  @IsNumber()
  overallRating?: number;

  @IsOptional()
  @IsString()
  overallComments?: string;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  areasForImprovement?: string;

  @IsOptional()
  @IsString()
  developmentGoals?: string;
}

// ============ CALIBRATION DTOs ============
export class CalibrateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  cycleId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  finalRating: number;

  @IsOptional()
  @IsEnum(PotentialLevel)
  potential?: PotentialLevel;

  @IsOptional()
  @IsString()
  calibrationNotes?: string;

  @IsOptional()
  @IsString()
  justification?: string;
}

export class BatchCalibrateDto {
  @IsString()
  @IsNotEmpty()
  cycleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalibrateEmployeeDto)
  calibrations: CalibrateEmployeeDto[];
}

// ============ PIP DTOs ============
export class CreatePIPDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  managerId: string;

  @IsOptional()
  @IsString()
  hrBusinessPartnerId?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNumber()
  durationWeeks: number;

  @IsEnum(PIPCadence)
  checkInCadence: PIPCadence;

  @IsString()
  @IsNotEmpty()
  performanceIssues: string;

  @IsArray()
  goals: any[];

  @IsOptional()
  @IsString()
  escalationProcess?: string;

  @IsOptional()
  @IsString()
  consequences?: string;
}

export class UpdatePIPDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(PIPStatus)
  status?: PIPStatus;

  @IsOptional()
  @IsArray()
  goals?: any[];

  @IsOptional()
  @IsArray()
  supportProvided?: any[];

  @IsOptional()
  @IsArray()
  checkIns?: any[];

  @IsOptional()
  @IsBoolean()
  extensionRequested?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  extensionEndDate?: Date;

  @IsOptional()
  @IsString()
  extensionReason?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  outcomeJustification?: string;
}
