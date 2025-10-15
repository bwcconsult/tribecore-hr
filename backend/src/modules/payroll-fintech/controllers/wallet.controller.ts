import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { WithdrawFundsDto } from '../dto/transaction.dto';

@ApiTags('Payroll Fintech - Wallets')
@Controller('api/v1/fintech/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee wallet' })
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get wallet by employee ID' })
  async getEmployeeWallet(@Param('employeeId') employeeId: string) {
    return this.walletService.getWalletByEmployee(employeeId);
  }

  @Get(':walletId')
  @ApiOperation({ summary: 'Get wallet by ID' })
  async getWallet(@Param('walletId') walletId: string) {
    return this.walletService.getWalletById(walletId);
  }

  @Get(':walletId/stats')
  @ApiOperation({ summary: 'Get wallet statistics' })
  async getWalletStats(@Param('walletId') walletId: string) {
    return this.walletService.getWalletStats(walletId);
  }

  @Get(':walletId/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  async getTransactions(
    @Param('walletId') walletId: string,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactionHistory(walletId, limit);
  }

  @Patch(':walletId/verify')
  @ApiOperation({ summary: 'Verify wallet (KYC approval)' })
  async verifyWallet(
    @Param('walletId') walletId: string,
    @Body('verifiedBy') verifiedBy: string,
  ) {
    return this.walletService.verifyWallet(walletId, verifiedBy);
  }

  @Patch(':walletId/suspend')
  @ApiOperation({ summary: 'Suspend wallet' })
  async suspendWallet(@Param('walletId') walletId: string) {
    return this.walletService.suspendWallet(walletId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get all wallets for organization' })
  async getOrganizationWallets(@Param('organizationId') organizationId: string) {
    return this.walletService.getWalletsByOrganization(organizationId);
  }
}
