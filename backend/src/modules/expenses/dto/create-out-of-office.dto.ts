import { IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOutOfOfficeDto {
  @IsString()
  substituteEmployeeId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  notifySubstitute?: boolean;

  organizationId?: string;
  employeeId?: string;
}
