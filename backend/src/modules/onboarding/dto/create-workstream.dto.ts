import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { WorkstreamName } from '../entities/workstream.entity';

export class CreateWorkstreamDto {
  @IsString()
  caseId: string;

  @IsEnum(WorkstreamName)
  name: WorkstreamName;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  metadata?: any;
}
