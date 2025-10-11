import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate, EmailTemplateType } from './entities/email-template.entity';
import { EmailLog, EmailStatus } from './entities/email-log.entity';
import { ConfigService } from '@nestjs/config';

/**
 * EmailService
 * Handles email sending with templates and logging
 * Supports SendGrid, Mailgun, or any SMTP provider
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private templateRepository: Repository<EmailTemplate>,
    @InjectRepository(EmailLog)
    private emailLogRepository: Repository<EmailLog>,
    private configService: ConfigService,
  ) {}

  /**
   * Send email using template
   */
  async sendTemplatedEmail(
    templateType: EmailTemplateType,
    recipientEmail: string,
    variables: Record<string, any>,
    options?: {
      recipientName?: string;
      userId?: string;
      ccEmails?: string[];
      bccEmails?: string[];
    },
  ): Promise<EmailLog> {
    try {
      // Get template
      const template = await this.templateRepository.findOne({
        where: { type: templateType, isActive: true },
      });

      if (!template) {
        throw new Error(`Template not found: ${templateType}`);
      }

      // Render template with variables
      const subject = this.renderTemplate(template.subject, variables);
      const htmlBody = this.renderTemplate(template.htmlBody, variables);
      const textBody = this.renderTemplate(template.textBody, variables);

      // Create email log
      const emailLog = this.emailLogRepository.create({
        userId: options?.userId,
        recipientEmail,
        recipientName: options?.recipientName,
        templateType,
        subject,
        htmlBody,
        textBody,
        status: EmailStatus.PENDING,
        ccEmails: options?.ccEmails || template.ccEmails,
        bccEmails: options?.bccEmails || template.bccEmails,
        variables,
      });

      await this.emailLogRepository.save(emailLog);

      // Send email via provider
      await this.sendEmail(emailLog);

      return emailLog;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send email via configured provider
   */
  private async sendEmail(emailLog: EmailLog): Promise<void> {
    try {
      const provider = this.configService.get('EMAIL_PROVIDER') || 'console';

      switch (provider) {
        case 'sendgrid':
          await this.sendViaSendGrid(emailLog);
          break;
        case 'mailgun':
          await this.sendViaMailgun(emailLog);
          break;
        case 'smtp':
          await this.sendViaSMTP(emailLog);
          break;
        default:
          // Console logging for development
          this.logEmailToConsole(emailLog);
      }

      // Update status
      emailLog.status = EmailStatus.SENT;
      emailLog.sentAt = new Date();
      await this.emailLogRepository.save(emailLog);
    } catch (error) {
      this.logger.error(`Failed to send email via provider: ${error.message}`);
      emailLog.status = EmailStatus.FAILED;
      emailLog.failedAt = new Date();
      emailLog.errorMessage = error.message;
      await this.emailLogRepository.save(emailLog);
      throw error;
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(emailLog: EmailLog): Promise<void> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));

    const msg = {
      to: emailLog.recipientEmail,
      from: {
        email: this.configService.get('EMAIL_FROM_ADDRESS'),
        name: this.configService.get('EMAIL_FROM_NAME'),
      },
      subject: emailLog.subject,
      text: emailLog.textBody,
      html: emailLog.htmlBody,
      cc: emailLog.ccEmails,
      bcc: emailLog.bccEmails,
    };

    const [response] = await sgMail.send(msg);
    emailLog.externalId = response.messageId;
  }

  /**
   * Send via Mailgun
   */
  private async sendViaMailgun(emailLog: EmailLog): Promise<void> {
    const mailgun = require('mailgun-js');
    const mg = mailgun({
      apiKey: this.configService.get('MAILGUN_API_KEY'),
      domain: this.configService.get('MAILGUN_DOMAIN'),
    });

    const data = {
      from: `${this.configService.get('EMAIL_FROM_NAME')} <${this.configService.get('EMAIL_FROM_ADDRESS')}>`,
      to: emailLog.recipientEmail,
      subject: emailLog.subject,
      text: emailLog.textBody,
      html: emailLog.htmlBody,
      cc: emailLog.ccEmails?.join(','),
      bcc: emailLog.bccEmails?.join(','),
    };

    const response = await mg.messages().send(data);
    emailLog.externalId = response.id;
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(emailLog: EmailLog): Promise<void> {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    const info = await transporter.sendMail({
      from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM_ADDRESS')}>`,
      to: emailLog.recipientEmail,
      subject: emailLog.subject,
      text: emailLog.textBody,
      html: emailLog.htmlBody,
      cc: emailLog.ccEmails,
      bcc: emailLog.bccEmails,
    });

    emailLog.externalId = info.messageId;
  }

  /**
   * Log email to console (development)
   */
  private logEmailToConsole(emailLog: EmailLog): void {
    this.logger.log('='.repeat(80));
    this.logger.log('📧 EMAIL (Console Mode)');
    this.logger.log('='.repeat(80));
    this.logger.log(`To: ${emailLog.recipientEmail}`);
    this.logger.log(`Subject: ${emailLog.subject}`);
    this.logger.log(`Template: ${emailLog.templateType}`);
    if (emailLog.ccEmails?.length) {
      this.logger.log(`CC: ${emailLog.ccEmails.join(', ')}`);
    }
    this.logger.log('-'.repeat(80));
    this.logger.log(emailLog.textBody);
    this.logger.log('='.repeat(80));
  }

  /**
   * Render template with variables
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }
    return rendered;
  }

  /**
   * Send absence request notification to manager
   */
  async sendAbsenceRequestNotification(
    managerEmail: string,
    employeeName: string,
    absenceType: string,
    startDate: string,
    endDate: string,
    days: number,
  ): Promise<void> {
    await this.sendTemplatedEmail(
      EmailTemplateType.ABSENCE_REQUEST_SUBMITTED,
      managerEmail,
      {
        employeeName,
        absenceType,
        startDate,
        endDate,
        days: days.toString(),
        approvalUrl: `${this.configService.get('FRONTEND_URL')}/absence/approvals`,
      },
    );
  }

  /**
   * Send absence approved notification to employee
   */
  async sendAbsenceApprovedNotification(
    employeeEmail: string,
    employeeName: string,
    absenceType: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    await this.sendTemplatedEmail(
      EmailTemplateType.ABSENCE_REQUEST_APPROVED,
      employeeEmail,
      {
        employeeName,
        absenceType,
        startDate,
        endDate,
        viewUrl: `${this.configService.get('FRONTEND_URL')}/absence`,
      },
      { recipientName: employeeName },
    );
  }

  /**
   * Send absence rejected notification to employee
   */
  async sendAbsenceRejectedNotification(
    employeeEmail: string,
    employeeName: string,
    absenceType: string,
    startDate: string,
    endDate: string,
    reason: string,
  ): Promise<void> {
    await this.sendTemplatedEmail(
      EmailTemplateType.ABSENCE_REQUEST_REJECTED,
      employeeEmail,
      {
        employeeName,
        absenceType,
        startDate,
        endDate,
        reason,
        viewUrl: `${this.configService.get('FRONTEND_URL')}/absence`,
      },
      { recipientName: employeeName },
    );
  }

  /**
   * Send task assigned notification
   */
  async sendTaskAssignedNotification(
    assigneeEmail: string,
    assigneeName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail(
      EmailTemplateType.TASK_ASSIGNED,
      assigneeEmail,
      {
        assigneeName,
        taskTitle,
        taskDescription,
        dueDate: dueDate || 'No due date',
        viewUrl: `${this.configService.get('FRONTEND_URL')}/tasks`,
      },
      { recipientName: assigneeName },
    );
  }
}
