import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProvisioningSystem, ProvisioningStatus } from '../entities/provisioning-ticket.entity';

export class CreateProvisioningTicketDto {
  @IsString()
  organizationId: string;

  @IsString()
  caseId: string;

  @IsEnum(ProvisioningSystem)
  system: ProvisioningSystem;

  @IsOptional()
  @IsString()
  externalRef?: string;

  @IsOptional()
  @IsEnum(ProvisioningStatus)
  status?: ProvisioningStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  metadataJson?: any;
}

export class UpdateProvisioningTicketDto {
  @IsOptional()
  @IsEnum(ProvisioningStatus)
  status?: ProvisioningStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  metadataJson?: any;
}
