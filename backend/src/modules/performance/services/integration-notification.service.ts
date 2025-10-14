import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from '../../notifications/entities/notification.entity';
import { EmailService } from '../../notifications/services/email.service';
import { IntegrationsService } from '../../integrations/services/integrations.service';
import { Employee } from '../../employees/entities/employee.entity';
import axios from 'axios';

export interface MultiChannelNotification {
  userId: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: string;
  linkUrl?: string;
  channels: ('EMAIL' | 'SLACK' | 'TEAMS' | 'OUTLOOK' | 'IN_APP')[];
  metadata?: Record<string, any>;
}

@Injectable()
export class IntegrationNotificationService {
  private readonly logger = new Logger(IntegrationNotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly emailService: EmailService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  /**
   * Send notification across multiple channels
   */
  async sendMultiChannelNotification(notification: MultiChannelNotification): Promise<void> {
    const employee = await this.employeeRepo.findOne({
      where: { id: notification.userId },
      relations: ['organization'],
    });

    if (!employee) {
      this.logger.warn(`Employee not found: ${notification.userId}`);
      return;
    }

    const results = await Promise.allSettled([
      notification.channels.includes('IN_APP') ? this.sendInAppNotification(employee, notification) : null,
      notification.channels.includes('EMAIL') ? this.sendEmailNotification(employee, notification) : null,
      notification.channels.includes('SLACK') ? this.sendSlackNotification(employee, notification) : null,
      notification.channels.includes('TEAMS') ? this.sendTeamsNotification(employee, notification) : null,
      notification.channels.includes('OUTLOOK') ? this.sendOutlookNotification(employee, notification) : null,
    ]);

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    this.logger.log(`Sent notification to ${employee.email} via ${successCount}/${notification.channels.length} channels`);
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    await this.notificationRepo.save({
      recipientId: employee.id,
      organizationId: employee.organizationId,
      type: NotificationType.PERFORMANCE,
      priority: NotificationPriority[notification.priority],
      title: notification.title,
      message: notification.message,
      linkUrl: notification.linkUrl,
      isRead: false,
      emailSent: false,
      pushSent: false,
    });

    this.logger.log(`In-app notification sent to ${employee.email}`);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    const emailHtml = this.generateEmailTemplate(employee, notification);

    await this.emailService.sendEmail({
      to: employee.email,
      subject: notification.title,
      html: emailHtml,
      organizationId: employee.organizationId,
    });

    this.logger.log(`Email sent to ${employee.email}`);
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    try {
      const slackWebhook = await this.getIntegrationWebhook(employee.organizationId, 'SLACK');
      
      if (!slackWebhook) {
        this.logger.warn('Slack integration not configured');
        return;
      }

      const slackMessage = {
        text: notification.title,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: this.getEmojiForPriority(notification.priority) + ' ' + notification.title,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: notification.message,
            },
          },
          notification.linkUrl
            ? {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'View Details',
                    },
                    url: `${process.env.FRONTEND_URL}${notification.linkUrl}`,
                    style: notification.priority === 'URGENT' ? 'danger' : 'primary',
                  },
                ],
              }
            : null,
        ].filter(Boolean),
        username: 'TribeCore HR',
        icon_emoji: ':office:',
      };

      await axios.post(slackWebhook, slackMessage);
      this.logger.log(`Slack notification sent to ${employee.email}`);
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${error.message}`);
    }
  }

  /**
   * Send Microsoft Teams notification
   */
  private async sendTeamsNotification(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    try {
      const teamsWebhook = await this.getIntegrationWebhook(employee.organizationId, 'TEAMS');
      
      if (!teamsWebhook) {
        this.logger.warn('Teams integration not configured');
        return;
      }

      const teamsCard = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: notification.title,
        themeColor: this.getColorForPriority(notification.priority),
        title: notification.title,
        sections: [
          {
            activityTitle: 'TribeCore HR System',
            activitySubtitle: new Date().toLocaleString(),
            activityImage: 'https://your-logo-url.com/logo.png',
            text: notification.message,
            facts: [
              {
                name: 'Priority:',
                value: notification.priority,
              },
              {
                name: 'Type:',
                value: notification.type,
              },
            ],
          },
        ],
        potentialAction: notification.linkUrl
          ? [
              {
                '@type': 'OpenUri',
                name: 'View Details',
                targets: [
                  {
                    os: 'default',
                    uri: `${process.env.FRONTEND_URL}${notification.linkUrl}`,
                  },
                ],
              },
            ]
          : [],
      };

      await axios.post(teamsWebhook, teamsCard);
      this.logger.log(`Teams notification sent to ${employee.email}`);
    } catch (error) {
      this.logger.error(`Failed to send Teams notification: ${error.message}`);
    }
  }

  /**
   * Send Outlook calendar invite (for 1:1s) or email
   */
  private async sendOutlookNotification(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    try {
      // If this is a 1:1 meeting notification, create calendar invite
      if (notification.metadata?.meetingDate) {
        await this.createOutlookCalendarEvent(employee, notification);
      } else {
        // Otherwise, send via Microsoft Graph API as email
        await this.sendOutlookEmail(employee, notification);
      }

      this.logger.log(`Outlook notification sent to ${employee.email}`);
    } catch (error) {
      this.logger.error(`Failed to send Outlook notification: ${error.message}`);
    }
  }

  /**
   * Create Outlook calendar event via Microsoft Graph API
   */
  private async createOutlookCalendarEvent(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    const accessToken = await this.getMicrosoftGraphToken(employee.organizationId);
    
    if (!accessToken) {
      this.logger.warn('Microsoft Graph API not configured');
      return;
    }

    const event = {
      subject: notification.title,
      body: {
        contentType: 'HTML',
        content: notification.message,
      },
      start: {
        dateTime: notification.metadata.meetingDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(
          new Date(notification.metadata.meetingDate).getTime() + 60 * 60 * 1000
        ).toISOString(),
        timeZone: 'UTC',
      },
      location: {
        displayName: notification.metadata.location || 'Virtual',
      },
      attendees: [
        {
          emailAddress: {
            address: employee.email,
            name: `${employee.firstName} ${employee.lastName}`,
          },
          type: 'required',
        },
        notification.metadata.managerEmail
          ? {
              emailAddress: {
                address: notification.metadata.managerEmail,
                name: notification.metadata.managerName,
              },
              type: 'required',
            }
          : null,
      ].filter(Boolean),
      isReminderOn: true,
      reminderMinutesBeforeStart: 15,
    };

    await axios.post('https://graph.microsoft.com/v1.0/me/events', event, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send email via Microsoft Graph API
   */
  private async sendOutlookEmail(employee: Employee, notification: MultiChannelNotification): Promise<void> {
    const accessToken = await this.getMicrosoftGraphToken(employee.organizationId);
    
    if (!accessToken) {
      // Fallback to regular email
      await this.sendEmailNotification(employee, notification);
      return;
    }

    const message = {
      message: {
        subject: notification.title,
        body: {
          contentType: 'HTML',
          content: this.generateEmailTemplate(employee, notification),
        },
        toRecipients: [
          {
            emailAddress: {
              address: employee.email,
            },
          },
        ],
        importance: notification.priority === 'URGENT' ? 'high' : 'normal',
      },
    };

    await axios.post('https://graph.microsoft.com/v1.0/me/sendMail', message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ==================== HELPER METHODS ====================

  private async getIntegrationWebhook(organizationId: string, type: 'SLACK' | 'TEAMS'): Promise<string | null> {
    // Fetch from integrations service or database
    // This would retrieve the configured webhook URL for the organization
    return process.env[`${type}_WEBHOOK_URL`] || null;
  }

  private async getMicrosoftGraphToken(organizationId: string): Promise<string | null> {
    // Fetch Microsoft Graph API access token for the organization
    // This would use OAuth2 flow with stored credentials
    return process.env.MICROSOFT_GRAPH_TOKEN || null;
  }

  private generateEmailTemplate(employee: Employee, notification: MultiChannelNotification): string {
    const priorityColors = {
      LOW: '#6B7280',
      MEDIUM: '#3B82F6',
      HIGH: '#F59E0B',
      URGENT: '#EF4444',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">TribeCore HR</h1>
                    </td>
                  </tr>
                  
                  <!-- Priority Badge -->
                  <tr>
                    <td style="padding: 20px 40px 0 40px;">
                      <div style="display: inline-block; padding: 8px 16px; background-color: ${priorityColors[notification.priority]}; color: #ffffff; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        ${notification.priority} Priority
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                        ${notification.title}
                      </h2>
                      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hi ${employee.firstName},
                      </p>
                      <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        ${notification.message}
                      </p>
                      ${
                        notification.linkUrl
                          ? `
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${process.env.FRONTEND_URL}${notification.linkUrl}" 
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              View Details →
                            </a>
                          </td>
                        </tr>
                      </table>
                      `
                          : ''
                      }
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        <strong>TribeCore HR Team</strong>
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        This is an automated notification from TribeCore HR System.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getEmojiForPriority(priority: string): string {
    const emojis = {
      LOW: '🔵',
      MEDIUM: '🟡',
      HIGH: '🟠',
      URGENT: '🔴',
    };
    return emojis[priority] || '🔵';
  }

  private getColorForPriority(priority: string): string {
    const colors = {
      LOW: '0078D4',
      MEDIUM: '3B82F6',
      HIGH: 'F59E0B',
      URGENT: 'EF4444',
    };
    return colors[priority] || '0078D4';
  }
}
