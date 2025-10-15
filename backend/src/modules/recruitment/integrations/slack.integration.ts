import { Injectable, Logger } from '@nestjs/common';

export interface SlackMessage {
  channel: string;
  text?: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string; // For threaded replies
}

export interface SlackUser {
  id: string;
  name: string;
  email: string;
  real_name: string;
  tz: string;
}

@Injectable()
export class SlackIntegrationService {
  private readonly logger = new Logger(SlackIntegrationService.name);
  private readonly botToken = process.env.SLACK_BOT_TOKEN;
  private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL;

  /**
   * Send simple message to channel
   */
  async sendMessage(params: {
    channel: string;
    text: string;
  }): Promise<boolean> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: params.channel,
          text: params.text,
        }),
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error);
      }

      this.logger.log(`Slack message sent to ${params.channel}`);
      return true;
    } catch (error) {
      this.logger.error(`Slack message failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Send rich message with blocks
   */
  async sendRichMessage(params: SlackMessage): Promise<boolean> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      this.logger.error(`Slack rich message failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Notify about new application
   */
  async notifyNewApplication(params: {
    channel: string;
    candidateName: string;
    jobTitle: string;
    applicationUrl: string;
    resumeUrl?: string;
  }): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 New Application Received',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${params.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${params.jobTitle}`,
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
              text: 'View Application',
            },
            url: params.applicationUrl,
            style: 'primary',
          },
        ],
      },
    ];

    if (params.resumeUrl) {
      blocks[2].elements.push({
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Download Resume',
        },
        url: params.resumeUrl,
      });
    }

    return await this.sendRichMessage({
      channel: params.channel,
      blocks,
    });
  }

  /**
   * Notify about interview scheduled
   */
  async notifyInterviewScheduled(params: {
    channel: string;
    candidateName: string;
    jobTitle: string;
    interviewDate: Date;
    interviewType: string;
    panelMembers: string[];
    meetingLink?: string;
  }): Promise<boolean> {
    const dateString = params.interviewDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📅 Interview Scheduled',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${params.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${params.jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Type:*\n${params.interviewType}`,
          },
          {
            type: 'mrkdwn',
            text: `*Date:*\n${dateString}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Panel Members:*\n${params.panelMembers.join(', ')}`,
        },
      },
    ];

    if (params.meetingLink) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Join Meeting',
            },
            url: params.meetingLink,
            style: 'primary',
          },
        ],
      });
    }

    return await this.sendRichMessage({
      channel: params.channel,
      blocks,
    });
  }

  /**
   * Notify about offer sent
   */
  async notifyOfferSent(params: {
    channel: string;
    candidateName: string;
    jobTitle: string;
    salary: number;
    currency: string;
    startDate: Date;
  }): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '💰 Offer Sent',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Candidate:*\n${params.candidateName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Position:*\n${params.jobTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Salary:*\n${params.currency} ${params.salary.toLocaleString()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Start Date:*\n${params.startDate.toLocaleDateString()}`,
          },
        ],
      },
    ];

    return await this.sendRichMessage({
      channel: params.channel,
      blocks,
    });
  }

  /**
   * Request approval via Slack
   */
  async requestApproval(params: {
    channel: string;
    userId: string; // Slack user ID
    requisitionTitle: string;
    department: string;
    budget: number;
    approvalUrl: string;
  }): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⏰ Approval Required',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${params.userId}> You have a pending approval request`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Position:*\n${params.requisitionTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Department:*\n${params.department}`,
          },
          {
            type: 'mrkdwn',
            text: `*Budget:*\n$${params.budget.toLocaleString()}`,
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
              text: '✅ Approve',
            },
            style: 'primary',
            action_id: 'approve_requisition',
            value: JSON.stringify({ url: params.approvalUrl }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '❌ Reject',
            },
            style: 'danger',
            action_id: 'reject_requisition',
            value: JSON.stringify({ url: params.approvalUrl }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details',
            },
            url: params.approvalUrl,
          },
        ],
      },
    ];

    return await this.sendRichMessage({
      channel: params.channel,
      blocks,
    });
  }

  /**
   * Daily digest of activities
   */
  async sendDailyDigest(params: {
    channel: string;
    stats: {
      newApplications: number;
      interviewsToday: number;
      pendingApprovals: number;
      offersAccepted: number;
    };
  }): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Daily Recruitment Digest',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Here\'s what happened today:*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*New Applications:*\n${params.stats.newApplications}`,
          },
          {
            type: 'mrkdwn',
            text: `*Interviews Today:*\n${params.stats.interviewsToday}`,
          },
          {
            type: 'mrkdwn',
            text: `*Pending Approvals:*\n${params.stats.pendingApprovals}`,
          },
          {
            type: 'mrkdwn',
            text: `*Offers Accepted:*\n${params.stats.offersAccepted}`,
          },
        ],
      },
    ];

    return await this.sendRichMessage({
      channel: params.channel,
      blocks,
    });
  }

  /**
   * Handle slash command
   */
  async handleSlashCommand(command: string, text: string, userId: string): Promise<any> {
    switch (command) {
      case '/candidate-search':
        return this.searchCandidates(text);
      case '/application-status':
        return this.getApplicationStatus(text);
      case '/schedule-interview':
        return this.scheduleInterview(text);
      case '/approve':
        return this.quickApprove(text, userId);
      default:
        return { text: 'Unknown command' };
    }
  }

  /**
   * Handle interactive actions (button clicks)
   */
  async handleInteraction(payload: any): Promise<void> {
    const action = payload.actions[0];
    
    switch (action.action_id) {
      case 'approve_requisition':
        await this.handleApproval(action.value, true);
        break;
      case 'reject_requisition':
        await this.handleApproval(action.value, false);
        break;
    }
  }

  // Private helper methods

  private async searchCandidates(query: string): Promise<any> {
    // TODO: Implement candidate search
    return {
      response_type: 'ephemeral',
      text: `Searching for: ${query}...`,
    };
  }

  private async getApplicationStatus(applicationId: string): Promise<any> {
    // TODO: Fetch application status
    return {
      response_type: 'ephemeral',
      text: `Application status: In Review`,
    };
  }

  private async scheduleInterview(details: string): Promise<any> {
    // TODO: Parse and schedule interview
    return {
      response_type: 'ephemeral',
      text: `Interview scheduled!`,
    };
  }

  private async quickApprove(requisitionId: string, userId: string): Promise<any> {
    // TODO: Approve requisition
    return {
      response_type: 'ephemeral',
      text: `Requisition approved!`,
    };
  }

  private async handleApproval(value: string, approved: boolean): Promise<void> {
    const data = JSON.parse(value);
    // TODO: Call approval API
    this.logger.log(`Requisition ${approved ? 'approved' : 'rejected'} via Slack`);
  }

  /**
   * Get Slack user by email
   */
  async getUserByEmail(email: string): Promise<SlackUser | null> {
    try {
      const response = await fetch(`https://slack.com/api/users.lookupByEmail?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
        },
      });

      const data = await response.json();
      
      if (data.ok) {
        return data.user;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to find Slack user: ${error.message}`);
      return null;
    }
  }

  /**
   * Send direct message to user
   */
  async sendDirectMessage(params: {
    userId: string;
    text: string;
    blocks?: any[];
  }): Promise<boolean> {
    return await this.sendRichMessage({
      channel: params.userId,
      text: params.text,
      blocks: params.blocks,
    });
  }
}
