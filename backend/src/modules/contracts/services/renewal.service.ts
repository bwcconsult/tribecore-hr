import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Renewal, RenewalStatus, RenewalDecision } from '../entities/renewal.entity';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { RenewalDecisionDto, PerformanceAnalysisDto } from '../dto/renewal.dto';

@Injectable()
export class RenewalService {
  constructor(
    @InjectRepository(Renewal)
    private renewalRepository: Repository<Renewal>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  /**
   * Create renewal tracking for contract
   */
  async createRenewalTracking(contract: Contract): Promise<Renewal | null> {
    if (!contract.endDate) return null;

    const renewal = this.renewalRepository.create({
      contractId: contract.id,
      renewalDate: new Date(contract.endDate),
      noticeByDate: contract.noticeDate ? new Date(contract.noticeDate) : this.calculateNoticeDate(contract.endDate),
      status: RenewalStatus.NOT_DUE,
      decision: RenewalDecision.PENDING,
    });

    return await this.renewalRepository.save(renewal);
  }

  /**
   * Get renewal radar (all upcoming renewals)
   */
  async getRenewalRadar(organizationId: string) {
    const contracts = await this.contractRepository.find({
      where: { organizationId, status: ContractStatus.ACTIVE },
      relations: ['renewals', 'owner'],
    });

    const renewals = await this.renewalRepository.find({
      where: { decision: RenewalDecision.PENDING },
      relations: ['contract'],
      order: { renewalDate: 'ASC' },
    });

    return renewals.map((r) => ({
      ...r,
      daysUntilRenewal: Math.ceil(
        (new Date(r.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
      daysUntilNotice: Math.ceil(
        (new Date(r.noticeByDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  /**
   * Make renewal decision
   */
  async makeDecision(
    renewalId: string,
    decidedBy: string,
    decision: RenewalDecisionDto,
  ): Promise<Renewal> {
    const renewal = await this.renewalRepository.findOne({
      where: { id: renewalId },
      relations: ['contract'],
    });

    if (!renewal) {
      throw new NotFoundException('Renewal not found');
    }

    renewal.decision = decision.decision;
    renewal.decidedBy = decidedBy;
    renewal.decidedAt = new Date();
    renewal.decisionReason = decision.decisionReason;
    renewal.proposedValue = decision.proposedValue;
    renewal.proposedCurrency = decision.proposedCurrency;
    renewal.proposedTerm = decision.proposedTerm;
    renewal.proposedTerms = decision.proposedTerms;
    renewal.status = RenewalStatus.COMPLETED;

    const updated = await this.renewalRepository.save(renewal);

    // Handle decision
    if (decision.decision === RenewalDecision.RENEW || decision.decision === RenewalDecision.RENEGOTIATE) {
      await this.handleRenew(renewal.contract);
    } else if (decision.decision === RenewalDecision.TERMINATE) {
      await this.handleTerminate(renewal.contract);
    }

    return updated;
  }

  /**
   * Add performance analysis
   */
  async addPerformanceAnalysis(
    renewalId: string,
    analysis: PerformanceAnalysisDto,
  ): Promise<Renewal> {
    const renewal = await this.renewalRepository.findOne({ where: { id: renewalId } });
    if (!renewal) {
      throw new NotFoundException('Renewal not found');
    }

    renewal.performanceScore = analysis.performanceScore;
    renewal.performanceMetrics = analysis.performanceMetrics;
    renewal.performanceNotes = analysis.performanceNotes;

    return await this.renewalRepository.save(renewal);
  }

  /**
   * Check and update renewal statuses
   */
  async updateRenewalStatuses(): Promise<void> {
    const renewals = await this.renewalRepository.find({
      where: { decision: RenewalDecision.PENDING },
    });

    for (const renewal of renewals) {
      const daysUntilRenewal = Math.ceil(
        (new Date(renewal.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      let newStatus = renewal.status;
      if (daysUntilRenewal <= 0) {
        newStatus = RenewalStatus.OVERDUE;
      } else if (daysUntilRenewal <= 30) {
        newStatus = RenewalStatus.DUE_30_DAYS;
      } else if (daysUntilRenewal <= 60) {
        newStatus = RenewalStatus.DUE_60_DAYS;
      } else if (daysUntilRenewal <= 90) {
        newStatus = RenewalStatus.DUE_90_DAYS;
      } else if (daysUntilRenewal <= 180) {
        newStatus = RenewalStatus.DUE_180_DAYS;
      }

      if (newStatus !== renewal.status) {
        renewal.status = newStatus;
        await this.renewalRepository.save(renewal);
      }
    }
  }

  /**
   * Handle contract renewal
   */
  private async handleRenew(contract: Contract): Promise<void> {
    contract.status = ContractStatus.RENEWAL_DUE;
    await this.contractRepository.save(contract);
  }

  /**
   * Handle contract termination
   */
  private async handleTerminate(contract: Contract): Promise<void> {
    contract.status = ContractStatus.TERMINATION_DUE;
    await this.contractRepository.save(contract);
  }

  /**
   * Calculate notice date (default 90 days before end)
   */
  private calculateNoticeDate(endDate: Date): Date {
    const noticeDate = new Date(endDate);
    noticeDate.setDate(noticeDate.getDate() - 90);
    return noticeDate;
  }
}
