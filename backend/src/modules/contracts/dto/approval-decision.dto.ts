import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApprovalStatus } from '../entities/approval.entity';

export class ApprovalDecisionDto {
  @IsEnum(ApprovalStatus)
  decision: ApprovalStatus; // APPROVED or REJECTED

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  delegatedTo?: string;
}

export class CreateApprovalDto {
  @IsString()
  contractId: string;

  @IsString()
  role: string;

  @IsString()
  approverId: string;

  @IsOptional()
  @IsString()
  dueAt?: string;
}
