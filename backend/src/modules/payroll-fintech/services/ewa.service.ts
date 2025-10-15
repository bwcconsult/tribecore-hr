import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EWARequest, EWARequestStatus, RepaymentMethod } from '../entities/ewa-request.entity';
import { FintechConfig } from '../entities/fintech-config.entity';
import { CreateEWARequestDto, ApproveEWARequestDto, RejectEWARequestDto } from '../dto/ewa-request.dto';
import { WalletService } from './wallet.service';
import { TransactionCategory } from '../entities/transaction.entity';

@Injectable()
export class EWAService {
  constructor(
    @InjectRepository(EWARequest)
    private ewaRepo: Repository<EWARequest>,
    @InjectRepository(FintechConfig)
    private configRepo: Repository<FintechConfig>,
    private walletService: WalletService,
  ) {}

  async createEWARequest(dto: CreateEWARequestDto): Promise<EWARequest> {
    const config = await this.getOrganizationConfig(dto.organizationId);

    if (!config.ewaEnabled) {
      throw new BadRequestException('Earned Wage Access is not enabled for your organization');
    }

    // Get employee wallet
    const wallet = await this.walletService.getWalletByEmployee(dto.employeeId);

    // Calculate earned wages
    const calculation = await this.calculateEarnedWages(dto.employeeId, dto.organizationId);

    // Validate request amount
    if (dto.requestedAmount > calculation.availableForAccess) {
      throw new BadRequestException(
        `Requested amount exceeds available earned wages (${calculation.availableForAccess})`
      );
    }

    if (dto.requestedAmount < (config.ewaMinAmount || 10)) {
      throw new BadRequestException(`Minimum EWA amount is ${config.ewaMinAmount || 10}`);
    }

    if (config.ewaMaxAmount && dto.requestedAmount > config.ewaMaxAmount) {
      throw new BadRequestException(`Maximum EWA amount is ${config.ewaMaxAmount}`);
    }

    // Check monthly request limit
    const monthlyRequests = await this.getMonthlyRequestCount(dto.employeeId);
    if (monthlyRequests >= config.ewaMaxRequestsPerMonth) {
      throw new BadRequestException(`Monthly EWA request limit reached (${config.ewaMaxRequestsPerMonth})`);
    }

    // Calculate fees
    const fee = this.calculateFee(dto.requestedAmount, config);
    const totalRepayment = dto.requestedAmount + fee;

    // Determine if auto-approval
    const shouldAutoApprove = 
      config.autoApproveEWA && 
      (!config.autoApproveThreshold || dto.requestedAmount <= config.autoApproveThreshold);

    const ewaRequest = this.ewaRepo.create({
      ...dto,
      walletId: wallet.id,
      status: shouldAutoApprove ? EWARequestStatus.APPROVED : EWARequestStatus.PENDING,
      earnedSoFar: calculation.baseEarnings,
      maxEligibleAmount: calculation.availableForAccess,
      fee,
      feePercentage: config.ewaFeePercentage,
      totalRepayment,
      requestDate: new Date(),
      approvalDate: shouldAutoApprove ? new Date() : null,
      approvedBy: shouldAutoApprove ? 'SYSTEM_AUTO_APPROVE' : null,
      approvedAmount: shouldAutoApprove ? dto.requestedAmount : null,
      calculation,
      isAutoApproved: shouldAutoApprove,
      repaymentMethod: dto.repaymentMethod || RepaymentMethod.NEXT_PAYROLL,
    });

    const savedRequest = await this.ewaRepo.save(ewaRequest);

    // If auto-approved, disburse immediately
    if (shouldAutoApprove) {
      await this.disburseEWA(savedRequest.id);
    }

    return savedRequest;
  }

  async approveEWARequest(requestId: string, dto: ApproveEWARequestDto): Promise<EWARequest> {
    const request = await this.getRequestById(requestId);

    if (request.status !== EWARequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    if (dto.approvedAmount > request.maxEligibleAmount) {
      throw new BadRequestException('Approved amount exceeds eligible amount');
    }

    // Recalculate fees for approved amount
    const config = await this.getOrganizationConfig(request.organizationId);
    const fee = this.calculateFee(dto.approvedAmount, config);

    request.status = EWARequestStatus.APPROVED;
    request.approvedAmount = dto.approvedAmount;
    request.fee = fee;
    request.totalRepayment = dto.approvedAmount + fee;
    request.approvalDate = new Date();
    request.approvedBy = dto.approvedBy || 'SYSTEM';

    const savedRequest = await this.ewaRepo.save(request);

    // Disburse funds
    await this.disburseEWA(savedRequest.id);

    return savedRequest;
  }

  async rejectEWARequest(requestId: string, dto: RejectEWARequestDto): Promise<EWARequest> {
    const request = await this.getRequestById(requestId);

    if (request.status !== EWARequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    request.status = EWARequestStatus.REJECTED;
    request.rejectionReason = dto.rejectionReason;

    return await this.ewaRepo.save(request);
  }

  async disburseEWA(requestId: string): Promise<EWARequest> {
    const request = await this.getRequestById(requestId);

    if (request.status !== EWARequestStatus.APPROVED) {
      throw new BadRequestException('Only approved requests can be disbursed');
    }

    const disbursementAmount = request.approvedAmount!;

    // Credit wallet
    await this.walletService.creditWallet(
      request.walletId,
      disbursementAmount,
      TransactionCategory.EARNED_WAGE_ACCESS,
      `EWA Request #${request.id.substring(0, 8)} - Instant Access`,
      {
        ewaRequestId: request.id,
        fee: request.fee,
        totalRepayment: request.totalRepayment,
      }
    );

    request.status = EWARequestStatus.DISBURSED;
    request.disbursedAmount = disbursementAmount;
    request.disbursementDate = new Date();
    request.expectedRepaymentDate = this.calculateRepaymentDate();

    return await this.ewaRepo.save(request);
  }

  async getRequestById(id: string): Promise<EWARequest> {
    const request = await this.ewaRepo.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('EWA request not found');
    }
    return request;
  }

  async getEmployeeRequests(employeeId: string): Promise<EWARequest[]> {
    return await this.ewaRepo.find({
      where: { employeeId },
      order: { requestDate: 'DESC' },
    });
  }

  async getOrganizationRequests(
    organizationId: string,
    status?: EWARequestStatus
  ): Promise<EWARequest[]> {
    const where: any = { organizationId };
    if (status) {
      where.status = status;
    }

    return await this.ewaRepo.find({
      where,
      order: { requestDate: 'DESC' },
    });
  }

  private async calculateEarnedWages(employeeId: string, organizationId: string) {
    // This is a simplified calculation. In production, this would integrate with
    // attendance/time tracking and payroll systems
    
    // Mock data for demonstration
    const workDaysInPeriod = 20;
    const daysWorked = 15;
    const hourlyRate = 25;
    const hoursWorked = 120;
    const baseEarnings = hourlyRate * hoursWorked;
    const deductions = 200;
    const netEligible = baseEarnings - deductions;
    
    const config = await this.getOrganizationConfig(organizationId);
    const accessLimit = config.ewaMaxPercentage / 100;
    
    const previousAdvances = await this.ewaRepo.sum('disbursedAmount', {
      employeeId,
      status: EWARequestStatus.DISBURSED,
      // Only count current pay period advances
    }) || 0;
    
    const availableForAccess = (netEligible * accessLimit) - previousAdvances;

    return {
      workDaysInPeriod,
      daysWorked,
      hourlyRate,
      hoursWorked,
      baseEarnings,
      deductions,
      netEligible,
      accessLimit,
      previousAdvances,
      availableForAccess: Math.max(0, availableForAccess),
    };
  }

  private calculateFee(amount: number, config: FintechConfig): number {
    const percentageFee = (amount * config.ewaFeePercentage) / 100;
    const fixedFee = config.ewaFixedFee || 0;
    return Math.round((percentageFee + fixedFee) * 100) / 100;
  }

  private async getOrganizationConfig(organizationId: string): Promise<FintechConfig> {
    let config = await this.configRepo.findOne({ where: { organizationId } });
    
    if (!config) {
      // Create default config
      config = this.configRepo.create({
        organizationId,
        ewaEnabled: true,
        ewaMaxPercentage: 50,
        ewaFeePercentage: 2.5,
        ewaMinDaysWorked: 1,
        ewaMaxRequestsPerMonth: 3,
        autoApproveEWA: true,
        autoApproveThreshold: 500,
      });
      await this.configRepo.save(config);
    }

    return config;
  }

  private async getMonthlyRequestCount(employeeId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return await this.ewaRepo.count({
      where: {
        employeeId,
        requestDate: startOfMonth as any, // Would use MoreThanOrEqual in real implementation
      },
    });
  }

  private calculateRepaymentDate(): Date {
    // Typically next payday - this is simplified
    const nextPayday = new Date();
    nextPayday.setDate(nextPayday.getDate() + 14); // Assuming bi-weekly payroll
    return nextPayday;
  }

  async getEWAStats(organizationId: string) {
    const requests = await this.getOrganizationRequests(organizationId);

    const totalRequests = requests.length;
    const pending = requests.filter(r => r.status === EWARequestStatus.PENDING).length;
    const approved = requests.filter(r => r.status === EWARequestStatus.APPROVED).length;
    const disbursed = requests.filter(r => r.status === EWARequestStatus.DISBURSED).length;
    const rejected = requests.filter(r => r.status === EWARequestStatus.REJECTED).length;

    const totalDisbursed = requests
      .filter(r => r.status === EWARequestStatus.DISBURSED)
      .reduce((sum, r) => sum + Number(r.disbursedAmount || 0), 0);

    const totalFees = requests
      .filter(r => r.status === EWARequestStatus.DISBURSED)
      .reduce((sum, r) => sum + Number(r.fee || 0), 0);

    return {
      totalRequests,
      pending,
      approved,
      disbursed,
      rejected,
      totalDisbursed,
      totalFees,
      averageRequestAmount: totalRequests > 0 ? totalDisbursed / disbursed : 0,
      approvalRate: totalRequests > 0 ? ((approved + disbursed) / totalRequests) * 100 : 0,
    };
  }
}
