import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TeamsMessage {
  '@type': string;
  '@context': string;
  themeColor?: string;
  summary: string;
  sections?: any[];
  potentialAction?: any[];
}

/**
 * TeamsService
 * Sends notifications to Microsoft Teams via webhooks
 */
@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  private readonly webhookUrl: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get('TEAMS_WEBHOOK_URL') || '';
    this.enabled = this.configService.get('TEAMS_ENABLED') === 'true';
  }

  /**
   * Send message to Teams
   */
  async sendMessage(message: TeamsMessage): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Teams disabled, skipping message');
      return;
    }

    if (!this.webhookUrl) {
      this.logger.warn('Teams webhook URL not configured');
      return;
    }

    try {
      await axios.post(this.webhookUrl, message);
      this.logger.log('Teams message sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Teams message: ${error.message}`);
    }
  }

  /**
   * Send absence request notification
   */
  async sendAbsenceRequestNotification(
    employeeName: string,
    absenceType: string,
    startDate: string,
    endDate: string,
    days: number,
  ): Promise<void> {
    const message: TeamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: '0076D7',
      summary: `New absence request from ${employeeName}`,
      sections: [
        {
          activityTitle: '🏖️ New Absence Request',
          activitySubtitle: `From ${employeeName}`,
          facts: [
            { name: 'Type:', value: absenceType },
            { name: 'Start Date:', value: startDate },
            { name: 'End Date:', value: endDate },
            { name: 'Days:', value: days.toString() },
          ],
          markdown: true,
        },
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View Request',
          targets: [
            {
              os: 'default',
              uri: `${this.configService.get('FRONTEND_URL')}/absence`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  /**
   * Send absence approved notification
   */
  async sendAbsenceApprovedNotification(
    employeeName: string,
    absenceType: string,
    approverName: string,
  ): Promise<void> {
    const message: TeamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: '28a745',
      summary: `Absence request approved for ${employeeName}`,
      sections: [
        {
          activityTitle: '✅ Absence Approved',
          text: `${employeeName}'s ${absenceType} request has been approved by ${approverName}`,
          markdown: true,
        },
      ],
    };

    await this.sendMessage(message);
  }

  /**
   * Send task assigned notification
   */
  async sendTaskAssignedNotification(
    assigneeName: string,
    taskTitle: string,
    assignerName: string,
    dueDate?: string,
  ): Promise<void> {
    const message: TeamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: '0076D7',
      summary: `New task assigned to ${assigneeName}`,
      sections: [
        {
          activityTitle: '📋 New Task Assigned',
          activitySubtitle: `To ${assigneeName}`,
          facts: [
            { name: 'Task:', value: taskTitle },
            { name: 'Assigned by:', value: assignerName },
            { name: 'Due Date:', value: dueDate || 'No due date' },
          ],
          markdown: true,
        },
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View Task',
          targets: [
            {
              os: 'default',
              uri: `${this.configService.get('FRONTEND_URL')}/tasks`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }
}
