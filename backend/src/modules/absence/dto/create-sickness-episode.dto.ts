import { IsNotEmpty, IsString, IsOptional, IsDate, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { SicknessType } from '../entities/sickness-episode.entity';

export class CreateSicknessEpisodeDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsEnum(SicknessType)
  sicknessType?: SicknessType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  @IsBoolean()
  isCertified?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  certificateDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificateAttachmentIds?: string[];
}

export class UpdateSicknessEpisodeDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isReturnedToWork?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  returnToWorkDate?: Date;

  @IsOptional()
  @IsBoolean()
  isCertified?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  certificateDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificateAttachmentIds?: string[];
}

export class CompleteRTWInterviewDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  interviewDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
