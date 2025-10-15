import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstantPayRequest, InstantPayStatus, InstantPayType } from '../entities/instant-pay-request.entity';
import { PaymentRail, PaymentRailStatus } from '../entities/payment-rail.entity';
import { FintechConfig } from '../entities/fintech-config.entity';
import { CreateInstantPayRequestDto } from '../dto/instant-pay-request.dto';
import { WalletService } from './wallet.service';
import { TransactionCategory } from '../entities/transaction.entity';

@Injectable()
export class InstantPayService {
  constructor(
    @InjectRepository(InstantPayRequest)
    private instantPayRepo: Repository<InstantPayRequest>,
    @InjectRepository(PaymentRail)
    private railRepo: Repository<PaymentRail>,
    @InjectRepository(FintechConfig)
    private configRepo: Repository<FintechConfig>,
    private walletService: WalletService,
  ) {}

  async createInstantPayRequest(dto: CreateInstantPayRequestDto): Promise<InstantPayRequest> {
    const config = await this.getOrganizationConfig(dto.organizationId);

    if (!config.instantPayEnabled) {
      throw new BadRequestException('Instant Pay is not enabled for your organization');
    }

    // Get employee wallet
    const wallet = await this.walletService.getWalletByEmployee(dto.employeeId);

    // Check if wallet has sufficient balance
    if (Number(wallet.availableBalance) < dto.requestedAmount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Select appropriate payment rail
    const paymentRail = await this.selectPaymentRail(
      dto.organizationId,
      dto.payType || InstantPayType.INSTANT,
      wallet.currency
    );

    // Calculate fees
    const feeBreakdown = this.calculateInstantPayFees(dto.requestedAmount, dto.payType || InstantPayType.INSTANT, config, paymentRail);
    const netAmount = dto.requestedAmount - feeBreakdown.total;

    // Calculate expected delivery time
    const expectedDeliveryTime = this.calculateDeliveryTime(dto.payType || InstantPayType.INSTANT, paymentRail);

    const request = this.instantPayRepo.create({
      ...dto,
      walletId: wallet.id,
      payType: dto.payType || InstantPayType.INSTANT,
      status: InstantPayStatus.PENDING,
      requestedAt: new Date(),
      expectedDeliveryTime,
      fee: feeBreakdown.total,
      netAmount,
      paymentRailId: paymentRail.id,
      feeBreakdown,
      currency: dto.currency || wallet.currency,
    });

    const savedRequest = await this.instantPayRepo.save(request);

    // Process payment immediately
    await this.processInstantPay(savedRequest.id);

    return savedRequest;
  }

  async processInstantPay(requestId: string): Promise<InstantPayRequest> {
    const request = await this.getRequestById(requestId);

    if (request.status !== InstantPayStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be processed');
    }

    try {
      request.status = InstantPayStatus.PROCESSING;
      await this.instantPayRepo.save(request);

      // Debit wallet
      const transaction = await this.walletService.debitWallet(
        request.walletId,
        request.requestedAmount,
        request.fee!,
        TransactionCategory.INSTANT_PAY,
        `Instant Pay to ${request.destinationAccount?.type || 'Account'}`,
        {
          instantPayRequestId: request.id,
          payType: request.payType,
          destinationAccount: request.destinationAccount,
        }
      );

      // In production, this would integrate with actual payment processor
      // For now, we'll simulate instant success
      await this.simulatePaymentProcessing(request.payType);

      request.status = InstantPayStatus.COMPLETED;
      request.transactionId = transaction.id;
      request.processedAmount = request.requestedAmount;
      request.processedAt = new Date();
      request.completedAt = new Date();

      return await this.instantPayRepo.save(request);

    } catch (error) {
      request.status = InstantPayStatus.FAILED;
      request.failureReason = error?.message || 'Unknown error occurred';
      request.retryCount += 1;
      await this.instantPayRepo.save(request);
      throw error;
    }
  }

  async retryFailedPayment(requestId: string): Promise<InstantPayRequest> {
    const request = await this.getRequestById(requestId);

    if (request.status !== InstantPayStatus.FAILED) {
      throw new BadRequestException('Only failed requests can be retried');
    }

    if (request.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts reached');
    }

    request.status = InstantPayStatus.PENDING;
    request.failureReason = '';
    await this.instantPayRepo.save(request);

    return await this.processInstantPay(requestId);
  }

  async getRequestById(id: string): Promise<InstantPayRequest> {
    const request = await this.instantPayRepo.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Instant pay request not found');
    }
    return request;
  }

  async getEmployeeRequests(employeeId: string): Promise<InstantPayRequest[]> {
    return await this.instantPayRepo.find({
      where: { employeeId },
      order: { requestedAt: 'DESC' },
    });
  }

  async getOrganizationRequests(
    organizationId: string,
    status?: InstantPayStatus
  ): Promise<InstantPayRequest[]> {
    const where: any = { organizationId };
    if (status) {
      where.status = status;
    }

    return await this.instantPayRepo.find({
      where,
      order: { requestedAt: 'DESC' },
    });
  }

  private async selectPaymentRail(
    organizationId: string,
    payType: InstantPayType,
    currency: string
  ): Promise<PaymentRail> {
    const rails = await this.railRepo.find({
      where: {
        organizationId,
        status: PaymentRailStatus.ACTIVE,
      },
    });

    if (rails.length === 0) {
      throw new BadRequestException('No active payment rails configured');
    }

    // Filter by currency support
    const compatibleRails = rails.filter(rail => 
      rail.supportedCurrencies.includes(currency)
    );

    if (compatibleRails.length === 0) {
      throw new BadRequestException(`No payment rail supports currency: ${currency}`);
    }

    // Prefer instant rails for instant payments
    if (payType === InstantPayType.INSTANT) {
      const instantRails = compatibleRails.filter(rail => rail.isInstant);
      if (instantRails.length > 0) {
        return instantRails[0];
      }
    }

    // Return default or highest success rate
    const defaultRail = compatibleRails.find(rail => rail.isDefault);
    if (defaultRail) {
      return defaultRail;
    }

    // Sort by success rate
    compatibleRails.sort((a, b) => (b.successRate || 0) - (a.successRate || 0));
    return compatibleRails[0];
  }

  private calculateInstantPayFees(
    amount: number,
    payType: InstantPayType,
    config: FintechConfig,
    rail: PaymentRail
  ) {
    const baseFee = ((amount * config.instantPayFeePercentage) / 100) || 0;
    
    let speedFee = 0;
    if (payType === InstantPayType.INSTANT) {
      speedFee = amount * 0.01; // 1% for instant
    } else if (payType === InstantPayType.SAME_DAY) {
      speedFee = amount * 0.005; // 0.5% for same day
    }

    const processingFee = Number(rail.fixedFee) || 0;
    const total = Math.round((baseFee + speedFee + processingFee) * 100) / 100;

    return {
      baseFee: Math.round(baseFee * 100) / 100,
      speedFee: Math.round(speedFee * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      total,
    };
  }

  private calculateDeliveryTime(payType: InstantPayType, rail: PaymentRail): Date {
    const now = new Date();
    
    switch (payType) {
      case InstantPayType.INSTANT:
        now.setMinutes(now.getMinutes() + (rail.processingTimeMinutes || 5));
        break;
      case InstantPayType.SAME_DAY:
        now.setHours(now.getHours() + 6);
        break;
      case InstantPayType.NEXT_DAY:
        now.setDate(now.getDate() + 1);
        break;
    }

    return now;
  }

  private async simulatePaymentProcessing(payType: InstantPayType): Promise<void> {
    // Simulate processing delay
    const delay = payType === InstantPayType.INSTANT ? 1000 : 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async getOrganizationConfig(organizationId: string): Promise<FintechConfig> {
    let config = await this.configRepo.findOne({ where: { organizationId } });
    
    if (!config) {
      config = this.configRepo.create({
        organizationId,
        instantPayEnabled: true,
        instantPayFeePercentage: 1.5,
        instantPayFixedFee: 0.5,
      });
      await this.configRepo.save(config);
    }

    return config;
  }

  async getInstantPayStats(organizationId: string) {
    const requests = await this.getOrganizationRequests(organizationId);

    const totalRequests = requests.length;
    const completed = requests.filter(r => r.status === InstantPayStatus.COMPLETED).length;
    const processing = requests.filter(r => r.status === InstantPayStatus.PROCESSING).length;
    const failed = requests.filter(r => r.status === InstantPayStatus.FAILED).length;

    const totalProcessed = requests
      .filter(r => r.status === InstantPayStatus.COMPLETED)
      .reduce((sum, r) => sum + Number(r.processedAmount || 0), 0);

    const totalFees = requests
      .filter(r => r.status === InstantPayStatus.COMPLETED)
      .reduce((sum, r) => sum + Number(r.fee || 0), 0);

    const avgProcessingTime = this.calculateAverageProcessingTime(requests);

    return {
      totalRequests,
      completed,
      processing,
      failed,
      totalProcessed,
      totalFees,
      successRate: totalRequests > 0 ? (completed / totalRequests) * 100 : 0,
      avgProcessingTime,
      byPayType: this.groupByPayType(requests),
    };
  }

  private calculateAverageProcessingTime(requests: InstantPayRequest[]): number {
    const completedRequests = requests.filter(
      r => r.status === InstantPayStatus.COMPLETED && r.requestedAt && r.completedAt
    );

    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, r) => {
      const start = new Date(r.requestedAt).getTime();
      const end = new Date(r.completedAt!).getTime();
      return sum + (end - start);
    }, 0);

    return Math.round(totalTime / completedRequests.length / 1000 / 60); // Minutes
  }

  private groupByPayType(requests: InstantPayRequest[]) {
    const grouped: Record<string, number> = {};
    requests.forEach(r => {
      grouped[r.payType] = (grouped[r.payType] || 0) + 1;
    });
    return grouped;
  }
}
