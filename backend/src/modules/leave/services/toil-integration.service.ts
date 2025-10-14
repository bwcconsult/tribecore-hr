import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TOILBalance } from '../entities/toil-balance.entity';
import { Entitlement } from '../entities/entitlement.entity';
import { AccrualLog } from '../entities/accrual-log.entity';
import { LeaveType } from '../entities/leave-type.entity';

/**
 * TOILIntegrationService
 * Syncs TOIL earnings from Overtime module
 * Manages TOIL balance lifecycle
 */
@Injectable()
export class TOILIntegrationService {
  private readonly logger = new Logger(TOILIntegrationService.name);

  constructor(
    @InjectRepository(TOILBalance)
    private toilBalanceRepo: Repository<TOILBalance>,
    @InjectRepository(Entitlement)
    private entitlementRepo: Repository<Entitlement>,
    @InjectRepository(AccrualLog)
    private accrualLogRepo: Repository<AccrualLog>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
  ) {}

  /**
   * Process TOIL earnings from approved overtime
   * Called by Overtime module when OT is approved
   */
  async processOvertimeToTOIL(
    employeeId: string,
    organizationId: string,
    overtimeMinutes: number,
    overtimeLineId: string,
    overtimeDate: Date,
    conversionRate: number = 1.0, // 1.0 = straight time, 1.5 = time-and-a-half
  ): Promise<{ toilBalance: TOILBalance; entitlement: Entitlement }> {
    // Calculate TOIL minutes earned
    const toilMinutesEarned = Math.round(overtimeMinutes * conversionRate);

    // Get or create TOIL balance
    let toilBalance = await this.toilBalanceRepo.findOne({
      where: { employeeId, organizationId },
    });

    if (!toilBalance) {
      toilBalance = this.toilBalanceRepo.create({
        employeeId,
        organizationId,
        minutesEarned: 0,
        minutesSpent: 0,
        minutesExpired: 0,
        minutesAvailable: 0,
        transactions: [],
        conversionRate,
      });
    }

    // Get TOIL leave type to determine expiry
    const toilLeaveType = await this.leaveTypeRepo.findOne({
      where: { organizationId, code: 'TOIL', isActive: true },
    });

    const expiryDays = toilLeaveType?.expiryDays || 90;
    const expiryDate = new Date(overtimeDate);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Add TOIL transaction
    toilBalance.earn(toilMinutesEarned, overtimeLineId, expiryDate);
    toilBalance = await this.toilBalanceRepo.save(toilBalance);

    // Update entitlement
    let entitlement = await this.entitlementRepo.findOne({
      where: {
        employeeId,
        organizationId,
        leaveTypeId: toilLeaveType?.id,
      },
    });

    if (!entitlement && toilLeaveType) {
      // Create entitlement for TOIL
      entitlement = this.entitlementRepo.create({
        employeeId,
        organizationId,
        leaveTypeId: toilLeaveType.id,
        periodStart: new Date(new Date().getFullYear(), 0, 1),
        periodEnd: new Date(new Date().getFullYear(), 11, 31),
        minutesEntitled: 0, // TOIL has no base entitlement
        minutesAccrued: toilMinutesEarned,
        minutesAvailable: toilMinutesEarned,
        ftePercentage: 1.0,
      });
    } else if (entitlement) {
      entitlement.minutesAccrued += toilMinutesEarned;
      entitlement.recalculateAvailable();
    }

    if (entitlement) {
      entitlement = await this.entitlementRepo.save(entitlement);

      // Create accrual log
      await this.accrualLogRepo.save(
        this.accrualLogRepo.create({
          employeeId,
          organizationId,
          leaveTypeId: toilLeaveType.id,
          period: overtimeDate,
          minutesAdded: toilMinutesEarned,
          ftePercentage: 1.0,
          source: 'TOIL_EARNED',
          processedBy: 'SYSTEM',
          notes: `TOIL earned from overtime: ${overtimeLineId}`,
          calculation: {
            overtimeMinutes,
            conversionRate,
            toilMinutes: toilMinutesEarned,
            expiryDate: expiryDate.toISOString(),
          },
        }),
      );
    }

    this.logger.log(
      `Earned ${(toilMinutesEarned / 60).toFixed(2)}h TOIL for employee ${employeeId} (OT: ${overtimeLineId})`,
    );

    return { toilBalance, entitlement };
  }

  /**
   * Spend TOIL when leave is approved
   * Called by LeaveRequest approval
   */
  async spendTOIL(
    employeeId: string,
    organizationId: string,
    minutesToSpend: number,
    leaveRequestId: string,
  ): Promise<boolean> {
    const toilBalance = await this.toilBalanceRepo.findOne({
      where: { employeeId, organizationId },
    });

    if (!toilBalance) {
      this.logger.warn(`No TOIL balance found for employee ${employeeId}`);
      return false;
    }

    const success = toilBalance.spend(minutesToSpend, leaveRequestId);
    
    if (success) {
      await this.toilBalanceRepo.save(toilBalance);
      
      this.logger.log(
        `Spent ${(minutesToSpend / 60).toFixed(2)}h TOIL for employee ${employeeId}`,
      );
    } else {
      this.logger.warn(
        `Insufficient TOIL balance for employee ${employeeId}: needed ${minutesToSpend}, available ${toilBalance.minutesAvailable}`,
      );
    }

    return success;
  }

  /**
   * Return TOIL when leave is cancelled
   */
  async returnTOIL(
    employeeId: string,
    organizationId: string,
    minutesToReturn: number,
    leaveRequestId: string,
  ): Promise<void> {
    const toilBalance = await this.toilBalanceRepo.findOne({
      where: { employeeId, organizationId },
    });

    if (!toilBalance) return;

    // Find the spend transaction and remove it
    const spendTransaction = toilBalance.transactions.find(
      t => t.type === 'SPENT' && t.source === leaveRequestId,
    );

    if (spendTransaction) {
      toilBalance.minutesSpent -= spendTransaction.minutes;
      toilBalance.transactions = toilBalance.transactions.filter(
        t => !(t.type === 'SPENT' && t.source === leaveRequestId),
      );
      toilBalance.minutesAvailable = toilBalance.minutesEarned - toilBalance.minutesSpent - toilBalance.minutesExpired;
      
      await this.toilBalanceRepo.save(toilBalance);
      
      this.logger.log(
        `Returned ${(minutesToReturn / 60).toFixed(2)}h TOIL for employee ${employeeId}`,
      );
    }
  }

  /**
   * Expire old TOIL (scheduled job)
   */
  async expireOldTOIL(): Promise<{ processed: number; totalExpired: number }> {
    const balances = await this.toilBalanceRepo.find({
      where: { isActive: true },
    });

    let processed = 0;
    let totalExpired = 0;

    for (const balance of balances) {
      const expired = balance.expireOld();
      
      if (expired > 0) {
        await this.toilBalanceRepo.save(balance);
        
        // Update entitlement
        const toilLeaveType = await this.leaveTypeRepo.findOne({
          where: { organizationId: balance.organizationId, code: 'TOIL' },
        });

        if (toilLeaveType) {
          const entitlement = await this.entitlementRepo.findOne({
            where: {
              employeeId: balance.employeeId,
              leaveTypeId: toilLeaveType.id,
            },
          });

          if (entitlement) {
            entitlement.minutesAccrued -= expired;
            entitlement.recalculateAvailable();
            await this.entitlementRepo.save(entitlement);
          }
        }

        processed++;
        totalExpired += expired;
        
        this.logger.warn(
          `Expired ${(expired / 60).toFixed(2)}h TOIL for employee ${balance.employeeId}`,
        );
      }
    }

    this.logger.log(
      `TOIL expiry job: processed ${processed} employees, expired ${(totalExpired / 60).toFixed(2)}h total`,
    );

    return { processed, totalExpired };
  }

  /**
   * Get TOIL balance summary for employee
   */
  async getTOILSummary(employeeId: string, organizationId: string) {
    const balance = await this.toilBalanceRepo.findOne({
      where: { employeeId, organizationId },
    });

    if (!balance) {
      return {
        earned: 0,
        spent: 0,
        expired: 0,
        available: 0,
        expiringSoon: 0,
        nextExpiryDate: null,
        transactions: [],
      };
    }

    // Calculate expiring soon (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const expiringSoon = balance.transactions
      .filter(t => t.type === 'EARNED' && t.expiryDate)
      .filter(t => new Date(t.expiryDate) < thirtyDaysFromNow && new Date(t.expiryDate) > now)
      .reduce((sum, t) => sum + t.minutes, 0);

    const nextExpiry = balance.transactions
      .filter(t => t.type === 'EARNED' && t.expiryDate && new Date(t.expiryDate) > now)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];

    return {
      earned: balance.minutesEarned / 60,
      spent: balance.minutesSpent / 60,
      expired: balance.minutesExpired / 60,
      available: balance.minutesAvailable / 60,
      expiringSoon: expiringSoon / 60,
      nextExpiryDate: nextExpiry?.expiryDate || null,
      transactions: balance.transactions.slice(-10), // Last 10 transactions
    };
  }

  /**
   * Sync TOIL balances with entitlements (reconciliation)
   */
  async reconcileTOILBalances(organizationId: string): Promise<{
    processed: number;
    discrepancies: number;
  }> {
    const balances = await this.toilBalanceRepo.find({
      where: { organizationId },
    });

    const toilLeaveType = await this.leaveTypeRepo.findOne({
      where: { organizationId, code: 'TOIL' },
    });

    if (!toilLeaveType) {
      this.logger.warn(`TOIL leave type not found for org ${organizationId}`);
      return { processed: 0, discrepancies: 0 };
    }

    let processed = 0;
    let discrepancies = 0;

    for (const balance of balances) {
      const entitlement = await this.entitlementRepo.findOne({
        where: {
          employeeId: balance.employeeId,
          organizationId,
          leaveTypeId: toilLeaveType.id,
        },
      });

      if (entitlement) {
        const balanceMinutes = balance.minutesAvailable;
        const entitlementMinutes = entitlement.minutesAvailable;

        if (balanceMinutes !== entitlementMinutes) {
          this.logger.warn(
            `TOIL discrepancy for ${balance.employeeId}: Balance=${balanceMinutes}, Entitlement=${entitlementMinutes}`,
          );
          
          // Sync entitlement to match balance (balance is source of truth)
          entitlement.minutesAccrued = balance.minutesAvailable;
          entitlement.recalculateAvailable();
          await this.entitlementRepo.save(entitlement);
          
          discrepancies++;
        }
      }

      processed++;
    }

    this.logger.log(
      `TOIL reconciliation: processed ${processed}, found ${discrepancies} discrepancies`,
    );

    return { processed, discrepancies };
  }
}
