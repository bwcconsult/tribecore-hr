import { NotificationsService } from './services/notifications.service';
import { NotificationPriority, NotificationType } from './entities/notification.entity';

/**
 * Seed sample notifications for testing
 * This creates realistic notifications across all modules
 */
export async function seedNotifications(
  notificationsService: NotificationsService,
  userId: string,
  organizationId: string,
) {
  const notifications = [
    // Payroll notifications
    {
      type: NotificationType.PAYROLL,
      priority: NotificationPriority.HIGH,
      title: 'Payroll Processed Successfully',
      message: 'Monthly payroll for October 2025 has been processed. £124,500 paid to 247 employees.',
      category: 'Finance',
      icon: 'DollarSign',
      actionUrl: '/payroll',
      actionLabel: 'View Payroll',
    },
    {
      type: NotificationType.PAYROLL,
      priority: NotificationPriority.MEDIUM,
      title: 'Payroll Review Required',
      message: 'November payroll is ready for review. Please approve before 25th October.',
      category: 'Finance',
      actionUrl: '/payroll/review',
      actionLabel: 'Review Now',
    },

    // Leave notifications
    {
      type: NotificationType.LEAVE,
      priority: NotificationPriority.MEDIUM,
      title: 'Leave Request Approved',
      message: 'Your annual leave request for 20-24 November has been approved.',
      category: 'Time Off',
      icon: 'Calendar',
      actionUrl: '/leave/my-requests',
      actionLabel: 'View Details',
    },
    {
      type: NotificationType.LEAVE,
      priority: NotificationPriority.HIGH,
      title: 'Pending Leave Approvals',
      message: 'You have 3 leave requests awaiting your approval.',
      category: 'Time Off',
      actionUrl: '/leave/approvals',
      actionLabel: 'Review Requests',
    },

    // Employee notifications
    {
      type: NotificationType.ONBOARDING,
      priority: NotificationPriority.MEDIUM,
      title: 'New Employee Onboarding',
      message: 'Sarah Mitchell starts next Monday. Onboarding checklist is 85% complete.',
      category: 'HR',
      icon: 'UserPlus',
      actionUrl: '/onboarding/sarah-mitchell',
      actionLabel: 'View Checklist',
    },

    // Performance notifications
    {
      type: NotificationType.PERFORMANCE,
      priority: NotificationPriority.LOW,
      title: 'Performance Review Due',
      message: 'Q4 performance reviews are due by 31st October. 12 reviews pending.',
      category: 'Performance',
      icon: 'TrendingUp',
      actionUrl: '/performance/reviews',
      actionLabel: 'Start Reviews',
    },
    {
      type: NotificationType.RECOGNITION,
      priority: NotificationPriority.LOW,
      title: 'Employee Recognition',
      message: 'John Davis received 5 peer recognitions this month. Great teamwork!',
      category: 'Performance',
      icon: 'Award',
      actionUrl: '/recognition',
    },

    // Recruitment notifications
    {
      type: NotificationType.RECRUITMENT,
      priority: NotificationPriority.HIGH,
      title: 'Urgent: Open Positions',
      message: '8 positions have been open for over 30 days. Review recruitment pipeline.',
      category: 'Recruitment',
      icon: 'Briefcase',
      actionUrl: '/recruitment/positions',
      actionLabel: 'View Positions',
    },
    {
      type: NotificationType.INTERVIEW,
      priority: NotificationPriority.URGENT,
      title: 'Interview Scheduled Tomorrow',
      message: 'Software Engineer interview with Alex Chen at 2:00 PM tomorrow.',
      category: 'Recruitment',
      actionUrl: '/recruitment/interviews',
      actionLabel: 'Prepare Interview',
    },

    // Contract notifications
    {
      type: NotificationType.CONTRACT_EXPIRY,
      priority: NotificationPriority.URGENT,
      title: 'Contract Expiring Soon',
      message: 'Vendor contract with TechSupport Ltd expires in 15 days.',
      category: 'Contracts',
      icon: 'FileText',
      actionUrl: '/contracts/expiring',
      actionLabel: 'Review Contract',
    },
    {
      type: NotificationType.CONTRACT_RENEWAL,
      priority: NotificationPriority.HIGH,
      title: 'Contract Renewal Required',
      message: 'Office lease renewal deadline approaching. Action required by 1st November.',
      category: 'Contracts',
      actionUrl: '/contracts/renewals',
      actionLabel: 'Start Renewal',
    },

    // Compliance notifications
    {
      type: NotificationType.COMPLIANCE,
      priority: NotificationPriority.HIGH,
      title: 'Compliance Training Due',
      message: '45 employees need to complete mandatory GDPR training by month end.',
      category: 'Compliance',
      icon: 'Shield',
      actionUrl: '/compliance/training',
      actionLabel: 'View Training',
    },
    {
      type: NotificationType.AUDIT,
      priority: NotificationPriority.MEDIUM,
      title: 'Audit Report Available',
      message: 'Q3 internal audit report is ready for review.',
      category: 'Compliance',
      actionUrl: '/compliance/audits',
      actionLabel: 'View Report',
    },

    // System notifications
    {
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.LOW,
      title: 'System Update Completed',
      message: 'TribeCore has been updated to version 2.1.0 with new features and improvements.',
      category: 'System',
      icon: 'Bell',
    },
    {
      type: NotificationType.ANNOUNCEMENT,
      priority: NotificationPriority.MEDIUM,
      title: 'Company Town Hall Meeting',
      message: 'Join us for the quarterly town hall on Friday at 3:00 PM. All hands meeting.',
      category: 'Announcements',
      actionUrl: '/calendar',
      actionLabel: 'Add to Calendar',
    },

    // Security notifications
    {
      type: NotificationType.SECURITY,
      priority: NotificationPriority.HIGH,
      title: 'Password Reset Required',
      message: 'For security reasons, please reset your password within 7 days.',
      category: 'Security',
      icon: 'Key',
      actionUrl: '/settings/security',
      actionLabel: 'Reset Password',
    },
    {
      type: NotificationType.IAM,
      priority: NotificationPriority.MEDIUM,
      title: 'Access Request Received',
      message: 'Emma Watson requested access to Payroll Reports. Approve or deny.',
      category: 'Access Control',
      actionUrl: '/iam/requests',
      actionLabel: 'Review Request',
    },

    // Learning notifications
    {
      type: NotificationType.LEARNING,
      priority: NotificationPriority.LOW,
      title: 'New Training Available',
      message: 'Advanced Excel Skills course is now available. Enroll before seats fill up.',
      category: 'Learning',
      icon: 'GraduationCap',
      actionUrl: '/learning/courses',
      actionLabel: 'Enroll Now',
    },

    // Task notifications
    {
      type: NotificationType.TASK,
      priority: NotificationPriority.MEDIUM,
      title: 'Task Assigned to You',
      message: 'You have been assigned: "Review Q4 Budget Proposal"',
      category: 'Tasks',
      actionUrl: '/tasks',
      actionLabel: 'View Task',
    },
    {
      type: NotificationType.APPROVAL,
      priority: NotificationPriority.HIGH,
      title: 'Approval Required',
      message: '2 expense claims totaling £1,245 awaiting your approval.',
      category: 'Approvals',
      actionUrl: '/expenses/approvals',
      actionLabel: 'Review Claims',
    },
  ];

  console.log('🌱 Seeding notifications...');

  for (const notif of notifications) {
    try {
      await notificationsService.create({
        recipientId: userId,
        organizationId,
        ...notif,
        senderName: 'TribeCore System',
      });
    } catch (error) {
      console.error(`Failed to create notification: ${notif.title}`, error);
    }
  }

  console.log(`✅ Created ${notifications.length} sample notifications`);
}
