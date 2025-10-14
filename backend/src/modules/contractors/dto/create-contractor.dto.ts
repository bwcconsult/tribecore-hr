import { IsString, IsEmail, IsEnum, IsOptional, IsDateString, IsNumber, IsArray } from 'class-validator';
import { ContractorStatus, PaymentFrequency } from '../entities/contractor.entity';

export class CreateContractorDto {
  @IsString()
  organizationId: string;

  @IsString()
  contractorId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsEnum(ContractorStatus)
  @IsOptional()
  status?: ContractorStatus;

  @IsDateString()
  contractStartDate: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @IsNumber()
  rate: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  scopeOfWork?: string;

  @IsOptional()
  @IsString()
  contractDocument?: string;

  @IsOptional()
  @IsString()
  w9Form?: string;

  @IsOptional()
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
  };

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
