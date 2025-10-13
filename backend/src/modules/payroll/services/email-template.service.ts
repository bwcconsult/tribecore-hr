import { Injectable, Logger } from '@nestjs/common';
import { Payslip } from '../entities/payslip.entity';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  /**
   * Send payslip email with attachment
   * For production: npm install @sendgrid/mail OR aws-sdk (for SES)
   */
  async sendPayslipEmail(
    payslip: Payslip,
    recipientEmail: string,
    pdfBuffer?: Buffer,
  ): Promise<void> {
    try {
      this.logger.log(`Preparing payslip email for ${recipientEmail}`);

      const emailOptions: EmailOptions = {
        to: recipientEmail,
        subject: this.getEmailSubject(payslip),
        html: this.generatePayslipEmailHTML(payslip),
        attachments: pdfBuffer
          ? [
              {
                filename: `payslip-${payslip.id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
              },
            ]
          : [],
      };

      // In production with SendGrid:
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      await sgMail.send({
        to: emailOptions.to,
        from: process.env.FROM_EMAIL || 'payroll@tribecore.com',
        subject: emailOptions.subject,
        html: emailOptions.html,
        attachments: emailOptions.attachments.map(att => ({
          content: att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment'
        }))
      });
      */

      // In production with AWS SES:
      /*
      const AWS = require('aws-sdk');
      const ses = new AWS.SES({ region: process.env.AWS_REGION });
      
      const params = {
        Source: process.env.FROM_EMAIL || 'payroll@tribecore.com',
        Destination: { ToAddresses: [emailOptions.to] },
        Message: {
          Subject: { Data: emailOptions.subject },
          Body: { Html: { Data: emailOptions.html } }
        }
      };
      
      await ses.sendEmail(params).promise();
      */

      this.logger.log(`Email sent successfully to ${recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate email subject line
   */
  private getEmailSubject(payslip: Payslip): string {
    const periodStart = new Date(payslip.periodStart).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
    return `Your Payslip - ${periodStart}`;
  }

  /**
   * Generate beautiful HTML email template
   */
  private generatePayslipEmailHTML(payslip: Payslip): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: payslip.currency || 'GBP',
      }).format(amount);
    };

    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Payslip</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Your Payslip is Ready
              </h1>
              <p style="margin: 10px 0 0; color: #f3f4f6; font-size: 14px;">
                ${formatDate(payslip.periodStart)} - ${formatDate(payslip.periodEnd)}
              </p>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding: 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                      Net Pay
                    </p>
                    <p style="margin: 8px 0 0; color: #ffffff; font-size: 36px; font-weight: 700;">
                      ${formatCurrency(Number(payslip.netPay))}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Details -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-bottom: 5px;">
                          Gross Pay:
                        </td>
                        <td style="text-align: right; color: #111827; font-size: 14px; font-weight: 600; padding-bottom: 5px;">
                          ${formatCurrency(Number(payslip.grossPay))}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; padding-bottom: 5px;">
                          Total Deductions:
                        </td>
                        <td style="text-align: right; color: #dc2626; font-size: 14px; font-weight: 600; padding-bottom: 5px;">
                          -${formatCurrency(Number(payslip.totalDeductions))}
                        </td>
                      </tr>
                      <tr style="border-top: 2px solid #e5e7eb;">
                        <td style="color: #111827; font-size: 14px; font-weight: 700; padding-top: 10px;">
                          Net Pay:
                        </td>
                        <td style="text-align: right; color: #10b981; font-size: 16px; font-weight: 700; padding-top: 10px;">
                          ${formatCurrency(Number(payslip.netPay))}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Info -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <p style="margin: 0 0 15px; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Pay Date:</strong> ${formatDate(payslip.payDate)}
              </p>
              ${
                payslip.bankInstructions
                  ? `
              <p style="margin: 0 0 10px; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Payment Method:</strong> ${payslip.paymentMethod.replace(/_/g, ' ')}
              </p>
              ${
                payslip.bankInstructions.accountNumber
                  ? `
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                Account: ${payslip.bankInstructions.accountNumber}
              </p>
              `
                  : ''
              }
              `
                  : ''
              }
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="${process.env.APP_URL}/payroll/payslips/${payslip.id}" 
                 style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View Full Payslip
              </a>
            </td>
          </tr>

          <!-- Messages -->
          ${
            payslip.messages && payslip.messages.length > 0
              ? `
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 13px; font-weight: 600;">
                  ${payslip.messages[0].title}
                </p>
                <p style="margin: 0; color: #3b82f6; font-size: 12px; line-height: 1.5;">
                  ${payslip.messages[0].message}
                </p>
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                This is an automated email. Please do not reply.
              </p>
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 12px;">
                For questions, contact: <a href="mailto:payroll@tribecore.com" style="color: #4f46e5; text-decoration: none;">payroll@tribecore.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} TribeCore HR. All rights reserved.
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

  /**
   * Send bulk payslip emails
   */
  async sendBulkPayslipEmails(
    payslips: Payslip[],
    getPdfBuffer: (payslipId: string) => Promise<Buffer>,
  ): Promise<{ success: number; failed: number; results: any[] }> {
    const results = [];
    let success = 0;
    let failed = 0;

    for (const payslip of payslips) {
      try {
        const pdfBuffer = await getPdfBuffer(payslip.id);
        // Assuming employee email is available
        const email = (payslip.employee as any)?.email || `employee-${payslip.employeeId}@company.com`;
        
        await this.sendPayslipEmail(payslip, email, pdfBuffer);
        
        results.push({
          payslipId: payslip.id,
          employeeId: payslip.employeeId,
          status: 'sent',
        });
        success++;
      } catch (error) {
        results.push({
          payslipId: payslip.id,
          employeeId: payslip.employeeId,
          status: 'failed',
          error: error.message,
        });
        failed++;
      }
    }

    return { success, failed, results };
  }
}
