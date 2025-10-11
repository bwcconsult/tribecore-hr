import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PolicyRuleType, PolicyScope } from '../enums/expense-types.enum';

class ApprovalLevelDto {
  @ApiProperty({ description: 'Approval level (1, 2, 3, etc.)' })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'Required role for this level' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ description: 'Minimum amount for this level' })
  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum amount for this level' })
  @IsNumber()
  @IsOptional()
  maxAmount?: number;
}

export class CreatePolicyRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of policy rule', enum: PolicyRuleType })
  @IsEnum(PolicyRuleType)
  ruleType: PolicyRuleType;

  @ApiProperty({ description: 'Scope of the rule', enum: PolicyScope, default: PolicyScope.GLOBAL })
  @IsEnum(PolicyScope)
  @IsOptional()
  scope?: PolicyScope;

  @ApiPropertyOptional({ description: 'Department ID (if scope is DEPARTMENT)' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Role ID (if scope is ROLE)' })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Project ID (if scope is PROJECT)' })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'User ID (if scope is INDIVIDUAL)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Category ID (apply to specific category)' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Threshold amount' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  threshold?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'GBP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Approval levels configuration', type: [ApprovalLevelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalLevelDto)
  @IsOptional()
  approvalLevels?: ApprovalLevelDto[];

  @ApiPropertyOptional({ description: 'Requires receipt', default: false })
  @IsBoolean()
  @IsOptional()
  requiresReceipt?: boolean;

  @ApiPropertyOptional({ description: 'Receipt required above this amount' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  receiptThreshold?: number;

  @ApiPropertyOptional({ description: 'Maximum days after expense to submit' })
  @IsNumber()
  @IsOptional()
  daysToSubmit?: number;

  @ApiPropertyOptional({ description: 'Maximum days for approval' })
  @IsNumber()
  @IsOptional()
  daysToApprove?: number;

  @ApiPropertyOptional({ description: 'Rule priority (higher = checked first)', default: 0 })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: 'Is rule active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
