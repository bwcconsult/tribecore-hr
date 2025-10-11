import { IsNotEmpty, IsString, IsOptional, IsDate, IsBoolean, IsEnum, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BankAccountType, PaymentMethod } from '../entities/bank-details.entity';
import { Country, Currency } from '../../../common/enums';

export class CreateBankDetailsDto {
  @IsNotEmpty()
  @IsString()
  accountHolderName: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  sortCode?: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  swiftCode?: string;

  @IsNotEmpty()
  @IsEnum(BankAccountType)
  accountType: BankAccountType;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  branchCode?: string;

  @IsNotEmpty()
  @IsEnum(Country)
  country: Country;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @IsOptional()
  @IsNumber()
  percentageAmount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveFrom?: Date;

  @IsNotEmpty()
  @IsBoolean()
  consentGiven: boolean;
}

export class UpdateBankDetailsDto {
  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveTo?: Date;
}

export class VerifyBankDetailsDto {
  @IsNotEmpty()
  @IsString()
  bankDetailsId: string;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}
