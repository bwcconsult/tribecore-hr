import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { Obligation, ObligationStatus } from '../entities/obligation.entity';
import { Renewal, RenewalStatus } from '../entities/renewal.entity';
import { Approval, ApprovalStatus } from '../entities/approval.entity';

export interface NotificationPayload {
  type: NotificationType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  recipientId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  CONTRACT_SUBMITTED = 'CONTRACT_SUBMITTED',
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',
  APPROVAL_APPROVED = 'APPROVAL_APPROVED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
  CONTRACT_EXECUTED = 'CONTRACT_EXECUTED',
  OBLIGATION_DUE_SOON = 'OBLIGATION_DUE_SOON',
  OBLIGATION_OVERDUE = 'OBLIGATION_OVERDUE',
  RENEWAL_DUE_180 = 'RENEWAL_DUE_180',
  RENEWAL_DUE_90 = 'RENEWAL_DUE_90',
  RENEWAL_DUE_60 = 'RENEWAL_DUE_60',
  RENEWAL_DUE_30 = 'RENEWAL_DUE_30',
  RENEWAL_OVERDUE = 'RENEWAL_OVERDUE',
  CONTRACT_EXPIRING = 'CONTRACT_EXPIRING',
  SLA_BREACH = 'SLA_BREACH',
  PAYMENT_DUE = 'PAYMENT_DUE',
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Obligation)
    private obligationRepository: Repository<Obligation>,
    @InjectRepository(Renewal)
    private renewalRepository: Repository<Renewal>,
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  /**
   * Send notification (in production, integrate with email/Slack/Teams)
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    // In production, this would:
    // 1. Send email via SendGrid/AWS SES
    // 2. Send Slack message via Slack API
    // 3. Send Teams notification via Microsoft Graph
    // 4. Store in-app notification
    // 5. Send push notification to mobile

    console.log('📧 Notification:', {
      type: payload.type,
      priority: payload.priority,
      to: payload.recipientEmail,
      subject: payload.subject,
      message: payload.message,
      actionUrl: payload.actionUrl,
    });

    // Store notification record (in production)
    // await this.notificationRepository.save({...});
  }

  /**
   * Notify on contract submission
   */
  async notifyContractSubmitted(contractId: string): Promise<void> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['owner', 'approvals', 'approvals.approver'],
    });

    if (!contract) return;

    // Notify all approvers
    for (const approval of contract.approvals || []) {
      if (approval.status === ApprovalStatus.PENDING) {
        await this.sendNotification({
          type: NotificationType.APPROVAL_REQUEST,
          priority: 'HIGH',
          recipientId: approval.approverId,
          recipientEmail: approval.approver?.email || 'approver@example.com',
          subject: `Approval Required: ${contract.title}`,
          message: `Contract ${contract.contractNumber} requires your ${approval.role} approval. Please review and approve/reject.`,
          actionUrl: `/contracts/${contractId}`,
          metadata: { contractId, approvalId: approval.id },
        });
      }
    }
  }

  /**
   * Notify on approval decision
   */
  async notifyApprovalDecision(approvalId: string): Promise<void> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['contract', 'contract.owner', 'approver'],
    });

    if (!approval) return;

    const isApproved = approval.status === ApprovalStatus.APPROVED;
    const contract = approval.contract;

    await this.sendNotification({
      type: isApproved ? NotificationType.APPROVAL_APPROVED : NotificationType.APPROVAL_REJECTED,
      priority: isApproved ? 'MEDIUM' : 'HIGH',
      recipientId: contract.ownerId,
      recipientEmail: contract.owner?.email || 'owner@example.com',
      subject: `Contract ${isApproved ? 'Approved' : 'Rejected'}: ${contract.title}`,
      message: `${approval.approver?.name || 'Approver'} has ${isApproved ? 'approved' : 'rejected'} contract ${contract.contractNumber}. ${approval.comment ? `Comment: "${approval.comment}"` : ''}`,
      actionUrl: `/contracts/${contract.id}`,
      metadata: { contractId: contract.id, approvalId },
    });
  }

  /**
   * Notify on contract execution
   */
  async notifyContractExecuted(contractId: string): Promise<void> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['owner'],
    });

    if (!contract) return;

    await this.sendNotification({
      type: NotificationType.CONTRACT_EXECUTED,
      priority: 'MEDIUM',
      recipientId: contract.ownerId,
      recipientEmail: contract.owner?.email || 'owner@example.com',
      subject: `Contract Executed: ${contract.title}`,
      message: `Contract ${contract.contractNumber} has been fully executed. All parties have signed and the contract is now active.`,
      actionUrl: `/contracts/${contractId}`,
      metadata: { contractId },
    });
  }

  /**
   * Check and notify upcoming obligations
   */
  async checkObligationDueDates(): Promise<void> {
    const obligations = await this.obligationRepository.find({
      where: { status: ObligationStatus.PENDING },
      relations: ['owner', 'contract'],
    });

    const now = new Date();

    for (const obl of obligations) {
      const daysUntilDue = Math.ceil(
        (new Date(obl.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Notify 7 days before
      if (daysUntilDue === 7) {
        await this.sendNotification({
          type: NotificationType.OBLIGATION_DUE_SOON,
          priority: 'MEDIUM',
          recipientId: obl.ownerId,
          recipientEmail: obl.owner?.email || 'owner@example.com',
          subject: `Obligation Due Soon: ${obl.title}`,
          message: `Obligation "${obl.title}" for contract ${obl.contract.contractNumber} is due in 7 days (${obl.dueDate}).`,
          actionUrl: `/contracts/${obl.contractId}`,
          metadata: { obligationId: obl.id, contractId: obl.contractId },
        });
      }

      // Notify 1 day before
      if (daysUntilDue === 1) {
        await this.sendNotification({
          type: NotificationType.OBLIGATION_DUE_SOON,
          priority: 'HIGH',
          recipientId: obl.ownerId,
          recipientEmail: obl.owner?.email || 'owner@example.com',
          subject: `⚠️ Obligation Due Tomorrow: ${obl.title}`,
          message: `URGENT: Obligation "${obl.title}" for contract ${obl.contract.contractNumber} is due tomorrow!`,
          actionUrl: `/contracts/${obl.contractId}`,
          metadata: { obligationId: obl.id, contractId: obl.contractId },
        });
      }

      // Notify overdue
      if (daysUntilDue < 0) {
        await this.sendNotification({
          type: NotificationType.OBLIGATION_OVERDUE,
          priority: 'URGENT',
          recipientId: obl.ownerId,
          recipientEmail: obl.owner?.email || 'owner@example.com',
          subject: `🚨 OVERDUE Obligation: ${obl.title}`,
          message: `CRITICAL: Obligation "${obl.title}" for contract ${obl.contract.contractNumber} is ${Math.abs(daysUntilDue)} days overdue!`,
          actionUrl: `/contracts/${obl.contractId}`,
          metadata: { obligationId: obl.id, contractId: obl.contractId },
        });
      }
    }
  }

  /**
   * Check and notify renewal dates
   */
  async checkRenewalDates(): Promise<void> {
    const renewals = await this.renewalRepository.find({
      where: { status: RenewalStatus.NOT_DUE },
      relations: ['contract', 'contract.owner'],
    });

    const now = new Date();

    for (const renewal of renewals) {
      const daysUntilNotice = Math.ceil(
        (new Date(renewal.noticeByDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      let notificationType: NotificationType | null = null;
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';

      if (daysUntilNotice <= 180 && daysUntilNotice > 90) {
        notificationType = NotificationType.RENEWAL_DUE_180;
        priority = 'LOW';
      } else if (daysUntilNotice <= 90 && daysUntilNotice > 60) {
        notificationType = NotificationType.RENEWAL_DUE_90;
        priority = 'MEDIUM';
      } else if (daysUntilNotice <= 60 && daysUntilNotice > 30) {
        notificationType = NotificationType.RENEWAL_DUE_60;
        priority = 'MEDIUM';
      } else if (daysUntilNotice <= 30 && daysUntilNotice > 0) {
        notificationType = NotificationType.RENEWAL_DUE_30;
        priority = 'HIGH';
      } else if (daysUntilNotice <= 0) {
        notificationType = NotificationType.RENEWAL_OVERDUE;
        priority = 'URGENT';
      }

      if (notificationType) {
        await this.sendNotification({
          type: notificationType,
          priority,
          recipientId: renewal.contract.ownerId,
          recipientEmail: renewal.contract.owner?.email || 'owner@example.com',
          subject: `Renewal Notice: ${renewal.contract.title}`,
          message: `Contract ${renewal.contract.contractNumber} requires renewal decision. Notice deadline: ${renewal.noticeByDate}. Days remaining: ${daysUntilNotice}.`,
          actionUrl: `/contracts/renewals`,
          metadata: { renewalId: renewal.id, contractId: renewal.contract.id },
        });
      }
    }
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigest(userId: string, userEmail: string): Promise<void> {
    // Gather all pending items for user
    const pendingApprovals = await this.approvalRepository.count({
      where: { approverId: userId, status: ApprovalStatus.PENDING },
    });

    const overdueObligations = await this.obligationRepository.count({
      where: { ownerId: userId, status: ObligationStatus.OVERDUE },
    });

    const upcomingObligations = await this.obligationRepository
      .createQueryBuilder('obligation')
      .where('obligation.ownerId = :userId', { userId })
      .andWhere('obligation.status = :status', { status: ObligationStatus.PENDING })
      .andWhere('obligation.dueDate <= :date', {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .getCount();

    if (pendingApprovals > 0 || overdueObligations > 0 || upcomingObligations > 0) {
      await this.sendNotification({
        type: NotificationType.CONTRACT_SUBMITTED, // Reusing for digest
        priority: 'MEDIUM',
        recipientId: userId,
        recipientEmail: userEmail,
        subject: `📋 Contract Management Daily Digest`,
        message: `
          Good morning! Here's your contract management summary:
          
          • ${pendingApprovals} pending approvals
          • ${overdueObligations} overdue obligations
          • ${upcomingObligations} obligations due in the next 7 days
          
          Please review and take necessary actions.
        `,
        actionUrl: `/contracts`,
      });
    }
  }

  /**
   * Send weekly summary report
   */
  async sendWeeklySummary(userId: string, userEmail: string): Promise<void> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const contractsCreated = await this.contractRepository.count({
      where: {
        ownerId: userId,
        createdAt: weekAgo as any, // Would use MoreThanOrEqual in production
      },
    });

    const contractsExecuted = await this.contractRepository.count({
      where: {
        ownerId: userId,
        status: ContractStatus.EXECUTED,
        executedAt: weekAgo as any,
      },
    });

    await this.sendNotification({
      type: NotificationType.CONTRACT_SUBMITTED,
      priority: 'LOW',
      recipientId: userId,
      recipientEmail: userEmail,
      subject: `📊 Weekly Contract Summary`,
      message: `
        Your contract activity for the past week:
        
        • ${contractsCreated} contracts created
        • ${contractsExecuted} contracts executed
        
        Keep up the great work!
      `,
      actionUrl: `/contracts/analytics`,
    });
  }

  /**
   * Batch send notifications
   */
  async batchSendNotifications(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.sendNotification(payload);
    }
  }
}
