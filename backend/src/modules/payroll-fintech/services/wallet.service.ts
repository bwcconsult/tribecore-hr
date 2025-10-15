import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollWallet, WalletStatus } from '../entities/wallet.entity';
import { WalletTransaction, TransactionType, TransactionStatus, TransactionCategory } from '../entities/transaction.entity';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { CreateTransactionDto } from '../dto/transaction.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(PayrollWallet)
    private walletRepo: Repository<PayrollWallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepo: Repository<WalletTransaction>,
  ) {}

  async createWallet(dto: CreateWalletDto): Promise<PayrollWallet> {
    // Check if wallet already exists
    const existing = await this.walletRepo.findOne({
      where: { employeeId: dto.employeeId },
    });

    if (existing) {
      throw new BadRequestException('Wallet already exists for this employee');
    }

    const wallet = this.walletRepo.create({
      ...dto,
      walletNumber: this.generateWalletNumber(),
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      limits: {
        dailyWithdrawal: 1000,
        weeklyWithdrawal: 5000,
        monthlyWithdrawal: 20000,
        perTransactionLimit: 500,
      },
    });

    return await this.walletRepo.save(wallet);
  }

  async getWalletByEmployee(employeeId: string): Promise<PayrollWallet> {
    const wallet = await this.walletRepo.findOne({
      where: { employeeId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getWalletById(walletId: string): Promise<PayrollWallet> {
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async creditWallet(
    walletId: string,
    amount: number,
    category: TransactionCategory,
    description?: string,
    metadata?: any,
  ): Promise<WalletTransaction> {
    const wallet = await this.getWalletById(walletId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Wallet is not active');
    }

    const balanceBefore = Number(wallet.availableBalance);
    const balanceAfter = balanceBefore + amount;

    // Create transaction
    const transaction = this.transactionRepo.create({
      walletId,
      employeeId: wallet.employeeId,
      organizationId: wallet.organizationId,
      type: TransactionType.CREDIT,
      category,
      amount,
      fee: 0,
      netAmount: amount,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      description,
      status: TransactionStatus.COMPLETED,
      processedAt: new Date(),
      settledAt: new Date(),
      metadata,
    });

    const savedTransaction = await this.transactionRepo.save(transaction);

    // Update wallet balance
    wallet.availableBalance = balanceAfter;
    wallet.totalEarned = Number(wallet.totalEarned) + amount;
    wallet.lastTransactionAt = new Date();
    await this.walletRepo.save(wallet);

    return savedTransaction;
  }

  async debitWallet(
    walletId: string,
    amount: number,
    fee: number,
    category: TransactionCategory,
    description?: string,
    metadata?: any,
  ): Promise<WalletTransaction> {
    const wallet = await this.getWalletById(walletId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Wallet is not active');
    }

    const totalDeduction = amount + fee;
    const balanceBefore = Number(wallet.availableBalance);

    if (balanceBefore < totalDeduction) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceAfter = balanceBefore - totalDeduction;

    // Create transaction
    const transaction = this.transactionRepo.create({
      walletId,
      employeeId: wallet.employeeId,
      organizationId: wallet.organizationId,
      type: TransactionType.DEBIT,
      category,
      amount,
      fee,
      netAmount: amount - fee,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      description,
      status: TransactionStatus.COMPLETED,
      processedAt: new Date(),
      settledAt: new Date(),
      metadata,
    });

    const savedTransaction = await this.transactionRepo.save(transaction);

    // Update wallet balance
    wallet.availableBalance = balanceAfter;
    wallet.totalWithdrawn = Number(wallet.totalWithdrawn) + amount;
    wallet.lastTransactionAt = new Date();
    await this.walletRepo.save(wallet);

    return savedTransaction;
  }

  async getTransactionHistory(
    walletId: string,
    limit: number = 50,
  ): Promise<WalletTransaction[]> {
    return await this.transactionRepo.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getWalletStats(walletId: string) {
    const wallet = await this.getWalletById(walletId);
    const transactions = await this.transactionRepo.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const last30Days = transactions.filter(
      t => new Date(t.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const credits = last30Days.filter(t => t.type === TransactionType.CREDIT);
    const debits = last30Days.filter(t => t.type === TransactionType.DEBIT);

    return {
      wallet: {
        id: wallet.id,
        availableBalance: wallet.availableBalance,
        pendingBalance: wallet.pendingBalance,
        currency: wallet.currency,
        status: wallet.status,
      },
      stats: {
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
        last30Days: {
          credits: credits.length,
          debits: debits.length,
          totalCredits: credits.reduce((sum, t) => sum + Number(t.amount), 0),
          totalDebits: debits.reduce((sum, t) => sum + Number(t.amount), 0),
        },
        recentTransactions: transactions.slice(0, 10),
      },
    };
  }

  async verifyWallet(walletId: string, verifiedBy: string): Promise<PayrollWallet> {
    const wallet = await this.getWalletById(walletId);
    
    wallet.status = WalletStatus.ACTIVE;
    wallet.kycVerified = true;
    wallet.verifiedAt = new Date();
    wallet.verifiedBy = verifiedBy;

    return await this.walletRepo.save(wallet);
  }

  async suspendWallet(walletId: string): Promise<PayrollWallet> {
    const wallet = await this.getWalletById(walletId);
    wallet.status = WalletStatus.SUSPENDED;
    return await this.walletRepo.save(wallet);
  }

  private generateWalletNumber(): string {
    return `TRBW${Date.now()}${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;
  }

  async getWalletsByOrganization(organizationId: string): Promise<PayrollWallet[]> {
    return await this.walletRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}
