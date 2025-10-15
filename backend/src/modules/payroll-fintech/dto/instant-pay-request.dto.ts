import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min } from 'class-validator';
import { InstantPayType } from '../entities/instant-pay-request.entity';

export class CreateInstantPayRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsNumber()
  @Min(1)
  requestedAmount: number;

  @IsEnum(InstantPayType)
  @IsOptional()
  payType?: InstantPayType;

  @IsObject()
  @IsOptional()
  destinationAccount?: {
    type: 'BANK_ACCOUNT' | 'DEBIT_CARD' | 'MOBILE_MONEY' | 'WALLET';
    provider: string;
    accountNumber?: string;
    accountName?: string;
  };

  @IsString()
  @IsOptional()
  currency?: string;
}
