import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ContactRole } from '../entities/client-contact.entity';

export class CreateClientContactDto {
  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsEnum(ContactRole)
  role: ContactRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsBoolean()
  primaryContact?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  metadata?: any;
}

export class UpdateClientContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(ContactRole)
  role?: ContactRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  primaryContact?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  metadata?: any;
}
