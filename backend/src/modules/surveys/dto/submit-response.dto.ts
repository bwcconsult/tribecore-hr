import { IsString, IsOptional, IsObject } from 'class-validator';

export class SubmitResponseDto {
  @IsString()
  surveyId: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsObject()
  answers: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
