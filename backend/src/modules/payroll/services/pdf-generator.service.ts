import { Injectable, Logger } from '@nestjs/common';
import { Payslip } from '../entities/payslip.entity';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  /**
   * Generate a beautiful PDF payslip
   * This implementation uses HTML-to-PDF approach
   * For production, install: npm install puppeteer OR npm install pdf-lib
   */
  async generatePayslipPDF(payslip: Payslip): Promise<Buffer> {
    try {
      this.logger.log(`Generating PDF for payslip ${payslip.id}`);

      // Generate HTML content
      const html = this.generatePayslipHTML(payslip);

      // In production with Puppeteer:
      /*
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html);
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      await browser.close();
      return pdfBuffer;
      */

      // In production with pdf-lib:
      /*
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      
      // Add content, styling, etc.
      // ... (see pdf-lib documentation)
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      */

      // For now, return HTML as buffer (can be rendered in browser)
      return Buffer.from(html, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to generate PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate QR code for payslip verification
   */
  async generateQRCode(payslipId: string, signature: string): Promise<string> {
    const verificationData = `${process.env.APP_URL}/verify-payslip?id=${payslipId}&sig=${signature.substring(0, 16)}`;

    // In production with qrcode library:
    /*
    const QRCode = require('qrcode');
    const qrCodeDataURL = await QRCode.toDataURL(verificationData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
    */

    // Placeholder - returns data URL that can be embedded
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  }

  /**
   * Generate beautiful HTML payslip
   */
  private generatePayslipHTML(payslip: Payslip): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: payslip.currency || 'GBP',
      }).format(amount);
    };

    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${payslip.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #f5f5f5;
    }
    
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #4F46E5;
    }
    
    .company-info h1 {
      font-size: 28px;
      color: #4F46E5;
      margin-bottom: 5px;
    }
    
    .company-info p {
      color: #666;
      font-size: 11px;
    }
    
    .payslip-title {
      text-align: right;
    }
    
    .payslip-title h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 5px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      background: ${payslip.status === 'ISSUED' ? '#10B981' : '#6B7280'};
      color: white;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #F9FAFB;
      border-radius: 8px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 10px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }
    
    .summary-box {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      margin-bottom: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-label {
      font-size: 11px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    
    .summary-value {
      font-size: 22px;
      font-weight: bold;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E5E7EB;
      display: flex;
      align-items: center;
    }
    
    .section-icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      background: #4F46E5;
      border-radius: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    thead {
      background: #F9FAFB;
    }
    
    th {
      padding: 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #E5E7EB;
    }
    
    th.right, td.right {
      text-align: right;
    }
    
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #F3F4F6;
    }
    
    tr:hover {
      background: #FAFAFA;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 600;
      margin-left: 6px;
    }
    
    .badge-taxable {
      background: #FEF3C7;
      color: #92400E;
    }
    
    .badge-pensionable {
      background: #DBEAFE;
      color: #1E40AF;
    }
    
    .total-row {
      font-weight: 700;
      background: #F9FAFB;
      font-size: 13px;
    }
    
    .total-row td {
      padding: 15px 12px;
      border-top: 2px solid #E5E7EB;
      border-bottom: 2px solid #E5E7EB;
    }
    
    .deduction-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      margin-bottom: 8px;
      background: #F9FAFB;
      border-radius: 6px;
    }
    
    .deduction-label {
      color: #374151;
      font-size: 12px;
    }
    
    .deduction-amount {
      color: #DC2626;
      font-weight: 600;
      font-size: 12px;
    }
    
    .contribution-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      margin-bottom: 8px;
      background: #F5F3FF;
      border-radius: 6px;
    }
    
    .contribution-amount {
      color: #7C3AED;
      font-weight: 600;
      font-size: 12px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 10px;
    }
    
    .qr-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 15px;
      background: #F9FAFB;
      border-radius: 8px;
    }
    
    .qr-code {
      width: 100px;
      height: 100px;
      background: #E5E7EB;
      border-radius: 8px;
    }
    
    .verification-text {
      flex: 1;
      padding-left: 20px;
      font-size: 10px;
      color: #6B7280;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .payslip-container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>TribeCore HR</h1>
        <p>Professional Payroll Services</p>
        <p>www.tribecore.com</p>
      </div>
      <div class="payslip-title">
        <h2>PAYSLIP</h2>
        <span class="status-badge">${payslip.status}</span>
        ${payslip.version > 1 ? `<p style="font-size: 10px; color: #6B7280; margin-top: 5px;">Version ${payslip.version}</p>` : ''}
      </div>
    </div>

    <!-- Employee & Period Info -->
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Employee ID</span>
        <span class="info-value">${payslip.employeeId}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Pay Period</span>
        <span class="info-value">${formatDate(payslip.periodStart)} - ${formatDate(payslip.periodEnd)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Pay Date</span>
        <span class="info-value">${formatDate(payslip.payDate)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Country</span>
        <span class="info-value">${payslip.country} (${payslip.currency})</span>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-box">
      <div class="summary-item">
        <div class="summary-label">Gross Pay</div>
        <div class="summary-value">${formatCurrency(Number(payslip.grossPay))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Deductions</div>
        <div class="summary-value">-${formatCurrency(Number(payslip.totalDeductions))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Net Pay</div>
        <div class="summary-value">${formatCurrency(Number(payslip.netPay))}</div>
      </div>
    </div>

    <!-- Earnings -->
    ${payslip.earnings && payslip.earnings.length > 0 ? `
    <div class="section">
      <h3 class="section-title">
        <span class="section-icon"></span>
        Earnings
      </h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="right">Qty</th>
            <th class="right">Rate</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${payslip.earnings.map(earning => `
          <tr>
            <td>
              ${earning.label}
              ${earning.taxable ? '<span class="badge badge-taxable">Taxable</span>' : ''}
              ${earning.pensionable ? '<span class="badge badge-pensionable">Pensionable</span>' : ''}
            </td>
            <td class="right">${earning.qty} ${earning.units}</td>
            <td class="right">${formatCurrency(Number(earning.rate))}</td>
            <td class="right">${formatCurrency(Number(earning.periodAmount))}</td>
          </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3">Total Earnings</td>
            <td class="right">${formatCurrency(payslip.earnings.reduce((sum, e) => sum + Number(e.periodAmount), 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    ` : ''}

    <!-- Deductions -->
    <div class="section">
      <h3 class="section-title">
        <span class="section-icon"></span>
        Deductions
      </h3>
      
      ${payslip.taxes && payslip.taxes.length > 0 ? `
      <h4 style="font-size: 13px; color: #6B7280; margin-bottom: 10px;">Taxes</h4>
      ${payslip.taxes.map(tax => `
      <div class="deduction-item">
        <span class="deduction-label">${tax.taxCode} (${tax.jurisdiction})</span>
        <span class="deduction-amount">-${formatCurrency(Number(tax.amount))}</span>
      </div>
      `).join('')}
      ` : ''}
      
      <div class="deduction-item" style="margin-top: 15px; background: #FEE2E2;">
        <span class="deduction-label" style="font-weight: 700;">Total Deductions</span>
        <span class="deduction-amount" style="font-size: 14px; font-weight: 700;">-${formatCurrency(Number(payslip.totalDeductions))}</span>
      </div>
    </div>

    <!-- Employer Contributions -->
    ${payslip.employerContributions && payslip.employerContributions.length > 0 ? `
    <div class="section">
      <h3 class="section-title">
        <span class="section-icon"></span>
        Employer Contributions (Not deducted from your pay)
      </h3>
      ${payslip.employerContributions.map(contrib => `
      <div class="contribution-item">
        <span class="deduction-label">${contrib.label}</span>
        <span class="contribution-amount">${formatCurrency(Number(contrib.amount))}</span>
      </div>
      `).join('')}
      <div class="contribution-item" style="background: #EDE9FE;">
        <span class="deduction-label" style="font-weight: 700;">Total Employer Contributions</span>
        <span class="contribution-amount" style="font-weight: 700;">${formatCurrency(Number(payslip.totalEmployerContributions))}</span>
      </div>
    </div>
    ` : ''}

    <!-- Footer with QR Code -->
    <div class="qr-section">
      <div class="qr-code">
        <!-- QR Code would be inserted here -->
      </div>
      <div class="verification-text">
        <p><strong>Verify this payslip:</strong></p>
        <p>Scan the QR code or visit our verification portal</p>
        <p style="margin-top: 8px; font-family: monospace; font-size: 9px;">
          Signature: ${payslip.signedBy ? payslip.signedBy.substring(0, 32) + '...' : 'N/A'}
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Generated:</strong> ${formatDate(payslip.generatedAt || payslip.createdAt)}</p>
      <p style="margin-top: 10px;">This is a computer-generated document. No signature is required.</p>
      <p>For queries, contact: payroll@tribecore.com</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
