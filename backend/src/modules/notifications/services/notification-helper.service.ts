import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

/**
 * Notification Helper Service
 * 
 * Central service for triggering notifications across all TribeCore modules.
 * Each module can import this service to send notifications to users.
 */
@Injectable()
export class NotificationHelperService {
  private readonly logger = new Logger(NotificationHelperService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== LEAVE & ABSENCE ====================

  async notifyLeaveRequestSubmitted(params: {
    recipientId: string;
    organizationId: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    leaveRequestId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.LEAVE,
      priority: NotificationPriority.MEDIUM,
      title: 'Leave Request Submitted',
      message: `${params.employeeName} has submitted a ${params.leaveType} request from ${params.startDate} to ${params.endDate}`,
      actionUrl: `/leave/requests/${params.leaveRequestId}`,
      actionLabel: 'Review Request',
      relatedEntityId: params.leaveRequestId,
      relatedEntityType: 'leave_request',
    });
  }

  async notifyLeaveApproved(params: {
    recipientId: string;
    organizationId: string;
    approverName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    leaveRequestId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.LEAVE,
      priority: NotificationPriority.HIGH,
      title: '✅ Leave Request Approved',
      message: `Your ${params.leaveType} request from ${params.startDate} to ${params.endDate} has been approved by ${params.approverName}`,
      actionUrl: `/leave/my-requests/${params.leaveRequestId}`,
      actionLabel: 'View Details',
      relatedEntityId: params.leaveRequestId,
      relatedEntityType: 'leave_request',
      senderName: params.approverName,
    });
  }

  async notifyLeaveRejected(params: {
    recipientId: string;
    organizationId: string;
    approverName: string;
    leaveType: string;
    reason?: string;
    leaveRequestId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.LEAVE,
      priority: NotificationPriority.HIGH,
      title: '❌ Leave Request Rejected',
      message: `Your ${params.leaveType} request has been rejected${params.reason ? `: ${params.reason}` : ''}`,
      actionUrl: `/leave/my-requests/${params.leaveRequestId}`,
      actionLabel: 'View Details',
      relatedEntityId: params.leaveRequestId,
      relatedEntityType: 'leave_request',
      senderName: params.approverName,
    });
  }

  // ==================== PAYROLL ====================

  async notifyPayslipAvailable(params: {
    recipientId: string;
    organizationId: string;
    month: string;
    year: string;
    netPay: string;
    payslipId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.PAYROLL,
      priority: NotificationPriority.HIGH,
      title: '💰 Payslip Available',
      message: `Your payslip for ${params.month} ${params.year} is ready. Net pay: ${params.netPay}`,
      actionUrl: `/payroll/payslips/${params.payslipId}`,
      actionLabel: 'View Payslip',
      relatedEntityId: params.payslipId,
      relatedEntityType: 'payslip',
    });
  }

  async notifyPayrollProcessed(params: {
    recipientId: string;
    organizationId: string;
    period: string;
    employeeCount: number;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.PAYROLL,
      priority: NotificationPriority.HIGH,
      title: 'Payroll Processed',
      message: `Payroll for ${params.period} has been processed for ${params.employeeCount} employees`,
      actionUrl: `/payroll/reports`,
      actionLabel: 'View Report',
      relatedEntityType: 'payroll_run',
    });
  }

  // ==================== EXPENSES ====================

  async notifyExpenseSubmitted(params: {
    recipientId: string;
    organizationId: string;
    employeeName: string;
    amount: string;
    category: string;
    expenseId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.EXPENSE,
      priority: NotificationPriority.MEDIUM,
      title: 'Expense Claim Submitted',
      message: `${params.employeeName} submitted a ${params.category} expense claim for ${params.amount}`,
      actionUrl: `/expenses/${params.expenseId}`,
      actionLabel: 'Review Claim',
      relatedEntityId: params.expenseId,
      relatedEntityType: 'expense',
    });
  }

  async notifyExpenseApproved(params: {
    recipientId: string;
    organizationId: string;
    amount: string;
    approverName: string;
    expenseId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.EXPENSE,
      priority: NotificationPriority.HIGH,
      title: '✅ Expense Approved',
      message: `Your expense claim for ${params.amount} has been approved and will be reimbursed`,
      actionUrl: `/expenses/my-expenses/${params.expenseId}`,
      actionLabel: 'View Details',
      relatedEntityId: params.expenseId,
      relatedEntityType: 'expense',
      senderName: params.approverName,
    });
  }

  // ==================== PERFORMANCE ====================

  async notifyPerformanceReviewDue(params: {
    recipientId: string;
    organizationId: string;
    employeeName: string;
    dueDate: string;
    reviewId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.PERFORMANCE,
      priority: NotificationPriority.HIGH,
      title: '📊 Performance Review Due',
      message: `Performance review for ${params.employeeName} is due on ${params.dueDate}`,
      actionUrl: `/performance/reviews/${params.reviewId}`,
      actionLabel: 'Complete Review',
      relatedEntityId: params.reviewId,
      relatedEntityType: 'performance_review',
    });
  }

  async notifyRecognitionReceived(params: {
    recipientId: string;
    organizationId: string;
    senderName: string;
    type: string;
    message: string;
    recognitionId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.RECOGNITION,
      priority: NotificationPriority.MEDIUM,
      title: `🎉 ${params.type} Recognition`,
      message: `${params.senderName} recognized you: "${params.message}"`,
      actionUrl: `/recognition/${params.recognitionId}`,
      actionLabel: 'View Recognition',
      relatedEntityId: params.recognitionId,
      relatedEntityType: 'recognition',
      senderName: params.senderName,
    });
  }

  // ==================== RECRUITMENT ====================

  async notifyNewApplicant(params: {
    recipientId: string;
    organizationId: string;
    applicantName: string;
    position: string;
    applicationId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.APPLICANT,
      priority: NotificationPriority.MEDIUM,
      title: 'New Job Application',
      message: `${params.applicantName} applied for ${params.position}`,
      actionUrl: `/recruitment/applications/${params.applicationId}`,
      actionLabel: 'Review Application',
      relatedEntityId: params.applicationId,
      relatedEntityType: 'application',
    });
  }

  async notifyInterviewScheduled(params: {
    recipientId: string;
    organizationId: string;
    applicantName: string;
    position: string;
    dateTime: string;
    interviewId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.INTERVIEW,
      priority: NotificationPriority.HIGH,
      title: '📅 Interview Scheduled',
      message: `Interview with ${params.applicantName} for ${params.position} scheduled on ${params.dateTime}`,
      actionUrl: `/recruitment/interviews/${params.interviewId}`,
      actionLabel: 'View Details',
      relatedEntityId: params.interviewId,
      relatedEntityType: 'interview',
    });
  }

  // ==================== ONBOARDING ====================

  async notifyOnboardingTaskAssigned(params: {
    recipientId: string;
    organizationId: string;
    employeeName: string;
    taskName: string;
    dueDate: string;
    taskId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.ONBOARDING,
      priority: NotificationPriority.MEDIUM,
      title: 'Onboarding Task Assigned',
      message: `Complete "${params.taskName}" for ${params.employeeName} by ${params.dueDate}`,
      actionUrl: `/onboarding/tasks/${params.taskId}`,
      actionLabel: 'Complete Task',
      relatedEntityId: params.taskId,
      relatedEntityType: 'onboarding_task',
    });
  }

  // ==================== CONTRACTS (CMS) ====================

  async notifyContractApprovalRequired(params: {
    recipientId: string;
    organizationId: string;
    contractTitle: string;
    contractValue: string;
    contractId: string;
    submitterName: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.CONTRACT_APPROVAL,
      priority: NotificationPriority.HIGH,
      title: '✍️ Contract Approval Required',
      message: `"${params.contractTitle}" (${params.contractValue}) requires your approval`,
      actionUrl: `/contracts/${params.contractId}`,
      actionLabel: 'Review Contract',
      relatedEntityId: params.contractId,
      relatedEntityType: 'contract',
      senderName: params.submitterName,
    });
  }

  async notifyContractApproved(params: {
    recipientId: string;
    organizationId: string;
    contractTitle: string;
    approverName: string;
    contractId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.CONTRACT_APPROVAL,
      priority: NotificationPriority.HIGH,
      title: '✅ Contract Approved',
      message: `"${params.contractTitle}" has been approved by ${params.approverName}`,
      actionUrl: `/contracts/${params.contractId}`,
      actionLabel: 'View Contract',
      relatedEntityId: params.contractId,
      relatedEntityType: 'contract',
      senderName: params.approverName,
    });
  }

  async notifyContractExpiringSoon(params: {
    recipientId: string;
    organizationId: string;
    contractTitle: string;
    daysUntilExpiry: number;
    contractId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.CONTRACT_EXPIRY,
      priority: params.daysUntilExpiry <= 30 ? NotificationPriority.URGENT : NotificationPriority.HIGH,
      title: '⚠️ Contract Expiring Soon',
      message: `"${params.contractTitle}" expires in ${params.daysUntilExpiry} days`,
      actionUrl: `/contracts/${params.contractId}`,
      actionLabel: 'Review Contract',
      relatedEntityId: params.contractId,
      relatedEntityType: 'contract',
    });
  }

  async notifyContractObligationDue(params: {
    recipientId: string;
    organizationId: string;
    obligationTitle: string;
    contractTitle: string;
    dueDate: string;
    obligationId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.OBLIGATION,
      priority: NotificationPriority.HIGH,
      title: '📋 Contract Obligation Due',
      message: `"${params.obligationTitle}" for "${params.contractTitle}" is due on ${params.dueDate}`,
      actionUrl: `/contracts/obligations/${params.obligationId}`,
      actionLabel: 'Complete Obligation',
      relatedEntityId: params.obligationId,
      relatedEntityType: 'obligation',
    });
  }

  // ==================== IAM & ACCESS ====================

  async notifyAccessRequestReceived(params: {
    recipientId: string;
    organizationId: string;
    requesterName: string;
    resource: string;
    reason: string;
    requestId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.ACCESS_REQUEST,
      priority: NotificationPriority.MEDIUM,
      title: '🔐 Access Request',
      message: `${params.requesterName} requests access to ${params.resource}: ${params.reason}`,
      actionUrl: `/iam/access-requests/${params.requestId}`,
      actionLabel: 'Review Request',
      relatedEntityId: params.requestId,
      relatedEntityType: 'access_request',
      senderName: params.requesterName,
    });
  }

  async notifyRoleChanged(params: {
    recipientId: string;
    organizationId: string;
    oldRole: string;
    newRole: string;
    changedBy: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.ROLE_CHANGE,
      priority: NotificationPriority.HIGH,
      title: '👤 Role Updated',
      message: `Your role has been changed from ${params.oldRole} to ${params.newRole}`,
      actionUrl: `/profile/me`,
      actionLabel: 'View Profile',
      senderName: params.changedBy,
    });
  }

  // ==================== DOCUMENTS & E-SIGNATURE ====================

  async notifyDocumentSignatureRequired(params: {
    recipientId: string;
    organizationId: string;
    documentTitle: string;
    requesterName: string;
    documentId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.ESIGNATURE,
      priority: NotificationPriority.HIGH,
      title: '✍️ Signature Required',
      message: `Please sign "${params.documentTitle}" requested by ${params.requesterName}`,
      actionUrl: `/sign/${params.documentId}`,
      actionLabel: 'Sign Document',
      relatedEntityId: params.documentId,
      relatedEntityType: 'document',
      senderName: params.requesterName,
    });
  }

  async notifyDocumentSigned(params: {
    recipientId: string;
    organizationId: string;
    documentTitle: string;
    signerName: string;
    documentId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.ESIGNATURE,
      priority: NotificationPriority.MEDIUM,
      title: '✅ Document Signed',
      message: `${params.signerName} has signed "${params.documentTitle}"`,
      actionUrl: `/documents/${params.documentId}`,
      actionLabel: 'View Document',
      relatedEntityId: params.documentId,
      relatedEntityType: 'document',
      senderName: params.signerName,
    });
  }

  // ==================== SYSTEM & GENERAL ====================

  async notifySystemAnnouncement(params: {
    recipientIds: string[];
    organizationId: string;
    title: string;
    message: string;
    priority?: NotificationPriority;
  }): Promise<void> {
    const notifications = params.recipientIds.map((recipientId) => ({
      recipientId,
      organizationId: params.organizationId,
      type: NotificationType.ANNOUNCEMENT,
      priority: params.priority || NotificationPriority.MEDIUM,
      title: params.title,
      message: params.message,
    }));

    await this.notificationsService.createBulk(notifications);
  }

  async notifyTaskAssigned(params: {
    recipientId: string;
    organizationId: string;
    taskTitle: string;
    assignedBy: string;
    dueDate: string;
    taskId: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.TASK,
      priority: NotificationPriority.MEDIUM,
      title: '✓ Task Assigned',
      message: `${params.assignedBy} assigned you: "${params.taskTitle}" (Due: ${params.dueDate})`,
      actionUrl: `/tasks/${params.taskId}`,
      actionLabel: 'View Task',
      relatedEntityId: params.taskId,
      relatedEntityType: 'task',
      senderName: params.assignedBy,
    });
  }

  async notifyReminder(params: {
    recipientId: string;
    organizationId: string;
    title: string;
    message: string;
    actionUrl?: string;
    relatedEntityId?: string;
  }): Promise<void> {
    await this.notificationsService.create({
      recipientId: params.recipientId,
      organizationId: params.organizationId,
      type: NotificationType.REMINDER,
      priority: NotificationPriority.MEDIUM,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl,
      relatedEntityId: params.relatedEntityId,
    });
  }
}
