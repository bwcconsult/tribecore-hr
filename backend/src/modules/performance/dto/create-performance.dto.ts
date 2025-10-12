import { IsString, IsEnum, IsDateString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PerformanceReviewType } from '../../../common/enums';

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

  @ApiProperty({ minimum: 0, maximum: 100, description: 'Performance rating 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  overallRating: number;

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
