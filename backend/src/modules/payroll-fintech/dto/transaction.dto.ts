import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { TransactionType, TransactionCategory } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  walletId: string;

  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fee?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}

export class WithdrawFundsDto {
  @IsString()
  walletId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  destinationAccountId: string;

  @IsString()
  @IsOptional()
  description?: string;
}
