import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollRun } from '../entities/payroll-run.entity';
import { Payroll } from '../entities/payroll.entity';
import * as moment from 'moment';

export interface JournalEntry {
  date: Date;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  currency: string;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  department?: string;
  costCenter?: string;
  employeeId?: string;
}

export interface AccountingExportFormat {
  format: 'XERO' | 'QUICKBOOKS' | 'SAGE' | 'NETSUITE' | 'CSV';
  data: any;
}

@Injectable()
export class FinanceIntegrationService {
  private readonly logger = new Logger(FinanceIntegrationService.name);

  // Chart of Accounts mapping
  private readonly COA = {
    SALARY_EXPENSE: '6100',
    ALLOWANCES_EXPENSE: '6110',
    BONUS_EXPENSE: '6120',
    OVERTIME_EXPENSE: '6130',
    EMPLOYER_PENSION: '6210',
    EMPLOYER_NI: '6220',
    EMPLOYER_HEALTH: '6230',
    PAYE_PAYABLE: '2310',
    NI_PAYABLE: '2320',
    PENSION_PAYABLE: '2330',
    HEALTH_INSURANCE_PAYABLE: '2340',
    NET_SALARY_PAYABLE: '2350',
    BANK_ACCOUNT: '1100',
  };

  constructor(
    @InjectRepository(PayrollRun)
    private payrollRunRepository: Repository<PayrollRun>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async generateJournalEntry(payrollRunId: string): Promise<JournalEntry> {
    this.logger.log(`Generating journal entry for payroll run ${payrollRunId}`);

    const payrollRun = await this.payrollRunRepository.findOne({
      where: { id: payrollRunId },
    });

    if (!payrollRun) {
      throw new Error(`Payroll run ${payrollRunId} not found`);
    }

    const payrolls = await this.payrollRepository.find({
      where: { 
        payDate: payrollRun.paymentDate,
        organizationId: payrollRun.organizationId,
      },
      relations: ['employee'],
    });

    const lines: JournalEntryLine[] = [];

    // Aggregate totals
    let totalSalary = 0;
    let totalAllowances = 0;
    let totalBonuses = 0;
    let totalOvertime = 0;
    let totalPAYE = 0;
    let totalNI = 0;
    let totalPension = 0;
    let totalHealthInsurance = 0;
    let totalEmployerPension = 0;
    let totalEmployerNI = 0;
    let totalEmployerHealth = 0;
    let totalNetPay = 0;

    payrolls.forEach(payroll => {
      totalSalary += Number(payroll.basicSalary);
      totalAllowances += Number(payroll.allowances);
      totalBonuses += Number(payroll.bonuses);
      totalOvertime += Number(payroll.overtime);
      totalPAYE += Number(payroll.incomeTax);
      totalNI += Number(payroll.nationalInsurance);
      totalPension += Number(payroll.pensionContribution);
      totalHealthInsurance += 0; // Add if exists
      totalNetPay += Number(payroll.netPay);

      // Employer contributions (estimated)
      totalEmployerPension += Number(payroll.pensionContribution) * 0.3; // Employer portion
      totalEmployerNI += Number(payroll.nationalInsurance) * 0.5;
    });

    // DEBIT entries (Expenses)
    lines.push({
      accountCode: this.COA.SALARY_EXPENSE,
      accountName: 'Salaries & Wages',
      description: `Salaries for ${moment(payrollRun.periodStart).format('MMM YYYY')}`,
      debit: totalSalary,
      credit: 0,
    });

    if (totalAllowances > 0) {
      lines.push({
        accountCode: this.COA.ALLOWANCES_EXPENSE,
        accountName: 'Employee Allowances',
        description: 'Allowances (Housing, Transport, etc.)',
        debit: totalAllowances,
        credit: 0,
      });
    }

    if (totalBonuses > 0) {
      lines.push({
        accountCode: this.COA.BONUS_EXPENSE,
        accountName: 'Bonuses',
        description: 'Employee Bonuses',
        debit: totalBonuses,
        credit: 0,
      });
    }

    if (totalOvertime > 0) {
      lines.push({
        accountCode: this.COA.OVERTIME_EXPENSE,
        accountName: 'Overtime Pay',
        description: 'Overtime Hours',
        debit: totalOvertime,
        credit: 0,
      });
    }

    // Employer contributions (Debit)
    if (totalEmployerPension > 0) {
      lines.push({
        accountCode: this.COA.EMPLOYER_PENSION,
        accountName: 'Employer Pension Contribution',
        description: 'Employer Pension Contribution',
        debit: totalEmployerPension,
        credit: 0,
      });
    }

    if (totalEmployerNI > 0) {
      lines.push({
        accountCode: this.COA.EMPLOYER_NI,
        accountName: 'Employer National Insurance',
        description: 'Employer NI Contribution',
        debit: totalEmployerNI,
        credit: 0,
      });
    }

    // CREDIT entries (Liabilities)
    if (totalPAYE > 0) {
      lines.push({
        accountCode: this.COA.PAYE_PAYABLE,
        accountName: 'PAYE Tax Payable',
        description: 'Employee Income Tax Withheld',
        debit: 0,
        credit: totalPAYE,
      });
    }

    if (totalNI > 0) {
      lines.push({
        accountCode: this.COA.NI_PAYABLE,
        accountName: 'National Insurance Payable',
        description: 'Employee NI Withheld',
        debit: 0,
        credit: totalNI,
      });
    }

    if (totalPension > 0) {
      lines.push({
        accountCode: this.COA.PENSION_PAYABLE,
        accountName: 'Pension Contributions Payable',
        description: 'Employee Pension Withheld',
        debit: 0,
        credit: totalPension + totalEmployerPension,
      });
    }

    // Net Pay Payable
    lines.push({
      accountCode: this.COA.NET_SALARY_PAYABLE,
      accountName: 'Net Salaries Payable',
      description: 'Net Pay to Employees',
      debit: 0,
      credit: totalNetPay,
    });

    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

    return {
      date: payrollRun.paymentDate,
      reference: `PAYROLL-${payrollRun.id.substring(0, 8)}`,
      description: `Payroll for ${payrollRun.runName}`,
      lines,
      totalDebit,
      totalCredit,
      currency: payrollRun.baseCurrency,
    };
  }

  async exportToXero(journalEntry: JournalEntry): Promise<any> {
    // Xero API format
    return {
      Type: 'ACCRUAL',
      Date: moment(journalEntry.date).format('YYYY-MM-DD'),
      Reference: journalEntry.reference,
      Narration: journalEntry.description,
      JournalLines: journalEntry.lines.map(line => ({
        AccountCode: line.accountCode,
        Description: line.description,
        TaxType: 'NONE',
        ...(line.debit > 0 ? { Debit: line.debit } : { Credit: line.credit }),
      })),
    };
  }

  async exportToQuickBooks(journalEntry: JournalEntry): Promise<any> {
    // QuickBooks API format
    return {
      DocNumber: journalEntry.reference,
      TxnDate: moment(journalEntry.date).format('YYYY-MM-DD'),
      PrivateNote: journalEntry.description,
      Line: journalEntry.lines.map((line, index) => ({
        Id: (index + 1).toString(),
        Description: line.description,
        Amount: line.debit > 0 ? line.debit : line.credit,
        DetailType: 'JournalEntryLineDetail',
        JournalEntryLineDetail: {
          PostingType: line.debit > 0 ? 'Debit' : 'Credit',
          AccountRef: {
            value: line.accountCode,
            name: line.accountName,
          },
        },
      })),
    };
  }

  async exportToSage(journalEntry: JournalEntry): Promise<any> {
    // Sage CSV format
    const csv: string[] = [];
    csv.push('Account Code,Account Name,Debit,Credit,Description,Reference');

    journalEntry.lines.forEach(line => {
      csv.push(
        `${line.accountCode},"${line.accountName}",${line.debit},${line.credit},"${line.description}","${journalEntry.reference}"`,
      );
    });

    return csv.join('\n');
  }

  async exportToCSV(journalEntry: JournalEntry): Promise<string> {
    let csv = 'Date,Reference,Account Code,Account Name,Description,Debit,Credit,Department\n';

    journalEntry.lines.forEach(line => {
      csv += `${moment(journalEntry.date).format('YYYY-MM-DD')},`;
      csv += `${journalEntry.reference},`;
      csv += `${line.accountCode},`;
      csv += `"${line.accountName}",`;
      csv += `"${line.description}",`;
      csv += `${line.debit.toFixed(2)},`;
      csv += `${line.credit.toFixed(2)},`;
      csv += `${line.department || ''}\n`;
    });

    return csv;
  }

  async reconcilePayroll(payrollRunId: string): Promise<{
    matched: boolean;
    differences: Array<{ field: string; expected: number; actual: number }>;
  }> {
    const journalEntry = await this.generateJournalEntry(payrollRunId);

    // Check if debits equal credits
    const matched = Math.abs(journalEntry.totalDebit - journalEntry.totalCredit) < 0.01;

    const differences: Array<{ field: string; expected: number; actual: number }> = [];

    if (!matched) {
      differences.push({
        field: 'Total',
        expected: journalEntry.totalDebit,
        actual: journalEntry.totalCredit,
      });
    }

    return { matched, differences };
  }

  async generatePayrollReport(payrollRunId: string): Promise<any> {
    const payrollRun = await this.payrollRunRepository.findOne({
      where: { id: payrollRunId },
    });

    const journalEntry = await this.generateJournalEntry(payrollRunId);

    return {
      payrollRun,
      journalEntry,
      summary: {
        totalGross: payrollRun.totalGrossPay,
        totalNet: payrollRun.totalNetPay,
        totalDeductions: payrollRun.totalDeductions,
        totalTax: payrollRun.totalTax,
        totalEmployerCosts: payrollRun.totalEmployerContributions,
        grandTotal: payrollRun.totalGrossPay + payrollRun.totalEmployerContributions,
      },
    };
  }
}
