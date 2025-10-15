import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition, RequisitionStatus } from '../entities/requisition.entity';
import { Offer, OfferStatus } from '../entities/offer.entity';
import { StageLog, ActionType } from '../entities/stage-log.entity';
import { NotificationHelperService } from '../../notifications/services/notification-helper.service';

export interface ApprovalStep {
  approverId: string;
  approverName: string;
  role: string;
  order: number;
  isRequired: boolean;
  canSkip: boolean;
}

export interface ApprovalRoute {
  steps: ApprovalStep[];
  requiresAllApprovals: boolean;
}

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionRepo: Repository<Requisition>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(StageLog)
    private readonly stageLogRepo: Repository<StageLog>,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  /**
   * Build approval route for requisition
   */
  async buildRequisitionRoute(requisition: Requisition): Promise<ApprovalRoute> {
    const steps: ApprovalStep[] = [];
    let order = 1;

    // Step 1: Hiring Manager (if not the creator)
    if (requisition.createdBy !== requisition.hiringManagerId) {
      steps.push({
        approverId: requisition.hiringManagerId,
        approverName: 'Hiring Manager',
        role: 'HIRING_MANAGER',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    // Step 2: HRBP (always required)
    steps.push({
      approverId: await this.getHRBPForDepartment(requisition.departmentId),
      approverName: 'HRBP',
      role: 'HRBP',
      order: order++,
      isRequired: true,
      canSkip: false,
    });

    // Step 3: Finance (if budget > threshold)
    if (requisition.budgetAmount && requisition.budgetAmount > 50000) {
      steps.push({
        approverId: await this.getFinanceApprover(requisition.organizationId),
        approverName: 'Finance',
        role: 'FINANCE',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    // Step 4: Comp (if band exception or urgent)
    if (requisition.isUrgent || requisition.metadata?.requiresException) {
      steps.push({
        approverId: await this.getCompApprover(requisition.organizationId),
        approverName: 'Compensation',
        role: 'COMPENSATION',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    // Step 5: Executive (if budget > executive threshold)
    if (requisition.budgetAmount && requisition.budgetAmount > 100000) {
      steps.push({
        approverId: await this.getExecutiveApprover(requisition.organizationId),
        approverName: 'Executive',
        role: 'EXECUTIVE',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    return {
      steps,
      requiresAllApprovals: true,
    };
  }

  /**
   * Build approval route for offer
   */
  async buildOfferRoute(offer: Offer): Promise<ApprovalRoute> {
    const steps: ApprovalStep[] = [];
    let order = 1;

    // Step 1: HRBP (always)
    steps.push({
      approverId: await this.getHRBPForOffer(offer),
      approverName: 'HRBP',
      role: 'HRBP',
      order: order++,
      isRequired: true,
      canSkip: false,
    });

    // Step 2: Comp (if out of band or requires exception)
    if (offer.requiresCompException) {
      steps.push({
        approverId: await this.getCompApprover(offer.organizationId),
        approverName: 'Compensation',
        role: 'COMPENSATION',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    // Step 3: Finance (if total comp > threshold)
    if (offer.totalCompensation > 100000) {
      steps.push({
        approverId: await this.getFinanceApprover(offer.organizationId),
        approverName: 'Finance',
        role: 'FINANCE',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    // Step 4: CFO (if total comp > CFO threshold)
    if (offer.totalCompensation > 200000) {
      steps.push({
        approverId: await this.getCFOApprover(offer.organizationId),
        approverName: 'CFO',
        role: 'CFO',
        order: order++,
        isRequired: true,
        canSkip: false,
      });
    }

    return {
      steps,
      requiresAllApprovals: true,
    };
  }

  /**
   * Submit requisition for approval
   */
  async submitRequisitionForApproval(params: {
    requisitionId: string;
    submittedBy: string;
    submittedByName: string;
    organizationId: string;
  }): Promise<Requisition> {
    const requisition = await this.requisitionRepo.findOne({
      where: { id: params.requisitionId },
    });

    if (!requisition) {
      throw new BadRequestException('Requisition not found');
    }

    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new BadRequestException('Only draft requisitions can be submitted for approval');
    }

    // Build approval route
    const route = await this.buildRequisitionRoute(requisition);

    // Initialize approvals
    requisition.approvals = route.steps.map(step => ({
      approverId: step.approverId,
      approverName: step.approverName,
      role: step.role,
      status: 'PENDING',
    }));

    requisition.status = RequisitionStatus.PENDING_APPROVAL;
    requisition.fullyApproved = false;

    const saved = await this.requisitionRepo.save(requisition);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'REQUISITION',
      objectId: params.requisitionId,
      requisitionId: params.requisitionId,
      actorId: params.submittedBy,
      actorName: params.submittedByName,
      action: ActionType.REQUISITION_SUBMITTED,
      fromValue: RequisitionStatus.DRAFT,
      toValue: RequisitionStatus.PENDING_APPROVAL,
    });
    await this.stageLogRepo.save(log);

    // Notify first approver
    if (route.steps.length > 0) {
      const firstApprover = route.steps[0];
      // Send notification (implement in Phase 5)
      this.logger.log(`Notification sent to ${firstApprover.approverName} for requisition ${params.requisitionId}`);
    }

    return saved;
  }

  /**
   * Approve requisition
   */
  async approveRequisition(params: {
    requisitionId: string;
    approverId: string;
    approverName: string;
    comments?: string;
    organizationId: string;
  }): Promise<Requisition> {
    const requisition = await this.requisitionRepo.findOne({
      where: { id: params.requisitionId },
    });

    if (!requisition) {
      throw new BadRequestException('Requisition not found');
    }

    if (requisition.status !== RequisitionStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Requisition is not pending approval');
    }

    // Find approver in the approval chain
    const approverIndex = requisition.approvals.findIndex(
      a => a.approverId === params.approverId && a.status === 'PENDING'
    );

    if (approverIndex === -1) {
      throw new ForbiddenException('You are not authorized to approve this requisition or it has already been approved');
    }

    // Update approval status
    requisition.approvals[approverIndex].status = 'APPROVED';
    requisition.approvals[approverIndex].decidedAt = new Date();
    requisition.approvals[approverIndex].comments = params.comments;

    // Check if all approvals are done
    const allApproved = requisition.approvals.every(a => a.status === 'APPROVED');

    if (allApproved) {
      requisition.status = RequisitionStatus.APPROVED;
      requisition.fullyApproved = true;
      requisition.approvedAt = new Date();
    }

    const saved = await this.requisitionRepo.save(requisition);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'REQUISITION',
      objectId: params.requisitionId,
      requisitionId: params.requisitionId,
      actorId: params.approverId,
      actorName: params.approverName,
      action: allApproved ? ActionType.REQUISITION_APPROVED : ActionType.REQUISITION_APPROVED,
      comment: params.comments,
    });
    await this.stageLogRepo.save(log);

    // Notify next approver or notify creator if fully approved
    if (allApproved) {
      // Notify creator that requisition is fully approved
      this.logger.log(`Requisition ${params.requisitionId} fully approved`);
    } else {
      // Notify next approver
      const nextPending = requisition.approvals.find(a => a.status === 'PENDING');
      if (nextPending) {
        this.logger.log(`Notification sent to ${nextPending.approverName} for requisition ${params.requisitionId}`);
      }
    }

    return saved;
  }

  /**
   * Reject requisition
   */
  async rejectRequisition(params: {
    requisitionId: string;
    approverId: string;
    approverName: string;
    reason: string;
    organizationId: string;
  }): Promise<Requisition> {
    const requisition = await this.requisitionRepo.findOne({
      where: { id: params.requisitionId },
    });

    if (!requisition) {
      throw new BadRequestException('Requisition not found');
    }

    // Find approver
    const approverIndex = requisition.approvals.findIndex(
      a => a.approverId === params.approverId && a.status === 'PENDING'
    );

    if (approverIndex === -1) {
      throw new ForbiddenException('You are not authorized to reject this requisition');
    }

    // Update approval status
    requisition.approvals[approverIndex].status = 'REJECTED';
    requisition.approvals[approverIndex].decidedAt = new Date();
    requisition.approvals[approverIndex].comments = params.reason;

    // Reject entire requisition
    requisition.status = RequisitionStatus.CANCELLED;

    const saved = await this.requisitionRepo.save(requisition);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'REQUISITION',
      objectId: params.requisitionId,
      requisitionId: params.requisitionId,
      actorId: params.approverId,
      actorName: params.approverName,
      action: ActionType.REQUISITION_REJECTED,
      comment: params.reason,
    });
    await this.stageLogRepo.save(log);

    // Notify creator
    this.logger.log(`Requisition ${params.requisitionId} rejected by ${params.approverName}`);

    return saved;
  }

  /**
   * Submit offer for approval
   */
  async submitOfferForApproval(params: {
    offerId: string;
    submittedBy: string;
    submittedByName: string;
    organizationId: string;
  }): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: params.offerId },
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException('Only draft offers can be submitted for approval');
    }

    // Build approval route
    const route = await this.buildOfferRoute(offer);

    // Initialize approvals
    offer.approvals = route.steps.map(step => ({
      approverId: step.approverId,
      approverName: step.approverName,
      role: step.role,
      status: 'PENDING',
    }));

    offer.status = OfferStatus.PENDING_APPROVAL;

    const saved = await this.offerRepo.save(offer);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'OFFER',
      objectId: params.offerId,
      applicationId: offer.applicationId,
      candidateId: offer.candidateId,
      actorId: params.submittedBy,
      actorName: params.submittedByName,
      action: ActionType.OFFER_SUBMITTED_FOR_APPROVAL,
    });
    await this.stageLogRepo.save(log);

    // Notify first approver
    if (route.steps.length > 0) {
      this.logger.log(`Notification sent to ${route.steps[0].approverName} for offer ${params.offerId}`);
    }

    return saved;
  }

  /**
   * Approve offer
   */
  async approveOffer(params: {
    offerId: string;
    approverId: string;
    approverName: string;
    comments?: string;
    organizationId: string;
  }): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: params.offerId },
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    // Find approver
    const approverIndex = offer.approvals.findIndex(
      a => a.approverId === params.approverId && a.status === 'PENDING'
    );

    if (approverIndex === -1) {
      throw new ForbiddenException('You are not authorized to approve this offer');
    }

    // Update approval
    offer.approvals[approverIndex].status = 'APPROVED';
    offer.approvals[approverIndex].decidedAt = new Date();
    offer.approvals[approverIndex].comments = params.comments;

    // Check if all approved
    const allApproved = offer.approvals.every(a => a.status === 'APPROVED');

    if (allApproved) {
      offer.status = OfferStatus.APPROVED;
    }

    const saved = await this.offerRepo.save(offer);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'OFFER',
      objectId: params.offerId,
      applicationId: offer.applicationId,
      candidateId: offer.candidateId,
      actorId: params.approverId,
      actorName: params.approverName,
      action: allApproved ? ActionType.OFFER_APPROVED : ActionType.OFFER_APPROVED,
      comment: params.comments,
    });
    await this.stageLogRepo.save(log);

    return saved;
  }

  // Helper methods to get approvers (implement based on your org structure)

  private async getHRBPForDepartment(departmentId: string): Promise<string> {
    // Query org structure to find HRBP for department
    // For now, return placeholder
    return 'hrbp-user-id';
  }

  private async getHRBPForOffer(offer: Offer): Promise<string> {
    return 'hrbp-user-id';
  }

  private async getFinanceApprover(organizationId: string): Promise<string> {
    return 'finance-approver-id';
  }

  private async getCompApprover(organizationId: string): Promise<string> {
    return 'comp-approver-id';
  }

  private async getExecutiveApprover(organizationId: string): Promise<string> {
    return 'executive-approver-id';
  }

  private async getCFOApprover(organizationId: string): Promise<string> {
    return 'cfo-approver-id';
  }
}
