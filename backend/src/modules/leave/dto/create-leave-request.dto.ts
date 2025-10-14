import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PartialDayDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string; // HH:mm

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  minutes: number;
}

class AttachmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string; // FIT_NOTE, MEDICAL_CERT, COURT_LETTER

  @ApiProperty()
  @IsString()
  url: string;
}

export class CreateLeaveRequestDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  leaveTypeCode: string; // AL, SICK, TOIL, MAT, PAT

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ required: false, type: [PartialDayDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialDayDto)
  partialDays?: PartialDayDto[];

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeNotes?: string;

  @ApiProperty({ required: false, type: [AttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverEmployeeId?: string; // For swap/cover proposals
}
