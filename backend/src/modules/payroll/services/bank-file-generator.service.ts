import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';

export interface BankPayment {
  employeeId: string;
  employeeName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  currency: string;
  sortCode?: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  reference: string;
}

export interface BankFileOptions {
  format: 'SEPA' | 'NACHA' | 'NIBSS' | 'SWIFT' | 'BACS';
  companyName: string;
  companyAccountNumber: string;
  companyBankCode?: string;
  companyIBAN?: string;
  paymentDate: Date;
  batchNumber?: string;
}

@Injectable()
export class BankFileGeneratorService {
  private readonly logger = new Logger(BankFileGeneratorService.name);

  async generateFile(
    payments: BankPayment[],
    options: BankFileOptions,
  ): Promise<{ content: string; filename: string }> {
    this.logger.log(`Generating ${options.format} file for ${payments.length} payments`);

    switch (options.format) {
      case 'SEPA':
        return this.generateSEPA(payments, options);
      case 'NACHA':
        return this.generateNACHA(payments, options);
      case 'NIBSS':
        return this.generateNIBSS(payments, options);
      case 'BACS':
        return this.generateBACS(payments, options);
      case 'SWIFT':
        return this.generateSWIFT(payments, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private async generateSEPA(
    payments: BankPayment[],
    options: BankFileOptions,
  ): Promise<{ content: string; filename: string }> {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const msgId = `PAYROLL-${timestamp}`;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${moment().toISOString()}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${totalAmount}</CtrlSum>
      <InitgPty>
        <Nm>${this.escapeXml(options.companyName)}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-${timestamp}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>true</BtchBookg>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${totalAmount}</CtrlSum>
      <ReqdExctnDt>${moment(options.paymentDate).format('YYYY-MM-DD')}</ReqdExctnDt>
      <Dbtr>
        <Nm>${this.escapeXml(options.companyName)}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>${options.companyIBAN}</IBAN>
        </Id>
      </DbtrAcct>
      ${payments.map((p, i) => this.generateSEPATransaction(p, i + 1)).join('\n')}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

    return {
      content: xml,
      filename: `SEPA_${moment(options.paymentDate).format('YYYYMMDD')}_${timestamp}.xml`,
    };
  }

  private generateSEPATransaction(payment: BankPayment, index: number): string {
    return `      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>SALARY-${payment.employeeId}-${index}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="${payment.currency}">${payment.amount.toFixed(2)}</InstdAmt>
        </Amt>
        <CdtrAgt>
          <FinInstnId>
            <BIC>${payment.swiftCode || 'NOTPROVIDED'}</BIC>
          </FinInstnId>
        </CdtrAgt>
        <Cdtr>
          <Nm>${this.escapeXml(payment.employeeName)}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>${payment.iban}</IBAN>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${this.escapeXml(payment.reference)}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
  }

  private async generateNACHA(
    payments: BankPayment[],
    options: BankFileOptions,
  ): Promise<{ content: string; filename: string }> {
    const timestamp = moment().format('YYMMDDHHmm');
    const fileCreationDate = moment().format('YYMMDD');
    const fileCreationTime = moment().format('HHmm');
    const effectiveDate = moment(options.paymentDate).format('YYMMDD');
    
    let batchNumber = parseInt(options.batchNumber || '1');
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    // File Header (Record Type 1)
    let content = '1'; // Record Type
    content += '01'; // Priority Code
    content += this.pad(options.companyBankCode || '', 10, ' ', true); // Immediate Destination
    content += this.pad(options.companyAccountNumber.substring(0, 10), 10, '0'); // Immediate Origin
    content += fileCreationDate;
    content += fileCreationTime;
    content += 'A'; // File ID Modifier
    content += '094'; // Record Size
    content += '10'; // Blocking Factor
    content += '1'; // Format Code
    content += this.pad(options.companyName.substring(0, 23), 23, ' ');
    content += this.pad('', 23, ' '); // Company Discretionary Data
    content += this.pad('', 8, ' '); // Reserved
    content += '\n';

    // Batch Header (Record Type 5)
    content += '5'; // Record Type
    content += '200'; // Service Class Code (Mixed)
    content += this.pad(options.companyName.substring(0, 16), 16, ' ');
    content += this.pad('', 20, ' '); // Company Discretionary Data
    content += this.pad(options.companyAccountNumber.substring(0, 10), 10, '0'); // Company ID
    content += 'PPD'; // Standard Entry Class
    content += this.pad('PAYROLL', 10, ' '); // Entry Description
    content += effectiveDate;
    content += this.pad('', 3, ' '); // Settlement Date
    content += '1'; // Originator Status Code
    content += this.pad(options.companyBankCode || '', 8, '0').substring(0, 8); // Originating DFI
    content += this.pad(batchNumber.toString(), 7, '0');
    content += '\n';

    // Entry Details (Record Type 6)
    let entryHash = 0;
    payments.forEach((payment, index) => {
      const routing = payment.routingNumber || '000000000';
      entryHash += parseInt(routing.substring(0, 8));

      content += '6'; // Record Type
      content += '22'; // Transaction Code (Checking Credit)
      content += this.pad(routing.substring(0, 8), 8, '0');
      content += routing.charAt(8); // Check Digit
      content += this.pad(payment.accountNumber, 17, ' ', true);
      content += this.pad((payment.amount * 100).toFixed(0), 10, '0'); // Amount in cents
      content += this.pad(payment.employeeId, 15, ' ', true); // Individual ID
      content += this.pad(payment.employeeName.substring(0, 22), 22, ' ');
      content += '  '; // Discretionary Data
      content += '0'; // Addenda Record Indicator
      content += this.pad((index + 1).toString(), 15, '0'); // Trace Number
      content += '\n';
    });

    // Batch Control (Record Type 8)
    content += '8'; // Record Type
    content += '200'; // Service Class Code
    content += this.pad(payments.length.toString(), 6, '0'); // Entry/Addenda Count
    content += this.pad((entryHash % 10000000000).toString(), 10, '0'); // Entry Hash
    content += this.pad((totalAmount * 100).toFixed(0), 12, '0'); // Total Debit
    content += this.pad((totalAmount * 100).toFixed(0), 12, '0'); // Total Credit
    content += this.pad(options.companyAccountNumber.substring(0, 10), 10, '0'); // Company ID
    content += this.pad('', 19, ' '); // Message Authentication Code
    content += this.pad('', 6, ' '); // Reserved
    content += this.pad(options.companyBankCode || '', 8, '0').substring(0, 8); // Originating DFI
    content += this.pad(batchNumber.toString(), 7, '0');
    content += '\n';

    // File Control (Record Type 9)
    content += '9'; // Record Type
    content += '000001'; // Batch Count
    content += this.pad('1', 6, '0'); // Block Count
    content += this.pad(payments.length.toString(), 8, '0'); // Entry/Addenda Count
    content += this.pad((entryHash % 10000000000).toString(), 10, '0'); // Entry Hash
    content += this.pad((totalAmount * 100).toFixed(0), 12, '0'); // Total Debit
    content += this.pad((totalAmount * 100).toFixed(0), 12, '0'); // Total Credit
    content += this.pad('', 39, ' '); // Reserved
    content += '\n';

    return {
      content,
      filename: `NACHA_${moment(options.paymentDate).format('YYYYMMDD')}_${timestamp}.txt`,
    };
  }

  private async generateNIBSS(
    payments: BankPayment[],
    options: BankFileOptions,
  ): Promise<{ content: string; filename: string }> {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // CSV format for NIBSS
    let content = 'DEBIT ACCOUNT NUMBER,DEBIT ACCOUNT NAME,BENEFICIARY ACCOUNT NUMBER,';
    content += 'BENEFICIARY NAME,BANK CODE,AMOUNT,NARRATION,PAYMENT REFERENCE\n';

    payments.forEach(payment => {
      content += `${options.companyAccountNumber},`;
      content += `"${options.companyName}",`;
      content += `${payment.accountNumber},`;
      content += `"${payment.employeeName}",`;
      content += `${payment.bankName},`; // Bank code
      content += `${payment.amount.toFixed(2)},`;
      content += `"${payment.reference}",`;
      content += `PAYROLL-${payment.employeeId}\n`;
    });

    return {
      content,
      filename: `NIBSS_${moment(options.paymentDate).format('YYYYMMDD')}_${timestamp}.csv`,
    };
  }

  private async generateBACS(
    payments: BankPayment[],
    options: BankFileOptions,
  ): Promise<{ content: string; filename: string }> {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // Standard 18 format for BACS
    let content = '';
    const processingDate = moment(options.paymentDate).format('YYMMDD');

    // File Header
    content += 'VOL1'; // Volume Header
    content += this.pad('', 76, ' ');
    content += '\n';

    // HDR1
    content += 'HDR1';
    content += this.pad(options.companyName.substring(0, 18), 18, ' ');
    content += processingDate;
    content += this.pad('', 54, ' ');
    content += '\n';

    // Payment records
    payments.forEach(payment => {
      content += '99'; // Transaction Code (Credit)
      content += this.pad(payment.sortCode?.replace(/-/g, '') || '', 6, '0');
      content += this.pad(payment.accountNumber, 8, '0', true);
      content += this.pad((payment.amount * 100).toFixed(0), 11, '0'); // Amount in pence
      content += this.pad(options.companyAccountNumber, 8, '0', true);
      content += this.pad(options.companyBankCode || '', 6, '0');
      content += this.pad(payment.reference.substring(0, 18), 18, ' ');
      content += '\n';
    });

    // File Trailer
    content += 'EOF1';
    content += this.pad(payments.length.toString(), 6, '0');
    content += this.pad('', 70, ' ');
    content += '\n';

    return {
      content,
      filename: `BACS_${moment(options.paymentDate).format('YYYYMMDD')}_${timestamp}.txt`,
    };
  }

  private async generateSWIFT(
    payments: BankPayment[],
    options: BankFileOptions,
  ): Promise<{ content: string; filename: string }> {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // MT103 format for international payments
    let content = '';

    payments.forEach((payment, index) => {
      content += '{1:F01' + (options.companyBankCode || 'XXXXXX') + 'XXXX0000000000}\n';
      content += '{2:I103' + (payment.swiftCode || 'XXXXXXXXXX') + 'N}\n';
      content += '{3:{108:' + `PAYROLL${index + 1}`.padStart(16, '0') + '}}\n';
      content += '{4:\n';
      content += ':20:' + `PAY${payment.employeeId}${index}\n`;
      content += ':23B:CRED\n';
      content += ':32A:' + moment(options.paymentDate).format('YYMMDD') + payment.currency + payment.amount.toFixed(2).replace('.', ',') + '\n';
      content += ':50K:/' + options.companyAccountNumber + '\n';
      content += options.companyName + '\n';
      content += ':59:/' + payment.iban + '\n';
      content += payment.employeeName + '\n';
      content += ':70:' + payment.reference + '\n';
      content += ':71A:SHA\n';
      content += '-}\n\n';
    });

    return {
      content,
      filename: `SWIFT_${moment(options.paymentDate).format('YYYYMMDD')}_${timestamp}.txt`,
    };
  }

  private pad(str: string, length: number, char: string, leftAlign = false): string {
    if (str.length >= length) return str.substring(0, length);
    const padding = char.repeat(length - str.length);
    return leftAlign ? str + padding : padding + str;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
