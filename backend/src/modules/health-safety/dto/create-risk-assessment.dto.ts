import { IsString, IsEnum, IsOptional, IsDateString, IsArray, IsObject, IsNumber } from 'class-validator';
import { RiskStatus, RiskLevel } from '../entities/risk-assessment.entity';

export class CreateRiskAssessmentDto {
  @IsString()
  organizationId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsString()
  department: string;

  @IsArray()
  @IsOptional()
  affectedPersons?: string[];

  @IsString()
  assessedBy: string;

  @IsDateString()
  assessmentDate: Date;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: Date;

  @IsArray()
  hazards: Array<{
    hazard: string;
    whoAtRisk: string;
    existingControls: string;
    likelihood: number;
    severity: number;
    additionalControls?: string;
    actionRequired?: string;
    actionOwner?: string;
    actionDeadline?: Date;
  }>;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateIncidentDto {
  @IsString()
  organizationId: string;

  @IsString()
  type: string;

  @IsString()
  severity: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  incidentDateTime: Date;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  specificLocation?: string;

  @IsString()
  reportedBy: string;

  @IsArray()
  @IsOptional()
  personsInvolved?: string[];

  @IsString()
  @IsOptional()
  immediateAction?: string;

  @IsString()
  @IsOptional()
  injuryDetails?: string;

  @IsOptional()
  medicalTreatmentRequired?: boolean;

  @IsOptional()
  isRIDDORReportable?: boolean;
}
