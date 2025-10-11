import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SlackMessage {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  blocks?: any[];
  attachments?: any[];
  text: string;
}

/**
 * SlackService
 * Sends notifications to Slack channels via webhooks
 */
@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get('SLACK_WEBHOOK_URL') || '';
    this.enabled = this.configService.get('SLACK_ENABLED') === 'true';
  }

  /**
   * Send message to Slack
   */
  async sendMessage(message: SlackMessage): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Slack disabled, skipping message');
      return;
    }

    if (!this.webhookUrl) {
      this.logger.warn('Slack webhook URL not configured');
      return;
    }

    try {
      await axios.post(this.webhookUrl, message);
      this.logger.log('Slack message sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error.message}`);
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
    const message: SlackMessage = {
      username: 'TribeCore HR',
      icon_emoji: ':calendar:',
      text: `New absence request from ${employeeName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🏖️ New Absence Request',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Employee:*\n${employeeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Type:*\n${absenceType}`,
            },
            {
              type: 'mrkdwn',
              text: `*Start Date:*\n${startDate}`,
            },
            {
              type: 'mrkdwn',
              text: `*End Date:*\n${endDate}`,
            },
            {
              type: 'mrkdwn',
              text: `*Days:*\n${days}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Request',
              },
              url: `${this.configService.get('FRONTEND_URL')}/absence`,
              style: 'primary',
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
    const message: SlackMessage = {
      username: 'TribeCore HR',
      icon_emoji: ':white_check_mark:',
      text: `Absence request approved for ${employeeName}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Absence Approved*\n${employeeName}'s ${absenceType} request has been approved by ${approverName}`,
          },
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
    const message: SlackMessage = {
      username: 'TribeCore HR',
      icon_emoji: ':memo:',
      text: `New task assigned to ${assigneeName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 New Task Assigned',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Assignee:*\n${assigneeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Assigned by:*\n${assignerName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Task:*\n${taskTitle}`,
            },
            {
              type: 'mrkdwn',
              text: `*Due Date:*\n${dueDate || 'No due date'}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Task',
              },
              url: `${this.configService.get('FRONTEND_URL')}/tasks`,
              style: 'primary',
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }
}
