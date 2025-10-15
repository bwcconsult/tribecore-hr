import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../entities/contract.entity';
import { ContractTemplate } from '../entities/contract-template.entity';
import { ClauseLibrary } from '../entities/clause-library.entity';

export interface DocumentGenerationRequest {
  templateId: string;
  contractData: Record<string, any>;
  clauses?: string[]; // Clause library IDs
  format: 'HTML' | 'PDF' | 'DOCX';
}

export interface GeneratedDocument {
  content: string;
  format: string;
  downloadUrl?: string;
  metadata: {
    generatedAt: Date;
    template: string;
    mergeFieldsUsed: string[];
    clausesIncluded: number;
  };
}

@Injectable()
export class DocumentGenerationService {
  constructor(
    @InjectRepository(ContractTemplate)
    private templateRepository: Repository<ContractTemplate>,
    @InjectRepository(ClauseLibrary)
    private clauseLibraryRepository: Repository<ClauseLibrary>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  /**
   * Generate contract document from template and data
   */
  async generateDocument(request: DocumentGenerationRequest): Promise<GeneratedDocument> {
    // Fetch template
    const template = await this.templateRepository.findOne({
      where: { id: request.templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Fetch clauses if specified
    let clauses: ClauseLibrary[] = [];
    if (request.clauses && request.clauses.length > 0) {
      clauses = await this.clauseLibraryRepository.findByIds(request.clauses);
    } else if (template.defaultClauseKeys && template.defaultClauseKeys.length > 0) {
      clauses = await this.clauseLibraryRepository
        .createQueryBuilder('clause')
        .where('clause.key IN (:...keys)', { keys: template.defaultClauseKeys })
        .getMany();
    }

    // Perform merge
    let content = template.content;
    const mergeFieldsUsed: string[] = [];

    // Replace merge fields in template
    for (const field of template.mergeFields) {
      const fieldName = field.replace(/{{|}}/g, '').trim();
      const value = this.resolveFieldValue(fieldName, request.contractData);

      if (value !== null && value !== undefined) {
        const regex = new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, String(value));
        mergeFieldsUsed.push(fieldName);
      }
    }

    // Insert clauses
    content = this.insertClauses(content, clauses);

    // Format based on requested output
    const formatted = await this.formatDocument(content, request.format);

    return {
      content: formatted,
      format: request.format,
      downloadUrl: this.generateDownloadUrl(formatted, request.format),
      metadata: {
        generatedAt: new Date(),
        template: template.name,
        mergeFieldsUsed,
        clausesIncluded: clauses.length,
      },
    };
  }

  /**
   * Generate contract from existing contract data
   */
  async regenerateContractDocument(contractId: string, format: 'HTML' | 'PDF' | 'DOCX' = 'PDF'): Promise<GeneratedDocument> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['clauses', 'owner'],
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Build contract data object
    const contractData = {
      CONTRACT_NUMBER: contract.contractNumber,
      TITLE: contract.title,
      COUNTERPARTY_NAME: contract.counterpartyName,
      COUNTERPARTY_EMAIL: contract.counterpartyEmail,
      START_DATE: this.formatDate(contract.startDate),
      END_DATE: this.formatDate(contract.endDate),
      VALUE: this.formatCurrency(contract.value, contract.currency),
      JURISDICTION: contract.jurisdiction,
      GOVERNING_LAW: contract.governingLaw,
      OWNER_NAME: contract.owner?.name || 'N/A',
      CURRENT_DATE: this.formatDate(new Date()),
    };

    // Create HTML document
    let html = this.buildContractHTML(contract, contractData);

    // Format to requested type
    const formatted = await this.formatDocument(html, format);

    return {
      content: formatted,
      format,
      downloadUrl: this.generateDownloadUrl(formatted, format),
      metadata: {
        generatedAt: new Date(),
        template: contract.type,
        mergeFieldsUsed: Object.keys(contractData),
        clausesIncluded: contract.clauses?.length || 0,
      },
    };
  }

  /**
   * Resolve nested field values from data object
   */
  private resolveFieldValue(fieldPath: string, data: Record<string, any>): any {
    const parts = fieldPath.split('.');
    let value = data;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Insert clauses into document
   */
  private insertClauses(content: string, clauses: ClauseLibrary[]): string {
    // Look for clause insertion point
    const clausePlaceholder = '{{CLAUSES}}';

    if (content.includes(clausePlaceholder)) {
      let clausesHTML = '<div class="clauses-section">';

      clauses.forEach((clause, index) => {
        clausesHTML += `
          <div class="clause" id="clause-${index + 1}">
            <h3>${index + 1}. ${clause.title}</h3>
            <p>${clause.text}</p>
          </div>
        `;
      });

      clausesHTML += '</div>';
      content = content.replace(clausePlaceholder, clausesHTML);
    } else {
      // Append at end if no placeholder
      let clausesHTML = '<h2>Terms and Conditions</h2>';
      clauses.forEach((clause, index) => {
        clausesHTML += `
          <div class="clause">
            <h3>${index + 1}. ${clause.title}</h3>
            <p>${clause.text}</p>
          </div>
        `;
      });
      content += clausesHTML;
    }

    return content;
  }

  /**
   * Build HTML document from contract
   */
  private buildContractHTML(contract: Contract, data: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.CONTRACT_NUMBER} - ${data.TITLE}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .clause { margin-bottom: 20px; }
          .clause h3 { color: #555; margin-bottom: 10px; }
          .clause p { margin: 0; text-align: justify; }
          .signatures { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-block { border-top: 1px solid #333; padding-top: 10px; }
          .signature-block p { margin: 5px 0; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.TITLE}</h1>
          <p><strong>Contract Number:</strong> ${data.CONTRACT_NUMBER}</p>
          <p><strong>Date:</strong> ${data.CURRENT_DATE}</p>
        </div>

        <div class="section">
          <h2>Parties</h2>
          <p><strong>Party A (The Company):</strong> TribeCore Limited</p>
          <p><strong>Party B (${contract.counterpartyType || 'Counterparty'}):</strong> ${data.COUNTERPARTY_NAME}</p>
          ${data.COUNTERPARTY_EMAIL ? `<p><strong>Email:</strong> ${data.COUNTERPARTY_EMAIL}</p>` : ''}
        </div>

        <div class="section">
          <h2>Contract Terms</h2>
          <p><strong>Type:</strong> ${contract.type}</p>
          <p><strong>Start Date:</strong> ${data.START_DATE}</p>
          <p><strong>End Date:</strong> ${data.END_DATE}</p>
          ${contract.value ? `<p><strong>Contract Value:</strong> ${data.VALUE}</p>` : ''}
          <p><strong>Jurisdiction:</strong> ${data.JURISDICTION}</p>
          ${data.GOVERNING_LAW ? `<p><strong>Governing Law:</strong> ${data.GOVERNING_LAW}</p>` : ''}
        </div>

        <div class="section">
          <h2>Terms and Conditions</h2>
          ${contract.clauses
            ?.map(
              (clause, index) => `
            <div class="clause">
              <h3>${index + 1}. ${clause.title}</h3>
              <p>${clause.text}</p>
            </div>
          `,
            )
            .join('') || '<p>No clauses defined</p>'}
        </div>

        <div class="signatures">
          <div class="signature-block">
            <p><strong>For the Company:</strong></p>
            <p>Signature: _______________________</p>
            <p>Name: ___________________________</p>
            <p>Date: ____________________________</p>
          </div>
          <div class="signature-block">
            <p><strong>For ${data.COUNTERPARTY_NAME}:</strong></p>
            <p>Signature: _______________________</p>
            <p>Name: ___________________________</p>
            <p>Date: ____________________________</p>
          </div>
        </div>

        <div class="footer">
          <p>This document was generated electronically by TribeCore Contract Management System</p>
          <p>Generated on ${data.CURRENT_DATE}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format document to requested output format
   */
  private async formatDocument(html: string, format: 'HTML' | 'PDF' | 'DOCX'): Promise<string> {
    switch (format) {
      case 'HTML':
        return html;
      case 'PDF':
        // In production, use library like puppeteer or pdfmake
        return `[PDF Content - Would be generated using Puppeteer]\n\nSource HTML:\n${html}`;
      case 'DOCX':
        // In production, use library like docx
        return `[DOCX Content - Would be generated using docx library]\n\nSource HTML:\n${html}`;
      default:
        return html;
    }
  }

  /**
   * Generate download URL (mock)
   */
  private generateDownloadUrl(content: string, format: string): string {
    // In production, upload to S3/Azure Blob and return URL
    const timestamp = Date.now();
    return `/api/contracts/documents/download/${timestamp}.${format.toLowerCase()}`;
  }

  /**
   * Format date helper
   */
  private formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /**
   * Format currency helper
   */
  private formatCurrency(value: number | undefined, currency: string = 'GBP'): string {
    if (!value) return 'N/A';
    const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' };
    return `${symbols[currency] || currency} ${value.toLocaleString()}`;
  }
}
