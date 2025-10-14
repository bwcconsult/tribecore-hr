import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsObject, IsDate, IsArray, IsEmail, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, CasePriority, CaseStatus, CaseChannel } from '../entities/hr-case.entity';
import { InvestigationType, InvestigationStatus, InvestigationSeverity } from '../entities/er-investigation.entity';
import { JourneyType } from '../entities/employee-journey.entity';
import { ArticleStatus, ArticleVisibility } from '../entities/knowledge-article.entity';

// ============ HR Case DTOs ============

export class CreateHRCaseDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(CaseType)
  caseType: CaseType;

  @IsEnum(CasePriority)
  @IsOptional()
  priority?: CasePriority;

  @IsEnum(CaseChannel)
  channel: CaseChannel;

  @IsString()
  employeeId: string;

  @IsEmail()
  @IsOptional()
  requesterEmail?: string;

  @IsString()
  @IsOptional()
  requesterPhone?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateHRCaseDto {
  @IsEnum(CasePriority)
  @IsOptional()
  priority?: CasePriority;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  resolutionCategory?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AssignCaseDto {
  @IsString()
  caseId: string;

  @IsString()
  assignedTo: string;

  @IsString()
  assignedBy: string;
}

export class ResolveCaseDto {
  @IsString()
  caseId: string;

  @IsString()
  resolution: string;

  @IsString()
  resolvedBy: string;

  @IsString()
  resolutionCategory: string;
}

export class AddCaseCommentDto {
  @IsString()
  caseId: string;

  @IsString()
  comment: string;

  @IsString()
  authorId: string;

  @IsString()
  authorName: string;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class RateCaseDto {
  @IsString()
  caseId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionScore: number;

  @IsString()
  @IsOptional()
  satisfactionComments?: string;
}

export class GetCasesQueryDto {
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsEnum(CaseType)
  @IsOptional()
  caseType?: CaseType;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsEnum(CasePriority)
  @IsOptional()
  priority?: CasePriority;

  @IsBoolean()
  @IsOptional()
  slaBreached?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

// ============ Knowledge Article DTOs ============

export class CreateKnowledgeArticleDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(ArticleVisibility)
  @IsOptional()
  visibility?: ArticleVisibility;

  @IsArray()
  @IsOptional()
  visibleToGroups?: string[];

  @IsString()
  authorId: string;

  @IsString()
  authorName: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsOptional()
  relatedArticles?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateKnowledgeArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @IsEnum(ArticleVisibility)
  @IsOptional()
  visibility?: ArticleVisibility;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class PublishArticleDto {
  @IsString()
  articleId: string;

  @IsString()
  publishedBy: string;
}

export class RateArticleDto {
  @IsString()
  articleId: string;

  @IsString()
  userId: string;

  @IsBoolean()
  helpful: boolean;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class SearchArticlesDto {
  @IsString()
  organizationId: string;

  @IsString()
  query: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

// ============ ER Investigation DTOs ============

export class CreateERInvestigationDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(InvestigationType)
  investigationType: InvestigationType;

  @IsEnum(InvestigationSeverity)
  @IsOptional()
  severity?: InvestigationSeverity;

  @IsString()
  complainantId: string;

  @IsBoolean()
  @IsOptional()
  anonymousComplaint?: boolean;

  @IsArray()
  @IsOptional()
  respondentIds?: string[];

  @IsString()
  leadInvestigatorId: string;

  @IsArray()
  @IsOptional()
  investigationTeam?: string[];

  @IsString()
  allegations: string;

  @IsArray()
  @IsOptional()
  policiesViolated?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  incidentDate?: Date;

  @IsString()
  @IsOptional()
  incidentLocation?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateERInvestigationDto {
  @IsEnum(InvestigationStatus)
  @IsOptional()
  status?: InvestigationStatus;

  @IsEnum(InvestigationSeverity)
  @IsOptional()
  severity?: InvestigationSeverity;

  @IsArray()
  @IsOptional()
  respondentIds?: string[];

  @IsArray()
  @IsOptional()
  witnessIds?: string[];

  @IsArray()
  @IsOptional()
  investigationTeam?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  targetCompletionDate?: Date;

  @IsString()
  @IsOptional()
  findings?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AddInvestigationNoteDto {
  @IsString()
  investigationId: string;

  @IsString()
  note: string;

  @IsString()
  authorId: string;

  @IsString()
  authorName: string;

  @IsBoolean()
  @IsOptional()
  confidential?: boolean;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class RecordInterviewDto {
  @IsString()
  investigationId: string;

  @IsString()
  intervieweeId: string;

  @IsString()
  intervieweeName: string;

  @IsString()
  role: string; // 'COMPLAINANT', 'RESPONDENT', 'WITNESS'

  @IsString()
  interviewerId: string;

  @IsString()
  interviewerName: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ConcludeInvestigationDto {
  @IsString()
  investigationId: string;

  @IsEnum(InvestigationType)
  outcome: any; // InvestigationOutcome

  @IsString()
  findings: string;

  @IsString()
  @IsOptional()
  recommendations?: string;

  @IsString()
  @IsOptional()
  actionsTaken?: string;

  @IsArray()
  @IsOptional()
  disciplinaryActions?: any[];
}

// ============ Employee Journey DTOs ============

export class CreateEmployeeJourneyDto {
  @IsString()
  organizationId: string;

  @IsString()
  employeeId: string;

  @IsEnum(JourneyType)
  journeyType: JourneyType;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expectedEndDate?: Date;

  @IsString()
  @IsOptional()
  buddyId?: string;

  @IsString()
  @IsOptional()
  coachId?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateJourneyTaskDto {
  @IsString()
  journeyId: string;

  @IsString()
  taskId: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  completedBy?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  completedDate?: Date;
}

export class CompleteJourneyDto {
  @IsString()
  journeyId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  satisfactionScore?: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}
