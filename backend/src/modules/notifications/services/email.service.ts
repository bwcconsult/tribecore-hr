import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailProvider = this.configService.get('EMAIL_PROVIDER', 'smtp');

    if (emailProvider === 'sendgrid') {
      // SendGrid configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: this.configService.get('SENDGRID_API_KEY'),
        },
      });
    } else if (emailProvider === 'ses') {
      // AWS SES configuration
      this.transporter = nodemailer.createTransporter({
        host: this.configService.get('AWS_SES_HOST'),
        port: 587,
        auth: {
          user: this.configService.get('AWS_SES_ACCESS_KEY'),
          pass: this.configService.get('AWS_SES_SECRET_KEY'),
        },
      });
    } else {
      // Default SMTP configuration (for development with Mailtrap, Gmail, etc.)
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'localhost'),
        port: this.configService.get('SMTP_PORT', 587),
        secure: this.configService.get('SMTP_SECURE', false),
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASSWORD'),
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const from = options.from || this.configService.get('EMAIL_FROM', 'noreply@tribecore.com');

      const mailOptions = {
        from,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc?.join(','),
        bcc: options.bcc?.join(','),
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendExpenseSubmittedEmail(
    employeeName: string,
    employeeEmail: string,
    claimNumber: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    const html = this.getExpenseSubmittedTemplate(employeeName, claimNumber, amount, currency);

    return this.sendEmail({
      to: employeeEmail,
      subject: `Expense Claim ${claimNumber} Submitted`,
      html,
      text: `Your expense claim ${claimNumber} for ${currency} ${amount.toFixed(2)} has been submitted for approval.`,
    });
  }

  async sendExpenseApprovedEmail(
    employeeName: string,
    employeeEmail: string,
    claimNumber: string,
    amount: number,
    currency: string,
    approverName: string,
  ): Promise<boolean> {
    const html = this.getExpenseApprovedTemplate(
      employeeName,
      claimNumber,
      amount,
      currency,
      approverName,
    );

    return this.sendEmail({
      to: employeeEmail,
      subject: `✅ Expense Claim ${claimNumber} Approved`,
      html,
      text: `Good news! Your expense claim ${claimNumber} for ${currency} ${amount.toFixed(2)} has been approved by ${approverName}.`,
    });
  }

  async sendExpenseRejectedEmail(
    employeeName: string,
    employeeEmail: string,
    claimNumber: string,
    amount: number,
    currency: string,
    approverName: string,
    reason: string,
  ): Promise<boolean> {
    const html = this.getExpenseRejectedTemplate(
      employeeName,
      claimNumber,
      amount,
      currency,
      approverName,
      reason,
    );

    return this.sendEmail({
      to: employeeEmail,
      subject: `❌ Expense Claim ${claimNumber} Rejected`,
      html,
      text: `Your expense claim ${claimNumber} has been rejected by ${approverName}. Reason: ${reason}`,
    });
  }

  async sendPendingApprovalEmail(
    approverName: string,
    approverEmail: string,
    employeeName: string,
    claimNumber: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    const html = this.getPendingApprovalTemplate(
      approverName,
      employeeName,
      claimNumber,
      amount,
      currency,
    );

    return this.sendEmail({
      to: approverEmail,
      subject: `🔔 Expense Approval Required: ${claimNumber}`,
      html,
      text: `${employeeName} has submitted an expense claim ${claimNumber} for ${currency} ${amount.toFixed(2)} that requires your approval.`,
    });
  }

  async sendReimbursementProcessedEmail(
    employeeName: string,
    employeeEmail: string,
    claimNumber: string,
    amount: number,
    currency: string,
    paymentMethod: string,
  ): Promise<boolean> {
    const html = this.getReimbursementProcessedTemplate(
      employeeName,
      claimNumber,
      amount,
      currency,
      paymentMethod,
    );

    return this.sendEmail({
      to: employeeEmail,
      subject: `💰 Reimbursement Processed: ${claimNumber}`,
      html,
      text: `Your reimbursement for claim ${claimNumber} (${currency} ${amount.toFixed(2)}) has been processed via ${paymentMethod}.`,
    });
  }

  async sendBudgetAlertEmail(
    managerName: string,
    managerEmail: string,
    budgetName: string,
    percentUsed: number,
    allocated: number,
    spent: number,
    currency: string,
  ): Promise<boolean> {
    const html = this.getBudgetAlertTemplate(
      managerName,
      budgetName,
      percentUsed,
      allocated,
      spent,
      currency,
    );

    return this.sendEmail({
      to: managerEmail,
      subject: `⚠️ Budget Alert: ${budgetName} at ${percentUsed}%`,
      html,
      text: `Budget Alert: ${budgetName} is at ${percentUsed}% (${currency} ${spent.toFixed(2)} of ${currency} ${allocated.toFixed(2)})`,
    });
  }

  // Email Templates
  private getExpenseSubmittedTemplate(
    employeeName: string,
    claimNumber: string,
    amount: number,
    currency: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #4F46E5; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Expense Claim Submitted</h1>
          </div>
          <div class="content">
            <p>Hi ${employeeName},</p>
            <p>Your expense claim has been successfully submitted and is now awaiting approval.</p>
            
            <p><strong>Claim Number:</strong> ${claimNumber}</p>
            <div class="amount">${currency} ${amount.toFixed(2)}</div>
            
            <p>You will receive an email notification once your claim has been reviewed.</p>
            
            <a href="${this.configService.get('FRONTEND_URL')}/expenses/${claimNumber}" class="button">View Claim Details</a>
            
            <p>Thank you for using TribeCore Expenses.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from TribeCore HR System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getExpenseApprovedTemplate(
    employeeName: string,
    claimNumber: string,
    amount: number,
    currency: string,
    approverName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #10B981; margin: 20px 0; }
          .badge { background: #D1FAE5; color: #065F46; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Expense Claim Approved!</h1>
          </div>
          <div class="content">
            <p>Hi ${employeeName},</p>
            <p>Great news! Your expense claim has been approved.</p>
            
            <p><strong>Claim Number:</strong> ${claimNumber}</p>
            <p><strong>Approved By:</strong> ${approverName}</p>
            <div class="amount">${currency} ${amount.toFixed(2)}</div>
            <div class="badge">APPROVED</div>
            
            <p>Your reimbursement will be processed in the next payment cycle.</p>
            
            <a href="${this.configService.get('FRONTEND_URL')}/expenses/${claimNumber}" class="button">View Claim Details</a>
            
            <p>Thank you!</p>
          </div>
          <div class="footer">
            <p>This is an automated email from TribeCore HR System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getExpenseRejectedTemplate(
    employeeName: string,
    claimNumber: string,
    amount: number,
    currency: string,
    approverName: string,
    reason: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #EF4444; margin: 20px 0; }
          .reason-box { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
          .badge { background: #FEE2E2; color: #991B1B; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Expense Claim Rejected</h1>
          </div>
          <div class="content">
            <p>Hi ${employeeName},</p>
            <p>Your expense claim has been reviewed and could not be approved at this time.</p>
            
            <p><strong>Claim Number:</strong> ${claimNumber}</p>
            <p><strong>Reviewed By:</strong> ${approverName}</p>
            <div class="amount">${currency} ${amount.toFixed(2)}</div>
            <div class="badge">REJECTED</div>
            
            <div class="reason-box">
              <strong>Reason for rejection:</strong><br>
              ${reason}
            </div>
            
            <p>Please contact ${approverName} if you have any questions or need clarification.</p>
            
            <a href="${this.configService.get('FRONTEND_URL')}/expenses/${claimNumber}" class="button">View Claim Details</a>
          </div>
          <div class="footer">
            <p>This is an automated email from TribeCore HR System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPendingApprovalTemplate(
    approverName: string,
    employeeName: string,
    claimNumber: string,
    amount: number,
    currency: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #F59E0B; margin: 20px 0; }
          .info-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Approval Required</h1>
          </div>
          <div class="content">
            <p>Hi ${approverName},</p>
            <p>A new expense claim requires your approval.</p>
            
            <div class="info-box">
              <p><strong>Employee:</strong> ${employeeName}</p>
              <p><strong>Claim Number:</strong> ${claimNumber}</p>
              <div class="amount">${currency} ${amount.toFixed(2)}</div>
            </div>
            
            <p>Please review and approve or reject this claim.</p>
            
            <a href="${this.configService.get('FRONTEND_URL')}/expenses/approvals" class="button">Review Claim</a>
          </div>
          <div class="footer">
            <p>This is an automated email from TribeCore HR System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getReimbursementProcessedTemplate(
    employeeName: string,
    claimNumber: string,
    amount: number,
    currency: string,
    paymentMethod: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #3B82F6; margin: 20px 0; }
          .badge { background: #DBEAFE; color: #1E40AF; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Reimbursement Processed</h1>
          </div>
          <div class="content">
            <p>Hi ${employeeName},</p>
            <p>Your expense reimbursement has been processed!</p>
            
            <p><strong>Claim Number:</strong> ${claimNumber}</p>
            <div class="amount">${currency} ${amount.toFixed(2)}</div>
            <div class="badge">PAID</div>
            
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p>The funds should appear in your account within 3-5 business days.</p>
            
            <a href="${this.configService.get('FRONTEND_URL')}/expenses/${claimNumber}" class="button">View Payment Details</a>
            
            <p>Thank you!</p>
          </div>
          <div class="footer">
            <p>This is an automated email from TribeCore HR System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBudgetAlertTemplate(
    managerName: string,
    budgetName: string,
    percentUsed: number,
    allocated: number,
    spent: number,
    currency: string,
  ): string {
    const alertColor = percentUsed >= 100 ? '#EF4444' : percentUsed >= 90 ? '#F59E0B' : '#F59E0B';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${alertColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: ${alertColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .progress-bar { background: #E5E7EB; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: ${alertColor}; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
          .stats { display: flex; justify-content: space-between; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: ${alertColor}; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Budget Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${managerName},</p>
            <p>Budget threshold alert for: <strong>${budgetName}</strong></p>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(percentUsed, 100)}%">
                ${percentUsed.toFixed(1)}%
              </div>
            </div>
            
            <div class="stats">
              <div class="stat">
                <div>Allocated</div>
                <div class="stat-value">${currency} ${allocated.toFixed(2)}</div>
              </div>
              <div class="stat">
                <div>Spent</div>
                <div class="stat-value">${currency} ${spent.toFixed(2)}</div>
              </div>
              <div class="stat">
                <div>Remaining</div>
                <div class="stat-value">${currency} ${(allocated - spent).toFixed(2)}</div>
              </div>
            </div>
            
            <p>${percentUsed >= 100 ? 'Budget limit has been reached!' : 'Please review upcoming expenses carefully.'}</p>
            
            <a href="${this.configService.get('FRONTEND_URL')}/expenses/budgets" class="button">View Budget Details</a>
          </div>
          <div class="footer">
            <p>This is an automated email from TribeCore HR System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
