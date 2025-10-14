import { IsString, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OverrideDto {
  @ApiProperty()
  @IsString()
  type: 'COVERAGE' | 'EMBARGO' | 'NOTICE' | 'BALANCE' | 'COMPLIANCE';

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorizedBy?: string;
}

export class ApproveLeaveDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false, type: OverrideDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OverrideDto)
  override?: OverrideDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requiresBackfill?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  backfillAssignedTo?: string;
}

export class RejectLeaveDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  suggestedAction?: string;
}

export class RequestChangesDto {
  @ApiProperty()
  @IsString()
  requestedChanges: string;

  @ApiProperty({ required: false })
  @IsOptional()
  suggestedDates?: Array<{
    startDate: Date;
    endDate: Date;
    reason?: string;
  }>;
}
