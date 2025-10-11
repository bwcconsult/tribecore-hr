import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class ApproveExpenseDto {
  @ApiProperty({ description: 'Approval action', enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @ApiPropertyOptional({ description: 'Comments/notes for approval' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ description: 'Rejection reason (if rejecting)' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Override policy violations', default: false })
  @IsBoolean()
  @IsOptional()
  isOverride?: boolean;

  @ApiPropertyOptional({ description: 'Justification for override' })
  @IsString()
  @IsOptional()
  overrideJustification?: string;
}
