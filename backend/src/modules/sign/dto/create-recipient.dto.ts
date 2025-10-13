import { IsString, IsEmail, IsEnum, IsOptional, IsInt } from 'class-validator';
import {
  RecipientRole,
  DeliveryMethod,
} from '../entities/recipient.entity';

export class CreateRecipientDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(RecipientRole)
  @IsOptional()
  role?: RecipientRole;

  @IsEnum(DeliveryMethod)
  @IsOptional()
  deliveryMethod?: DeliveryMethod;

  @IsInt()
  @IsOptional()
  order?: number;
}
