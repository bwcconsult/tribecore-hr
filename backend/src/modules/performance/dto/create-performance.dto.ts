import { IsString, IsEnum, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PerformanceReviewType, PerformanceRating } from '../../../common/enums';

export class CreatePerformanceReviewDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  reviewerId: string;

  @ApiProperty({ enum: PerformanceReviewType })
  @IsEnum(PerformanceReviewType)
  reviewType: PerformanceReviewType;

  @ApiProperty()
  @IsDateString()
  reviewPeriodStart: Date;

  @ApiProperty()
  @IsDateString()
  reviewPeriodEnd: Date;

  @ApiProperty()
  @IsDateString()
  reviewDate: Date;

  @ApiProperty({ enum: PerformanceRating })
  @IsEnum(PerformanceRating)
  overallRating: PerformanceRating;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  competencies?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  goals?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areasForImprovement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewerComments?: string;
}
