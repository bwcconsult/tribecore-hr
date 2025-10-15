import { IsString, IsOptional } from 'class-validator';

export class ApplyForJobDto {
  @IsString()
  jobPostingId: string;

  @IsString()
  employeeId: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsOptional()
  whyInterested?: string;

  @IsString()
  @IsOptional()
  relevantExperience?: string;
}

export class ApproveApplicationDto {
  @IsString()
  approvedBy: string;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class RejectApplicationDto {
  @IsString()
  rejectedBy: string;

  @IsString()
  rejectionReason: string;
}
