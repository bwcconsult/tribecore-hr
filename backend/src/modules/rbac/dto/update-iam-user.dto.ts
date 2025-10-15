import { IsString, IsEmail, IsEnum, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { IamUserType, IamUserStatus } from '../entities/iam-user.entity';

export class UpdateIamUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(IamUserType)
  type?: IamUserType;

  @IsOptional()
  @IsEnum(IamUserStatus)
  status?: IamUserStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

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
  requiresMfa?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
