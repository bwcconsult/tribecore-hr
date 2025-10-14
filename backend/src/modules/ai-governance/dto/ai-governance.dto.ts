import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsObject, IsDate, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AIRiskLevel, AIUsageArea, AISystemStatus, DecisionOutcome } from '../entities/ai-system.entity';

// ============ AI System DTOs ============

export class CreateAISystemDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  vendor: string;

  @IsString()
  @IsOptional()
  vendorContact?: string;

  @IsEnum(AIRiskLevel)
  riskLevel: AIRiskLevel;

  @IsEnum(AIUsageArea)
  usageArea: AIUsageArea;

  @IsBoolean()
  @IsOptional()
  requiresHumanReview?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTransparencyNotice?: boolean;

  @IsString()
  @IsOptional()
  transparencyNoticeText?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsString()
  @IsOptional()
  ownerEmail?: string;

  @IsObject()
  @IsOptional()
  humanReviewConfig?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateAISystemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AISystemStatus)
  @IsOptional()
  status?: AISystemStatus;

  @IsEnum(AIRiskLevel)
  @IsOptional()
  riskLevel?: AIRiskLevel;

  @IsBoolean()
  @IsOptional()
  requiresHumanReview?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTransparencyNotice?: boolean;

  @IsString()
  @IsOptional()
  transparencyNoticeText?: string;

  @IsBoolean()
  @IsOptional()
  hasDataProtectionImpactAssessment?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dpiaCompletedDate?: Date;

  @IsString()
  @IsOptional()
  dpiaDocumentUrl?: string;

  @IsBoolean()
  @IsOptional()
  loggingEnabled?: boolean;

  @IsObject()
  @IsOptional()
  humanReviewConfig?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class RecordBiasTestDto {
  @IsString()
  aiSystemId: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  genderDisparateImpact?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  ethnicityDisparateImpact?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  ageDisparateImpact?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  disabilityDisparateImpact?: number;

  @IsString()
  testMethod: string; // "4/5ths rule", "Statistical parity", etc.

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateModelVersionDto {
  @IsString()
  aiSystemId: string;

  @IsString()
  modelVersion: string;

  @IsDate()
  @Type(() => Date)
  lastModelUpdate: Date;

  @IsString()
  @IsOptional()
  trainingDataSources?: string;

  @IsObject()
  @IsOptional()
  performanceMetrics?: Record<string, number>;
}

export class CertifyAISystemDto {
  @IsString()
  aiSystemId: string;

  @IsBoolean()
  certified: boolean;

  @IsString()
  certifiedBy: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  certificationExpiryDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

// ============ AI Decision Log DTOs ============

export class LogAIDecisionDto {
  @IsString()
  organizationId: string;

  @IsString()
  aiSystemId: string;

  @IsString()
  subjectType: string; // 'CANDIDATE', 'EMPLOYEE', etc.

  @IsString()
  subjectId: string;

  @IsString()
  @IsOptional()
  subjectName?: string;

  @IsString()
  decisionType: string; // 'CV_SCORE', 'PERFORMANCE_RATING', etc.

  @IsEnum(DecisionOutcome)
  outcome: DecisionOutcome;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidenceScore?: number;

  @IsObject()
  aiOutput: {
    recommendation: string;
    score?: number;
    reasoning?: string[];
    factors?: Record<string, any>;
    alternatives?: any[];
  };

  @IsObject()
  @IsOptional()
  inputData?: Record<string, any>;

  @IsString()
  @IsOptional()
  modelVersion?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ReviewAIDecisionDto {
  @IsString()
  decisionLogId: string;

  @IsString()
  reviewedBy: string; // User ID

  @IsString()
  reviewerName: string;

  @IsString()
  @IsOptional()
  reviewNotes?: string;

  @IsBoolean()
  overridden: boolean;

  @IsString()
  @IsOptional()
  overrideReason?: string;

  @IsObject()
  @IsOptional()
  finalDecision?: {
    outcome: string;
    decidedBy: string;
  };
}

export class RecordDecisionOutcomeDto {
  @IsString()
  decisionLogId: string;

  @IsString()
  actualOutcome: string; // What actually happened

  @IsBoolean()
  aiCorrect: boolean; // Was AI prediction correct?

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GetAIDecisionLogsQueryDto {
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  aiSystemId?: string;

  @IsString()
  @IsOptional()
  subjectType?: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsEnum(DecisionOutcome)
  @IsOptional()
  outcome?: DecisionOutcome;

  @IsBoolean()
  @IsOptional()
  humanReviewed?: boolean;

  @IsBoolean()
  @IsOptional()
  overridden?: boolean;

  @IsBoolean()
  @IsOptional()
  auditFlagged?: boolean;

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

// ============ Compliance Report DTOs ============

export class GenerateComplianceReportDto {
  @IsString()
  organizationId: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsArray()
  @IsOptional()
  aiSystemIds?: string[];

  @IsBoolean()
  @IsOptional()
  includeDecisionLogs?: boolean;

  @IsBoolean()
  @IsOptional()
  includeBiasTests?: boolean;
}
