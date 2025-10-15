import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval, ApprovalStatus, ApproverRole } from '../entities/approval.entity';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { ApprovalDecisionDto } from '../dto/approval-decision.dto';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  /**
   * Build approval route based on contract details and policy
   */
  async buildApprovalRoute(contract: Contract): Promise<Approval[]> {
    const approvals: Partial<Approval>[] = [];
    let step = 1;

    // Always requires legal review
    if (contract.requiresLegalReview || contract.riskScore > 5) {
      approvals.push({
        contractId: contract.id,
        step: step++,
        role: ApproverRole.LEGAL,
        approverId: await this.findApproverByRole(contract.organizationId, ApproverRole.LEGAL),
        status: ApprovalStatus.PENDING,
        isRequired: true,
      });
    }

    // Finance approval for contracts with value
    if (contract.requiresFinanceApproval || (contract.value && contract.value > 10000)) {
      approvals.push({
        contractId: contract.id,
        step: step++,
        role: ApproverRole.FINANCE,
        approverId: await this.findApproverByRole(contract.organizationId, ApproverRole.FINANCE),
        status: ApprovalStatus.PENDING,
        isRequired: true,
      });
    }

    // CISO approval for data/security
    if (contract.requiresCISOApproval || contract.dataCategories?.includes('PII')) {
      approvals.push({
        contractId: contract.id,
        step: step++,
        role: ApproverRole.CISO,
        approverId: await this.findApproverByRole(contract.organizationId, ApproverRole.CISO),
        status: ApprovalStatus.PENDING,
        isRequired: true,
      });
    }

    // DPO approval for data protection
    if (contract.requiresDPOApproval || contract.requiresDPIA) {
      approvals.push({
        contractId: contract.id,
        step: step++,
        role: ApproverRole.DPO,
        approverId: await this.findApproverByRole(contract.organizationId, ApproverRole.DPO),
        status: ApprovalStatus.PENDING,
        isRequired: true,
      });
    }

    // CFO approval for high value contracts
    if (contract.value && contract.value > 100000) {
      approvals.push({
        contractId: contract.id,
        step: step++,
        role: ApproverRole.CFO,
        approverId: await this.findApproverByRole(contract.organizationId, ApproverRole.CFO),
        status: ApprovalStatus.PENDING,
        isRequired: true,
      });
    }

    const created = await this.approvalRepository.save(approvals);
    return created as Approval[];
  }

  /**
   * Get approvals for contract
   */
  async getApprovals(contractId: string): Promise<Approval[]> {
    return await this.approvalRepository.find({
      where: { contractId },
      order: { step: 'ASC' },
      relations: ['approver'],
    });
  }

  /**
   * Make approval decision
   */
  async makeDecision(
    approvalId: string,
    approverId: string,
    decision: ApprovalDecisionDto,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['contract'],
    });

    if (!approval) {
      throw new BadRequestException('Approval not found');
    }

    if (approval.approverId !== approverId) {
      throw new BadRequestException('You are not the approver for this approval');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval already decided');
    }

    approval.status = decision.decision;
    approval.comment = decision.comment;
    approval.decidedAt = new Date();
    approval.delegatedTo = decision.delegatedTo;

    const updated = await this.approvalRepository.save(approval);

    // Check if all approvals complete
    await this.checkApprovalCompletion(approval.contractId);

    return updated;
  }

  /**
   * Check if all approvals are complete
   */
  private async checkApprovalCompletion(contractId: string): Promise<void> {
    const approvals = await this.getApprovals(contractId);
    const allApproved = approvals.every(
      (a) => a.status === ApprovalStatus.APPROVED || !a.isRequired,
    );
    const anyRejected = approvals.some((a) => a.status === ApprovalStatus.REJECTED);

    const contract = await this.contractRepository.findOne({ where: { id: contractId } });
    if (!contract) return;

    if (anyRejected) {
      // Reject contract back to draft
      contract.status = ContractStatus.DRAFT;
      await this.contractRepository.save(contract);
    } else if (allApproved) {
      // Ready for counterparty review
      // Status change handled by contract service
    }
  }

  /**
   * Find approver by role (mock - should query org structure)
   */
  private async findApproverByRole(organizationId: string, role: ApproverRole): Promise<string> {
    // In real implementation, query org structure/user roles
    // For now, return placeholder
    return `approver-${role.toLowerCase()}`;
  }
}
