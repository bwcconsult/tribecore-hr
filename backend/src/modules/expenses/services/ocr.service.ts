import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TextractClient,
  AnalyzeExpenseCommand,
  AnalyzeExpenseCommandInput,
  ExpenseDocument,
} from '@aws-sdk/client-textract';
import * as crypto from 'crypto';

export interface OcrResult {
  vendor?: string;
  amount?: number;
  currency?: string;
  date?: string;
  taxAmount?: number;
  subtotal?: number;
  items?: Array<{
    description: string;
    amount: number;
  }>;
  confidence: number;
  rawData: any;
  extractedFields: Map<string, { value: string; confidence: number }>;
}

export interface ReceiptHash {
  hash: string;
  algorithm: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private textractClient: TextractClient;

  constructor(private configService: ConfigService) {
    this.initializeTextract();
  }

  private initializeTextract() {
    const region = this.configService.get('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (accessKeyId && secretAccessKey) {
      this.textractClient = new TextractClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('AWS Textract initialized successfully');
    } else {
      this.logger.warn('AWS credentials not found. OCR functionality will be limited.');
    }
  }

  /**
   * Analyze a receipt image using AWS Textract
   */
  async analyzeReceipt(imageBuffer: Buffer): Promise<OcrResult> {
    if (!this.textractClient) {
      throw new Error('AWS Textract is not configured. Please set AWS credentials.');
    }

    try {
      const input: AnalyzeExpenseCommandInput = {
        Document: {
          Bytes: imageBuffer,
        },
      };

      const command = new AnalyzeExpenseCommand(input);
      const response = await this.textractClient.send(command);

      this.logger.log('Receipt analyzed successfully');

      return this.parseTextractResponse(response);
    } catch (error) {
      this.logger.error(`Failed to analyze receipt: ${error.message}`, error.stack);
      throw new Error(`OCR analysis failed: ${error.message}`);
    }
  }

  /**
   * Parse AWS Textract response into structured data
   */
  private parseTextractResponse(response: any): OcrResult {
    const extractedFields = new Map<string, { value: string; confidence: number }>();
    let totalConfidence = 0;
    let fieldCount = 0;

    // Extract expense documents
    const expenseDocuments: ExpenseDocument[] = response.ExpenseDocuments || [];

    let vendor: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;
    let date: string | undefined;
    let taxAmount: number | undefined;
    let subtotal: number | undefined;
    const items: Array<{ description: string; amount: number }> = [];

    expenseDocuments.forEach(doc => {
      // Extract summary fields
      doc.SummaryFields?.forEach(field => {
        const type = field.Type?.Text || '';
        const value = field.ValueDetection?.Text || '';
        const confidence = field.ValueDetection?.Confidence || 0;

        extractedFields.set(type, { value, confidence });
        totalConfidence += confidence;
        fieldCount++;

        // Map to specific fields
        switch (type.toUpperCase()) {
          case 'VENDOR_NAME':
          case 'NAME':
            vendor = value;
            break;
          case 'TOTAL':
          case 'AMOUNT_PAID':
            amount = this.parseAmount(value);
            break;
          case 'INVOICE_RECEIPT_DATE':
          case 'DATE':
            date = this.parseDate(value);
            break;
          case 'TAX':
          case 'VAT':
          case 'GST':
            taxAmount = this.parseAmount(value);
            break;
          case 'SUBTOTAL':
            subtotal = this.parseAmount(value);
            break;
          case 'CURRENCY':
            currency = value;
            break;
        }
      });

      // Extract line items
      doc.LineItemGroups?.forEach(group => {
        group.LineItems?.forEach(lineItem => {
          const description =
            lineItem.LineItemExpenseFields?.find(f => f.Type?.Text === 'ITEM')?.ValueDetection
              ?.Text || 'Unknown Item';
          const itemAmount =
            this.parseAmount(
              lineItem.LineItemExpenseFields?.find(f => f.Type?.Text === 'PRICE')?.ValueDetection
                ?.Text || '0',
            ) || 0;

          if (itemAmount > 0) {
            items.push({ description, amount: itemAmount });
          }
        });
      });
    });

    // Calculate average confidence
    const confidence = fieldCount > 0 ? totalConfidence / fieldCount : 0;

    // Infer currency if not detected (default to GBP for UK)
    if (!currency) {
      currency = this.configService.get('DEFAULT_CURRENCY', 'GBP');
    }

    return {
      vendor,
      amount,
      currency,
      date,
      taxAmount,
      subtotal,
      items: items.length > 0 ? items : undefined,
      confidence,
      rawData: response,
      extractedFields,
    };
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(amountStr: string): number | undefined {
    if (!amountStr) return undefined;

    // Remove currency symbols and whitespace
    const cleaned = amountStr.replace(/[£$€¥₹\s,]/g, '');

    // Try to parse as number
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateStr: string): string | undefined {
    if (!dateStr) return undefined;

    try {
      // Try various date formats
      const formats = [
        // DD/MM/YYYY
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        // DD-MM-YYYY
        /(\d{1,2})-(\d{1,2})-(\d{4})/,
        // MM/DD/YYYY
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        // YYYY-MM-DD
        /(\d{4})-(\d{1,2})-(\d{1,2})/,
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          // Try to create a valid date
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }

      // Fallback: try native Date parsing
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      this.logger.warn(`Failed to parse date: ${dateStr}`);
    }

    return undefined;
  }

  /**
   * Generate hash for duplicate detection
   */
  generateImageHash(imageBuffer: Buffer): ReceiptHash {
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

    return {
      hash,
      algorithm: 'sha256',
    };
  }

  /**
   * Simple OCR fallback using basic text extraction
   * (For testing without AWS credentials)
   */
  async analyzeReceiptFallback(imageBuffer: Buffer): Promise<OcrResult> {
    // Generate a basic mock result for development
    this.logger.warn('Using fallback OCR (AWS Textract not configured)');

    const hash = this.generateImageHash(imageBuffer);

    return {
      vendor: 'Unknown Vendor',
      amount: 0,
      currency: 'GBP',
      date: new Date().toISOString().split('T')[0],
      confidence: 0,
      rawData: { fallback: true, hash: hash.hash },
      extractedFields: new Map(),
    };
  }

  /**
   * Validate OCR result
   */
  validateOcrResult(result: OcrResult): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!result.amount || result.amount <= 0) {
      errors.push('Amount is required and must be greater than 0');
    }

    if (!result.date) {
      errors.push('Date is required');
    }

    if (result.confidence < 50) {
      errors.push('Low confidence score - manual review recommended');
    }

    if (!result.vendor) {
      errors.push('Vendor name not detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract text from image using Textract (general text detection)
   */
  async extractText(imageBuffer: Buffer): Promise<string> {
    if (!this.textractClient) {
      throw new Error('AWS Textract is not configured');
    }

    try {
      // For simple text extraction, we'd use DetectDocumentText
      // This is a simpler alternative to AnalyzeExpense
      const { DetectDocumentTextCommand } = await import('@aws-sdk/client-textract');

      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: imageBuffer,
        },
      });

      const response = await this.textractClient.send(command);

      // Extract all text blocks
      const textBlocks = response.Blocks?.filter(block => block.BlockType === 'LINE')
        .map(block => block.Text)
        .filter(text => text) || [];

      return textBlocks.join('\n');
    } catch (error) {
      this.logger.error(`Failed to extract text: ${error.message}`, error.stack);
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  /**
   * Check if image format is supported
   */
  isSupportedFormat(mimeType: string): boolean {
    const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'application/pdf'];
    return supported.includes(mimeType.toLowerCase());
  }

  /**
   * Check if image size is within limits
   */
  isValidSize(sizeInBytes: number): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return sizeInBytes <= maxSize;
  }
}
