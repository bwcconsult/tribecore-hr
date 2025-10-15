import { IsString, IsEmail, IsEnum, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { IamUserType } from '../entities/iam-user.entity';

export class CreateIamUserDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsEnum(IamUserType)
  type: IamUserType;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIpAddresses?: string[];

  @IsOptional()
  @IsDateString()
  accessExpiresAt?: string;

  @IsOptional()
  @IsString()
  externalCompany?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsBoolean()
  isServiceAccount?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresMfa?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
