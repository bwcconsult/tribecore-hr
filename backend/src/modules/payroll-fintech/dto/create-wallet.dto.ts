import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsString()
  employeeId: string;

  @IsString()
  organizationId: string;

  @IsEnum(WalletType)
  @IsOptional()
  walletType?: WalletType;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
