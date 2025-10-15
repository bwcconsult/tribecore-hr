import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { RenewalDecision } from '../entities/renewal.entity';

export class RenewalDecisionDto {
  @IsEnum(RenewalDecision)
  decision: RenewalDecision;

  @IsOptional()
  @IsString()
  decisionReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedValue?: number;

  @IsOptional()
  @IsString()
  proposedCurrency?: string;

  @IsOptional()
  @IsString()
  proposedTerm?: string;

  @IsOptional()
  proposedTerms?: Record<string, any>;
}

export class PerformanceAnalysisDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  performanceScore: number;

  @IsOptional()
  performanceMetrics?: Record<string, any>;

  @IsOptional()
  @IsString()
  performanceNotes?: string;
}
