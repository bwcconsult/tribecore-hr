import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';

export interface AuditReport {
  reportId: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalEmployees: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalTax: number;
    totalEmployerContributions: number;
    totalDeductions: number;
  };
  breakdown: {
    byDepartment: Array<{
      department: string;
      employeeCount: number;
      totalCost: number;
    }>;
    byCountry: Array<{
      country: string;
      employeeCount: number;
      totalCost: number;
    }>;
    byCurrency: Array<{
      currency: string;
      totalAmount: number;
    }>;
  };
  compliance: {
    taxFiled: boolean;
    statutoryReports: string[];
    filingDeadlines: Array<{
      type: string;
      deadline: Date;
      status: 'PENDING' | 'FILED' | 'OVERDUE';
    }>;
  };
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
  }>;
}

export interface GeneralLedgerExport {
  entries: Array<{
    date: Date;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    description: string;
    reference: string;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
  };
  format: 'CSV' | 'XML' | 'JSON';
}

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);

  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async generateAuditReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditReport> {
    this.logger.log(`Generating audit report for ${organizationId} from ${startDate} to ${endDate}`);

    const payrolls = await this.payrollRepository.find({
      where: {
        organizationId,
        payDate: Between(startDate, endDate),
      },
      relations: ['employee', 'employee.department'],
    });

    const summary = this.calculateSummary(payrolls);
    const breakdown = this.calculateBreakdown(payrolls);
    const compliance = this.generateComplianceInfo(startDate, endDate);
    const auditTrail = this.generateAuditTrail(payrolls);

    return {
      reportId: `AUDIT-${Date.now()}`,
      generatedAt: new Date(),
      period: { startDate, endDate },
      summary,
      breakdown,
      compliance,
      auditTrail,
    };
  }

  async exportGeneralLedger(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    format: 'CSV' | 'XML' | 'JSON' = 'CSV',
  ): Promise<GeneralLedgerExport> {
    this.logger.log(`Exporting general ledger for ${organizationId}`);

    const payrolls = await this.payrollRepository.find({
      where: {
        organizationId,
        payDate: Between(startDate, endDate),
      },
      relations: ['employee'],
    });

    const entries = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const payroll of payrolls) {
      const employeeName = `${payroll.employee?.firstName} ${payroll.employee?.lastName}`;

      // Salary Expense (Debit)
      entries.push({
        date: payroll.payDate,
        accountCode: '5100',
        accountName: 'Salaries & Wages Expense',
        debit: Number(payroll.grossPay),
        credit: 0,
        description: `Salary for ${employeeName}`,
        reference: `PAY-${payroll.id}`,
      });
      totalDebits += Number(payroll.grossPay);

      // Employer Pension Contribution (Debit)
      const employerPension = Number(payroll.pensionContribution);
      entries.push({
        date: payroll.payDate,
        accountCode: '5110',
        accountName: 'Pension Contributions - Employer',
        debit: employerPension,
        credit: 0,
        description: `Employer pension for ${employeeName}`,
        reference: `PAY-${payroll.id}`,
      });
      totalDebits += employerPension;

      // Tax Withholding (Credit)
      entries.push({
        date: payroll.payDate,
        accountCode: '2100',
        accountName: 'Tax Payable',
        debit: 0,
        credit: Number(payroll.incomeTax),
        description: `Tax withheld for ${employeeName}`,
        reference: `PAY-${payroll.id}`,
      });
      totalCredits += Number(payroll.incomeTax);

      // Pension Payable (Credit)
      entries.push({
        date: payroll.payDate,
        accountCode: '2110',
        accountName: 'Pension Payable',
        debit: 0,
        credit: Number(payroll.pensionContribution) * 2, // Employee + Employer
        description: `Pension payable for ${employeeName}`,
        reference: `PAY-${payroll.id}`,
      });
      totalCredits += Number(payroll.pensionContribution) * 2;

      // Net Salary Payable (Credit)
      entries.push({
        date: payroll.payDate,
        accountCode: '2200',
        accountName: 'Salaries Payable',
        debit: 0,
        credit: Number(payroll.netPay),
        description: `Net salary payable to ${employeeName}`,
        reference: `PAY-${payroll.id}`,
      });
      totalCredits += Number(payroll.netPay);
    }

    return {
      entries,
      totals: {
        totalDebits: Math.round(totalDebits * 100) / 100,
        totalCredits: Math.round(totalCredits * 100) / 100,
      },
      format,
    };
  }

  async exportToCSV(glExport: GeneralLedgerExport): Promise<string> {
    const headers = 'Date,Account Code,Account Name,Debit,Credit,Description,Reference\n';
    const rows = glExport.entries
      .map(
        entry =>
          `${entry.date.toISOString().split('T')[0]},${entry.accountCode},"${entry.accountName}",${entry.debit},${entry.credit},"${entry.description}",${entry.reference}`,
      )
      .join('\n');

    return headers + rows;
  }

  async exportToXML(glExport: GeneralLedgerExport): Promise<string> {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<GeneralLedger>\n';
    xml += `  <TotalDebits>${glExport.totals.totalDebits}</TotalDebits>\n`;
    xml += `  <TotalCredits>${glExport.totals.totalCredits}</TotalCredits>\n`;
    xml += '  <Entries>\n';

    for (const entry of glExport.entries) {
      xml += '    <Entry>\n';
      xml += `      <Date>${entry.date.toISOString().split('T')[0]}</Date>\n`;
      xml += `      <AccountCode>${entry.accountCode}</AccountCode>\n`;
      xml += `      <AccountName>${this.escapeXml(entry.accountName)}</AccountName>\n`;
      xml += `      <Debit>${entry.debit}</Debit>\n`;
      xml += `      <Credit>${entry.credit}</Credit>\n`;
      xml += `      <Description>${this.escapeXml(entry.description)}</Description>\n`;
      xml += `      <Reference>${entry.reference}</Reference>\n`;
      xml += '    </Entry>\n';
    }

    xml += '  </Entries>\n';
    xml += '</GeneralLedger>';

    return xml;
  }

  async generateComplianceChecklist(
    organizationId: string,
    period: Date,
  ): Promise<any> {
    const month = period.getMonth();
    const year = period.getFullYear();

    return {
      period: `${year}-${String(month + 1).padStart(2, '0')}`,
      checklist: [
        {
          item: 'Payroll processed on time',
          status: 'COMPLETE',
          dueDate: new Date(year, month, 25),
        },
        {
          item: 'Tax returns filed',
          status: 'PENDING',
          dueDate: new Date(year, month + 1, 7),
        },
        {
          item: 'Pension contributions remitted',
          status: 'PENDING',
          dueDate: new Date(year, month + 1, 15),
        },
        {
          item: 'Payslips distributed',
          status: 'COMPLETE',
          dueDate: new Date(year, month, 28),
        },
        {
          item: 'Bank payments processed',
          status: 'COMPLETE',
          dueDate: new Date(year, month, 30),
        },
      ],
    };
  }

  private calculateSummary(payrolls: Payroll[]) {
    const uniqueEmployees = new Set(payrolls.map(p => p.employeeId));

    return {
      totalEmployees: uniqueEmployees.size,
      totalGrossPay: payrolls.reduce((sum, p) => sum + Number(p.grossPay), 0),
      totalNetPay: payrolls.reduce((sum, p) => sum + Number(p.netPay), 0),
      totalTax: payrolls.reduce((sum, p) => sum + Number(p.incomeTax), 0),
      totalEmployerContributions: payrolls.reduce(
        (sum, p) => sum + Number(p.pensionContribution),
        0,
      ),
      totalDeductions: payrolls.reduce((sum, p) => sum + Number(p.totalDeductions), 0),
    };
  }

  private calculateBreakdown(payrolls: Payroll[]) {
    const byDepartment = new Map<string, { count: number; total: number }>();
    const byCountry = new Map<string, { count: number; total: number }>();
    const byCurrency = new Map<string, number>();

    payrolls.forEach(payroll => {
      const dept = payroll.employee?.department?.name || 'Unassigned';
      const country = payroll.employee?.country || 'Unknown';
      const currency = payroll.currency || 'USD';

      if (!byDepartment.has(dept)) {
        byDepartment.set(dept, { count: 0, total: 0 });
      }
      byDepartment.get(dept)!.count++;
      byDepartment.get(dept)!.total += Number(payroll.grossPay);

      if (!byCountry.has(country)) {
        byCountry.set(country, { count: 0, total: 0 });
      }
      byCountry.get(country)!.count++;
      byCountry.get(country)!.total += Number(payroll.grossPay);

      if (!byCurrency.has(currency)) {
        byCurrency.set(currency, 0);
      }
      byCurrency.set(currency, byCurrency.get(currency)! + Number(payroll.netPay));
    });

    return {
      byDepartment: Array.from(byDepartment.entries()).map(([dept, data]) => ({
        department: dept,
        employeeCount: data.count,
        totalCost: data.total,
      })),
      byCountry: Array.from(byCountry.entries()).map(([country, data]) => ({
        country,
        employeeCount: data.count,
        totalCost: data.total,
      })),
      byCurrency: Array.from(byCurrency.entries()).map(([currency, total]) => ({
        currency,
        totalAmount: total,
      })),
    };
  }

  private generateComplianceInfo(startDate: Date, endDate: Date) {
    return {
      taxFiled: false,
      statutoryReports: ['PAYE', 'NIC', 'Pension'],
      filingDeadlines: [
        {
          type: 'Monthly Tax Return',
          deadline: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 7),
          status: 'PENDING' as const,
        },
        {
          type: 'Pension Remittance',
          deadline: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 15),
          status: 'PENDING' as const,
        },
      ],
    };
  }

  private generateAuditTrail(payrolls: Payroll[]) {
    return payrolls.slice(0, 10).map(payroll => ({
      timestamp: payroll.payDate,
      action: 'PAYROLL_PROCESSED',
      performedBy: 'System',
      details: `Processed payroll for employee ${payroll.employeeId}`,
    }));
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
