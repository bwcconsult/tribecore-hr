import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApproval } from '../entities/leave-approval.entity';
import { LeaveRequest } from '../entities/leave-request.entity';

interface ApprovalWorkflowConfig {
  default: string[]; // ['LINE_MANAGER', 'ROSTER_OWNER?', 'HR_IF_SPECIAL']
  thresholds: Array<{
    type: string; // AL, SICK
    hoursGreaterThan?: number;
    daysGreaterThan?: number;
    add: string; // DEPARTMENT_HEAD, BUDGET_OWNER
  }>;
  autoApprove?: {
    maxHours: number;
    minNoticeDays: number;
    requiresCoverageOK: boolean;
  };
  slaHours?: {
    [step: string]: number; // LINE_MANAGER: 48, DEPARTMENT_HEAD: 24
  };
}

/**
 * ApprovalWorkflowService
 * Manages multi-level approval workflows with SLA tracking
 * Supports conditional steps, auto-approval, escalation, delegation
 */
@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);

  constructor(
    @InjectRepository(LeaveApproval)
    private approvalRepo: Repository<LeaveApproval>,
    @InjectRepository(LeaveRequest)
    private requestRepo: Repository<LeaveRequest>,
  ) {}

  /**
   * Build approval chain for a leave request
   */
  async buildApprovalChain(
    leaveRequest: LeaveRequest,
    workflowConfig: ApprovalWorkflowConfig,
    employeeData: {
      managerId: string;
      departmentHeadId?: string;
      rosterOwnerId?: string;
      hasRosterConflict?: boolean;
    },
  ): Promise<LeaveApproval[]> {
    const steps: string[] = [...workflowConfig.default];

    // Check thresholds - add extra approval steps if needed
    const hours = leaveRequest.totalMinutesRequested / 60;
    for (const threshold of workflowConfig.thresholds || []) {
      if (threshold.hoursGreaterThan && hours > threshold.hoursGreaterThan) {
        if (!steps.includes(threshold.add)) {
          steps.push(threshold.add);
        }
      }
    }

    // Build approval records
    const approvals: LeaveApproval[] = [];
    let stepNumber = 1;

    for (const stepName of steps) {
      // Handle conditional steps
      const isConditional = stepName.endsWith('?');
      const cleanStepName = isConditional ? stepName.slice(0, -1) : stepName;

      // Check if conditional step should be included
      if (isConditional) {
        if (cleanStepName === 'ROSTER_OWNER' && !employeeData.hasRosterConflict) {
          continue; // Skip roster owner if no conflict
        }
      }

      // Determine approver
      let approverId: string | null = null;
      let approverRole = cleanStepName;

      switch (cleanStepName) {
        case 'LINE_MANAGER':
          approverId = employeeData.managerId;
          break;
        case 'DEPARTMENT_HEAD':
          approverId = employeeData.departmentHeadId || employeeData.managerId;
          break;
        case 'ROSTER_OWNER':
          approverId = employeeData.rosterOwnerId || employeeData.managerId;
          break;
        case 'HR_IF_SPECIAL':
          // Only add if special circumstance (e.g., negative balance, compliance issue)
          if (!leaveRequest.meetsComplianceRules || leaveRequest.causesNegativeBalance) {
            approverId = 'HR_TEAM'; // Would be actual HR user/group
          } else {
            continue; // Skip this step
          }
          break;
        case 'BUDGET_OWNER':
          approverId = 'BUDGET_TEAM';
          break;
      }

      if (!approverId) {
        this.logger.warn(`No approver found for step ${cleanStepName}`);
        continue;
      }

      // Get SLA hours for this step
      const slaHours = workflowConfig.slaHours?.[cleanStepName] || 48;
      const dueAt = new Date();
      dueAt.setHours(dueAt.getHours() + slaHours);

      const approval = this.approvalRepo.create({
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employeeId,
        organizationId: leaveRequest.organizationId,
        step: stepNumber,
        stepName: cleanStepName,
        isConditional,
        approverId,
        approverRole,
        decision: stepNumber === 1 ? 'PENDING' : 'PENDING', // First step is active
        slaHours,
        dueAt,
        actions: [],
      });

      approvals.push(approval);
      stepNumber++;
    }

    // Save all approval records
    const saved = await this.approvalRepo.save(approvals);

    this.logger.log(
      `Created ${saved.length} approval steps for request ${leaveRequest.id}`,
    );

    return saved;
  }

  /**
   * Check if request should be auto-approved
   */
  canAutoApprove(
    leaveRequest: LeaveRequest,
    config: ApprovalWorkflowConfig,
    coverageOK: boolean,
  ): { canAutoApprove: boolean; reason?: string } {
    if (!config.autoApprove) {
      return { canAutoApprove: false };
    }

    const hours = leaveRequest.totalMinutesRequested / 60;

    // Check hours threshold
    if (hours > config.autoApprove.maxHours) {
      return { canAutoApprove: false };
    }

    // Check notice period
    if (leaveRequest.noticeDaysGiven < config.autoApprove.minNoticeDays) {
      return { canAutoApprove: false };
    }

    // Check coverage
    if (config.autoApprove.requiresCoverageOK && !coverageOK) {
      return { canAutoApprove: false };
    }

    // Check compliance
    if (!leaveRequest.meetsComplianceRules) {
      return { canAutoApprove: false };
    }

    // Check balance
    if (leaveRequest.causesNegativeBalance) {
      return { canAutoApprove: false };
    }

    return {
      canAutoApprove: true,
      reason: `Under ${config.autoApprove.maxHours}h, ${config.autoApprove.minNoticeDays}+ days notice, coverage OK`,
    };
  }

  /**
   * Approve an approval step
   */
  async approve(
    approvalId: string,
    approverId: string,
    comment?: string,
    overrides?: {
      type: 'COVERAGE' | 'EMBARGO' | 'NOTICE' | 'BALANCE';
      reason: string;
    },
  ): Promise<{ approval: LeaveApproval; nextStep?: LeaveApproval; completed: boolean }> {
    const approval = await this.approvalRepo.findOne({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    if (approval.decision !== 'PENDING') {
      throw new Error(`Approval already ${approval.decision}`);
    }

    // Update approval
    approval.decision = 'APPROVED';
    approval.decidedAt = new Date();
    approval.comment = comment;

    if (overrides) {
      approval.isOverride = true;
      approval.overrideDetails = overrides;
    }

    approval.actions.push({
      type: 'APPROVED',
      timestamp: new Date(),
      actor: approverId,
      detail: comment,
    });

    await this.approvalRepo.save(approval);

    // Get next step
    const nextStep = await this.approvalRepo.findOne({
      where: {
        leaveRequestId: approval.leaveRequestId,
        step: approval.step + 1,
      },
    });

    // Check if all steps complete
    const allApprovals = await this.approvalRepo.find({
      where: { leaveRequestId: approval.leaveRequestId },
      order: { step: 'ASC' },
    });

    const allApproved = allApprovals.every(a =>
      a.decision === 'APPROVED' || a.decision === 'SKIPPED',
    );

    // Update leave request
    const leaveRequest = await this.requestRepo.findOne({
      where: { id: approval.leaveRequestId },
    });

    if (leaveRequest) {
      if (allApproved) {
        leaveRequest.status = 'APPROVED';
        leaveRequest.isFullyApproved = true;
        leaveRequest.currentApprovalStep = null;
      } else if (nextStep) {
        leaveRequest.currentApprovalStep = nextStep.stepName;
        leaveRequest.approvalLevel = nextStep.step;
      }

      await this.requestRepo.save(leaveRequest);
    }

    this.logger.log(
      `Approved step ${approval.step} (${approval.stepName}) for request ${approval.leaveRequestId}`,
    );

    return {
      approval,
      nextStep,
      completed: allApproved,
    };
  }

  /**
   * Reject an approval step
   */
  async reject(
    approvalId: string,
    approverId: string,
    reason: string,
  ): Promise<LeaveApproval> {
    const approval = await this.approvalRepo.findOne({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    // Update approval
    approval.decision = 'REJECTED';
    approval.decidedAt = new Date();
    approval.rejectionReason = reason;

    approval.actions.push({
      type: 'REJECTED',
      timestamp: new Date(),
      actor: approverId,
      detail: reason,
    });

    await this.approvalRepo.save(approval);

    // Update leave request
    const leaveRequest = await this.requestRepo.findOne({
      where: { id: approval.leaveRequestId },
    });

    if (leaveRequest) {
      leaveRequest.status = 'REJECTED';
      leaveRequest.rejectedBy = approverId;
      leaveRequest.rejectedAt = new Date();
      leaveRequest.rejectionReason = reason;

      await this.requestRepo.save(leaveRequest);
    }

    this.logger.log(
      `Rejected step ${approval.step} for request ${approval.leaveRequestId}`,
    );

    return approval;
  }

  /**
   * Request changes to a request
   */
  async requestChanges(
    approvalId: string,
    approverId: string,
    requestedChanges: string,
    suggestedDates?: { startDate: Date; endDate: Date }[],
  ): Promise<LeaveApproval> {
    const approval = await this.approvalRepo.findOne({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    // Add to actions
    approval.actions.push({
      type: 'REQUESTED_CHANGES',
      timestamp: new Date(),
      actor: approverId,
      detail: requestedChanges,
    });

    if (suggestedDates) {
      approval.suggestedAlternatives = suggestedDates.map(d => ({
        startDate: d.startDate.toISOString(),
        endDate: d.endDate.toISOString(),
        reason: 'Better coverage',
      }));
      approval.alternativesProvided = true;
    }

    await this.approvalRepo.save(approval);

    this.logger.log(`Requested changes for request ${approval.leaveRequestId}`);

    return approval;
  }

  /**
   * Escalate overdue approval
   */
  async escalate(approvalId: string, escalateTo: string): Promise<LeaveApproval> {
    const approval = await this.approvalRepo.findOne({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    approval.isEscalated = true;
    approval.escalatedTo = escalateTo;
    approval.escalatedAt = new Date();

    approval.actions.push({
      type: 'ESCALATED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      detail: `Escalated to ${escalateTo} due to SLA breach`,
    });

    await this.approvalRepo.save(approval);

    // Update leave request
    const leaveRequest = await this.requestRepo.findOne({
      where: { id: approval.leaveRequestId },
    });

    if (leaveRequest) {
      leaveRequest.hasEscalated = true;
      await this.requestRepo.save(leaveRequest);
    }

    this.logger.warn(`Escalated approval ${approvalId} to ${escalateTo}`);

    return approval;
  }

  /**
   * Delegate approval to another user
   */
  async delegate(
    approvalId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<LeaveApproval> {
    const approval = await this.approvalRepo.findOne({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    approval.isDelegated = true;
    approval.delegatedFrom = fromUserId;
    approval.delegatedTo = toUserId;
    approval.delegatedAt = new Date();
    approval.approverId = toUserId; // Change approver

    approval.actions.push({
      type: 'DELEGATED',
      timestamp: new Date(),
      actor: fromUserId,
      detail: `Delegated to ${toUserId}`,
    });

    await this.approvalRepo.save(approval);

    this.logger.log(`Delegated approval ${approvalId} from ${fromUserId} to ${toUserId}`);

    return approval;
  }

  /**
   * Check and escalate overdue approvals
   */
  async checkAndEscalateOverdue(): Promise<number> {
    const now = new Date();

    const overdueApprovals = await this.approvalRepo
      .createQueryBuilder('a')
      .where('a.decision = :decision', { decision: 'PENDING' })
      .andWhere('a.dueAt < :now', { now })
      .andWhere('a.isEscalated = false')
      .getMany();

    let escalated = 0;

    for (const approval of overdueApprovals) {
      // Mark as overdue
      approval.isOverdue = true;
      await this.approvalRepo.save(approval);

      // Escalate (would determine escalation target based on org structure)
      const escalationTarget = 'DEPARTMENT_HEAD'; // Simplified
      await this.escalate(approval.id, escalationTarget);

      escalated++;
    }

    if (escalated > 0) {
      this.logger.warn(`Escalated ${escalated} overdue approvals`);
    }

    return escalated;
  }

  /**
   * Get pending approvals for an approver
   */
  async getPendingForApprover(
    approverId: string,
    organizationId: string,
  ): Promise<LeaveApproval[]> {
    return this.approvalRepo.find({
      where: {
        approverId,
        organizationId,
        decision: 'PENDING',
      },
      relations: ['leaveRequest'],
      order: { dueAt: 'ASC' },
    });
  }

  /**
   * Get approval history for a request
   */
  async getApprovalHistory(leaveRequestId: string): Promise<LeaveApproval[]> {
    return this.approvalRepo.find({
      where: { leaveRequestId },
      order: { step: 'ASC' },
    });
  }
}
