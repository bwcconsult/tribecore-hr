import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory, ExpenseStatus, PaymentMethod } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsDate()
  @Type(() => Date)
  expenseDate: Date;

  @IsString()
  merchant: string;

  @IsString()
  description: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsNumber()
  @IsOptional()
  amountInBaseCurrency?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;

  @IsArray()
  @IsOptional()
  receipts?: string[];

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @IsBoolean()
  @IsOptional()
  isReimbursable?: boolean;

  @IsNumber()
  @IsOptional()
  reimbursableAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
