import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval } from '../entities/approval.entity';
import { ExpenseClaim } from '../entities/expense-claim.entity';
import { ApproveExpenseDto } from '../dto/approve-expense.dto';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { AuditTrailService } from './audit-trail.service';
import { PolicyService } from './policy.service';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
    @InjectRepository(ExpenseClaim)
    private claimRepository: Repository<ExpenseClaim>,
    private auditTrailService: AuditTrailService,
    private policyService: PolicyService,
  ) {}

  async createApprovalChain(claimId: string): Promise<Approval[]> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: ['items'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    // Get required approval levels from policy
    const approvalLevels = await this.policyService.getApprovalLevels(claim);

    // Create approval records for each level
    const approvals: Approval[] = [];

    for (const levelConfig of approvalLevels) {
      const approval = this.approvalRepository.create({
        claimId,
        level: levelConfig.level,
        status: levelConfig.level === 1 ? ApprovalStatus.PENDING : ApprovalStatus.PENDING,
        // approverId would be determined by role/hierarchy logic
        // For now, it will be set when someone with the right role claims it
      });

      approvals.push(approval);
    }

    return this.approvalRepository.save(approvals);
  }

  async getPendingApprovals(approverId: string): Promise<Approval[]> {
    return this.approvalRepository.find({
      where: {
        approverId,
        status: ApprovalStatus.PENDING,
      },
      relations: ['claim', 'claim.employee', 'claim.items'],
      order: { createdAt: 'ASC' },
    });
  }

  async approve(
    approvalId: string,
    approverId: string,
    approveDto: ApproveExpenseDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['claim', 'claim.approvals'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${approvalId} not found`);
    }

    if (approval.approverId !== approverId) {
      throw new BadRequestException('You are not authorized to approve this expense');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('This approval has already been processed');
    }

    // Update approval
    approval.status = approveDto.status;
    approval.comments = approveDto.comments;
    approval.rejectionReason = approveDto.rejectionReason;
    approval.reviewedAt = new Date();
    approval.isOverride = approveDto.isOverride || false;
    approval.overrideJustification = approveDto.overrideJustification;
    approval.ipAddress = ipAddress;
    approval.userAgent = userAgent;

    if (approveDto.status === ApprovalStatus.APPROVED) {
      approval.approvedAt = new Date();
    } else if (approveDto.status === ApprovalStatus.REJECTED) {
      approval.rejectedAt = new Date();
    }

    await this.approvalRepository.save(approval);

    // Update claim status based on approval result
    await this.updateClaimStatus(approval.claim);

    // Audit trail
    await this.auditTrailService.log({
      claimId: approval.claimId,
      userId: approverId,
      action: approveDto.status === ApprovalStatus.APPROVED ? 'APPROVED' : 'REJECTED',
      entity: 'Approval',
      entityId: approvalId,
      newValues: { status: approveDto.status, comments: approveDto.comments },
      ipAddress,
      userAgent,
    });

    return approval;
  }

  private async updateClaimStatus(claim: ExpenseClaim): Promise<void> {
    const approvals = await this.approvalRepository.find({
      where: { claimId: claim.id },
      order: { level: 'ASC' },
    });

    // Check if any approval is rejected
    const hasRejection = approvals.some(a => a.status === ApprovalStatus.REJECTED);
    if (hasRejection) {
      claim.status = ExpenseStatus.REJECTED;
      claim.rejectedAt = new Date();
      await this.claimRepository.save(claim);
      return;
    }

    // Check if all approvals are approved
    const allApproved = approvals.every(a => a.status === ApprovalStatus.APPROVED);
    if (allApproved) {
      claim.status = ExpenseStatus.APPROVED;
      claim.approvedAt = new Date();
      await this.claimRepository.save(claim);
      return;
    }

    // Otherwise, still under review
    claim.status = ExpenseStatus.UNDER_REVIEW;
    await this.claimRepository.save(claim);
  }

  async delegateApproval(
    approvalId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<Approval> {
    const approval = await this.approvalRepository.findOneOrFail({
      where: { id: approvalId },
    });

    if (approval.approverId !== fromUserId) {
      throw new BadRequestException('You can only delegate your own approvals');
    }

    approval.delegatedBy = fromUserId;
    approval.approverId = toUserId;
    approval.delegatedAt = new Date();
    approval.status = ApprovalStatus.DELEGATED;

    return this.approvalRepository.save(approval);
  }

  async getApprovalHistory(claimId: string): Promise<Approval[]> {
    return this.approvalRepository.find({
      where: { claimId },
      relations: ['approver', 'delegator'],
      order: { level: 'ASC', createdAt: 'ASC' },
    });
  }

  async getApprovalStatistics(approverId: string): Promise<any> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.approvalRepository.count({ where: { approverId } }),
      this.approvalRepository.count({ where: { approverId, status: ApprovalStatus.PENDING } }),
      this.approvalRepository.count({ where: { approverId, status: ApprovalStatus.APPROVED } }),
      this.approvalRepository.count({ where: { approverId, status: ApprovalStatus.REJECTED } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
