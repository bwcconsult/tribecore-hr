import { Injectable, Logger } from '@nestjs/common';

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface InterviewInvite {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewType: string;
  interviewDate: Date;
  interviewTime: string;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  companyName: string;
}

export interface OfferLetterEmail {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  baseSalary: number;
  currency: string;
  startDate: Date;
  offerPdfUrl: string;
  expiresAt: Date;
  companyName: string;
}

@Injectable()
export class EmailIntegrationService {
  private readonly logger = new Logger(EmailIntegrationService.name);

  /**
   * Send interview invitation email
   */
  async sendInterviewInvite(params: InterviewInvite): Promise<boolean> {
    try {
      const email: EmailTemplate = {
        to: params.candidateEmail,
        subject: `Interview Invitation - ${params.jobTitle} at ${params.companyName}`,
        body: this.generateInterviewInviteText(params),
        html: this.generateInterviewInviteHtml(params),
      };

      await this.sendEmail(email);
      this.logger.log(`Interview invite sent to ${params.candidateEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send interview invite: ${error.message}`);
      return false;
    }
  }

  /**
   * Send offer letter email
   */
  async sendOfferLetter(params: OfferLetterEmail): Promise<boolean> {
    try {
      const email: EmailTemplate = {
        to: params.candidateEmail,
        subject: `Job Offer - ${params.jobTitle} at ${params.companyName}`,
        body: this.generateOfferLetterText(params),
        html: this.generateOfferLetterHtml(params),
      };

      await this.sendEmail(email);
      this.logger.log(`Offer letter sent to ${params.candidateEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send offer letter: ${error.message}`);
      return false;
    }
  }

  /**
   * Send rejection email
   */
  async sendRejectionEmail(params: {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
    feedback?: string;
  }): Promise<boolean> {
    try {
      const email: EmailTemplate = {
        to: params.candidateEmail,
        subject: `Update on your ${params.jobTitle} application`,
        body: this.generateRejectionText(params),
        html: this.generateRejectionHtml(params),
      };

      await this.sendEmail(email);
      this.logger.log(`Rejection email sent to ${params.candidateEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send rejection email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send scorecard reminder
   */
  async sendScorecardReminder(params: {
    interviewerName: string;
    interviewerEmail: string;
    candidateName: string;
    jobTitle: string;
    interviewDate: Date;
    dueDate: Date;
    scorecardUrl: string;
  }): Promise<boolean> {
    try {
      const email: EmailTemplate = {
        to: params.interviewerEmail,
        subject: `Scorecard Due: ${params.candidateName} - ${params.jobTitle}`,
        body: `Hi ${params.interviewerName},\n\nThis is a reminder to submit your interview feedback for ${params.candidateName}.\n\nInterview Date: ${params.interviewDate.toLocaleDateString()}\nDue Date: ${params.dueDate.toLocaleDateString()}\n\nSubmit your feedback here: ${params.scorecardUrl}\n\nThank you!`,
        html: this.generateScorecardReminderHtml(params),
      };

      await this.sendEmail(email);
      this.logger.log(`Scorecard reminder sent to ${params.interviewerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send scorecard reminder: ${error.message}`);
      return false;
    }
  }

  /**
   * Core email sending method (integrate with SendGrid, AWS SES, etc.)
   */
  private async sendEmail(email: EmailTemplate): Promise<void> {
    // TODO: Integrate with email provider
    // Option 1: SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(email);

    // Option 2: AWS SES
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: 'us-east-1' });
    // await ses.sendEmail(...).promise();

    // Option 3: Nodemailer (SMTP)
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail(email);

    // For now, just log
    this.logger.debug(`Email would be sent to: ${email.to}`);
    this.logger.debug(`Subject: ${email.subject}`);
  }

  // Template generators

  private generateInterviewInviteText(params: InterviewInvite): string {
    return `
Dear ${params.candidateName},

We are pleased to invite you for an interview for the ${params.jobTitle} position at ${params.companyName}.

Interview Details:
- Type: ${params.interviewType}
- Date: ${params.interviewDate.toLocaleDateString()}
- Time: ${params.interviewTime}
${params.location ? `- Location: ${params.location}` : ''}
${params.meetingLink ? `- Video Meeting: ${params.meetingLink}` : ''}
- Interviewers: ${params.interviewers.join(', ')}

Please confirm your attendance at your earliest convenience.

We look forward to meeting you!

Best regards,
${params.companyName} Talent Team
    `.trim();
  }

  private generateInterviewInviteHtml(params: InterviewInvite): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .details { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Interview Invitation</h1>
    </div>
    <div class="content">
      <p>Dear ${params.candidateName},</p>
      <p>We are pleased to invite you for an interview for the <strong>${params.jobTitle}</strong> position at ${params.companyName}.</p>
      
      <div class="details">
        <h3>Interview Details</h3>
        <ul>
          <li><strong>Type:</strong> ${params.interviewType}</li>
          <li><strong>Date:</strong> ${params.interviewDate.toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${params.interviewTime}</li>
          ${params.location ? `<li><strong>Location:</strong> ${params.location}</li>` : ''}
          ${params.meetingLink ? `<li><strong>Video Meeting:</strong> <a href="${params.meetingLink}">Join Meeting</a></li>` : ''}
          <li><strong>Interviewers:</strong> ${params.interviewers.join(', ')}</li>
        </ul>
      </div>

      <p>Please confirm your attendance at your earliest convenience.</p>
      <p>We look forward to meeting you!</p>
      
      <p>Best regards,<br>${params.companyName} Talent Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generateOfferLetterText(params: OfferLetterEmail): string {
    return `
Dear ${params.candidateName},

Congratulations! We are delighted to offer you the position of ${params.jobTitle} at ${params.companyName}.

Offer Details:
- Base Salary: ${params.currency} ${params.baseSalary.toLocaleString()}
- Start Date: ${params.startDate.toLocaleDateString()}
- Offer Expires: ${params.expiresAt.toLocaleDateString()}

Please review the attached offer letter and respond by ${params.expiresAt.toLocaleDateString()}.

View full offer: ${params.offerPdfUrl}

We're excited to have you join our team!

Best regards,
${params.companyName} HR Team
    `.trim();
  }

  private generateOfferLetterHtml(params: OfferLetterEmail): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f0fdf4; }
    .offer-box { background: white; padding: 20px; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Job Offer</h1>
    </div>
    <div class="content">
      <p>Dear ${params.candidateName},</p>
      <p>Congratulations! We are delighted to offer you the position of <strong>${params.jobTitle}</strong> at ${params.companyName}.</p>
      
      <div class="offer-box">
        <h3>Offer Summary</h3>
        <ul>
          <li><strong>Position:</strong> ${params.jobTitle}</li>
          <li><strong>Base Salary:</strong> ${params.currency} ${params.baseSalary.toLocaleString()}</li>
          <li><strong>Start Date:</strong> ${params.startDate.toLocaleDateString()}</li>
          <li><strong>Offer Expires:</strong> ${params.expiresAt.toLocaleDateString()}</li>
        </ul>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${params.offerPdfUrl}" class="button">View Full Offer Letter</a>
      </p>

      <p>Please review the full offer letter and respond by <strong>${params.expiresAt.toLocaleDateString()}</strong>.</p>
      <p>We're excited to have you join our team!</p>
      
      <p>Best regards,<br>${params.companyName} HR Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generateRejectionText(params: any): string {
    return `
Dear ${params.candidateName},

Thank you for your interest in the ${params.jobTitle} position at ${params.companyName} and for taking the time to interview with us.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

${params.feedback ? `\n${params.feedback}\n` : ''}

We appreciate your interest in ${params.companyName} and wish you the best in your job search.

Best regards,
${params.companyName} Talent Team
    `.trim();
  }

  private generateRejectionHtml(params: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6b7280; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
    </div>
    <div class="content">
      <p>Dear ${params.candidateName},</p>
      <p>Thank you for your interest in the ${params.jobTitle} position at ${params.companyName} and for taking the time to interview with us.</p>
      <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
      ${params.feedback ? `<p>${params.feedback}</p>` : ''}
      <p>We appreciate your interest in ${params.companyName} and wish you the best in your job search.</p>
      <p>Best regards,<br>${params.companyName} Talent Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generateScorecardReminderHtml(params: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fffbeb; }
    .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Scorecard Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${params.interviewerName},</p>
      <p>This is a reminder to submit your interview feedback for <strong>${params.candidateName}</strong> (${params.jobTitle}).</p>
      <ul>
        <li><strong>Interview Date:</strong> ${params.interviewDate.toLocaleDateString()}</li>
        <li><strong>Due Date:</strong> ${params.dueDate.toLocaleDateString()}</li>
      </ul>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${params.scorecardUrl}" class="button">Submit Feedback</a>
      </p>
      <p>Thank you for your prompt attention to this!</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
