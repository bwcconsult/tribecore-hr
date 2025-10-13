import { IsString, IsEnum, IsOptional, IsDate, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DelegatePermission } from '../entities/delegate.entity';

export class CreateDelegateDto {
  @IsString()
  delegateEmployeeId: string;

  @IsArray()
  @IsEnum(DelegatePermission, { each: true })
  permissions: DelegatePermission[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  canApproveOnBehalf?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnAction?: boolean;

  organizationId?: string;
  employeeId?: string;
}
