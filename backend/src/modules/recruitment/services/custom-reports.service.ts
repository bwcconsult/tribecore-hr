import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { Requisition } from '../entities/requisition.entity';
import { Interview } from '../entities/interview.entity';
import { Offer } from '../entities/offer.entity';

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  type: 'TABLE' | 'CHART' | 'PIVOT' | 'DASHBOARD';
  dataSource: 'APPLICATIONS' | 'REQUISITIONS' | 'INTERVIEWS' | 'OFFERS' | 'CUSTOM_SQL';
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string[];
  orderBy?: Array<{ column: string; direction: 'ASC' | 'DESC' }>;
  chartConfig?: ChartConfig;
  schedule?: ReportSchedule;
  permissions: {
    viewerRoles: string[];
    editorRoles: string[];
  };
  createdBy: string;
  createdAt: Date;
  organizationId: string;
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ENUM';
  format?: string; // e.g., "currency", "percentage", "date"
  aggregation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  visible: boolean;
  width?: number;
}

export interface ReportFilter {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GT' | 'LT' | 'GTE' | 'LTE' | 'IN' | 'BETWEEN';
  value: any;
}

export interface ChartConfig {
  chartType: 'LINE' | 'BAR' | 'PIE' | 'AREA' | 'SCATTER';
  xAxis: string;
  yAxis: string | string[];
  legend?: boolean;
  colors?: string[];
}

export interface ReportSchedule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string; // "09:00"
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[]; // email addresses
  format: 'PDF' | 'EXCEL' | 'CSV';
}

@Injectable()
export class CustomReportsService {
  private readonly logger = new Logger(CustomReportsService.name);
  private reports = new Map<string, ReportDefinition>();

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Requisition)
    private readonly requisitionRepo: Repository<Requisition>,
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
  ) {}

  /**
   * Create custom report
   */
  async createReport(definition: Omit<ReportDefinition, 'id' | 'createdAt'>): Promise<ReportDefinition> {
    const report: ReportDefinition = {
      ...definition,
      id: `report_${Date.now()}`,
      createdAt: new Date(),
    };

    this.reports.set(report.id, report);
    this.logger.log(`Report created: ${report.name}`);

    return report;
  }

  /**
   * Execute report and get data
   */
  async executeReport(params: {
    reportId: string;
    filters?: ReportFilter[];
    limit?: number;
    offset?: number;
  }): Promise<{
    data: any[];
    total: number;
    columns: ReportColumn[];
  }> {
    const report = this.reports.get(params.reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Merge filters
    const allFilters = [...report.filters, ...(params.filters || [])];

    // Get data based on source
    let data: any[] = [];
    let total = 0;

    switch (report.dataSource) {
      case 'APPLICATIONS':
        ({ data, total } = await this.getApplicationsData(report, allFilters, params));
        break;
      case 'REQUISITIONS':
        ({ data, total } = await this.getRequisitionsData(report, allFilters, params));
        break;
      case 'INTERVIEWS':
        ({ data, total } = await this.getInterviewsData(report, allFilters, params));
        break;
      case 'OFFERS':
        ({ data, total } = await this.getOffersData(report, allFilters, params));
        break;
      case 'CUSTOM_SQL':
        // Dangerous - validate carefully in production
        ({ data, total } = await this.executeCustomSQL(report, allFilters));
        break;
    }

    // Apply aggregations if groupBy specified
    if (report.groupBy && report.groupBy.length > 0) {
      data = this.applyAggregations(data, report);
    }

    return {
      data,
      total,
      columns: report.columns.filter(c => c.visible),
    };
  }

  /**
   * Export report to file
   */
  async exportReport(params: {
    reportId: string;
    format: 'PDF' | 'EXCEL' | 'CSV';
    filters?: ReportFilter[];
  }): Promise<Buffer> {
    const result = await this.executeReport({
      reportId: params.reportId,
      filters: params.filters,
    });

    switch (params.format) {
      case 'CSV':
        return this.exportToCSV(result);
      case 'EXCEL':
        return this.exportToExcel(result);
      case 'PDF':
        return this.exportToPDF(result);
      default:
        throw new Error('Unsupported format');
    }
  }

  /**
   * Get pre-built report templates
   */
  getReportTemplates(): Array<Omit<ReportDefinition, 'id' | 'createdAt' | 'organizationId' | 'createdBy'>> {
    return [
      {
        name: 'Applications by Source',
        description: 'Track where your best candidates come from',
        type: 'CHART',
        dataSource: 'APPLICATIONS',
        columns: [
          { field: 'source', label: 'Source', type: 'STRING', visible: true },
          { field: 'count', label: 'Applications', type: 'NUMBER', aggregation: 'COUNT', visible: true },
        ],
        filters: [],
        groupBy: ['source'],
        chartConfig: {
          chartType: 'PIE',
          xAxis: 'source',
          yAxis: 'count',
        },
        permissions: {
          viewerRoles: ['RECRUITER', 'HIRING_MANAGER', 'HR'],
          editorRoles: ['HR', 'ADMIN'],
        },
      },
      {
        name: 'Conversion Funnel by Stage',
        description: 'See where candidates drop off in your process',
        type: 'CHART',
        dataSource: 'APPLICATIONS',
        columns: [
          { field: 'stage', label: 'Stage', type: 'STRING', visible: true },
          { field: 'count', label: 'Count', type: 'NUMBER', aggregation: 'COUNT', visible: true },
        ],
        filters: [
          { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
        ],
        groupBy: ['stage'],
        orderBy: [{ column: 'count', direction: 'DESC' }],
        chartConfig: {
          chartType: 'BAR',
          xAxis: 'stage',
          yAxis: 'count',
        },
        permissions: {
          viewerRoles: ['RECRUITER', 'HIRING_MANAGER', 'HR'],
          editorRoles: ['HR', 'ADMIN'],
        },
      },
      {
        name: 'Time to Hire by Department',
        description: 'Compare hiring speed across departments',
        type: 'TABLE',
        dataSource: 'APPLICATIONS',
        columns: [
          { field: 'department', label: 'Department', type: 'STRING', visible: true },
          { field: 'avgDaysToHire', label: 'Avg Days', type: 'NUMBER', aggregation: 'AVG', visible: true },
          { field: 'minDaysToHire', label: 'Fastest', type: 'NUMBER', aggregation: 'MIN', visible: true },
          { field: 'maxDaysToHire', label: 'Slowest', type: 'NUMBER', aggregation: 'MAX', visible: true },
        ],
        filters: [
          { field: 'status', operator: 'EQUALS', value: 'OFFER_ACCEPTED' },
        ],
        groupBy: ['department'],
        permissions: {
          viewerRoles: ['HR', 'EXECUTIVE'],
          editorRoles: ['HR', 'ADMIN'],
        },
      },
      {
        name: 'Recruiter Performance',
        description: 'Track recruiter productivity and quality',
        type: 'TABLE',
        dataSource: 'APPLICATIONS',
        columns: [
          { field: 'recruiterName', label: 'Recruiter', type: 'STRING', visible: true },
          { field: 'applications', label: 'Applications', type: 'NUMBER', aggregation: 'COUNT', visible: true },
          { field: 'hired', label: 'Hired', type: 'NUMBER', aggregation: 'SUM', visible: true },
          { field: 'conversionRate', label: 'Conversion %', type: 'NUMBER', format: 'percentage', visible: true },
        ],
        filters: [],
        groupBy: ['recruiterId', 'recruiterName'],
        orderBy: [{ column: 'hired', direction: 'DESC' }],
        permissions: {
          viewerRoles: ['HR', 'EXECUTIVE'],
          editorRoles: ['HR', 'ADMIN'],
        },
      },
      {
        name: 'Interview Schedule',
        description: 'Upcoming interviews by date',
        type: 'TABLE',
        dataSource: 'INTERVIEWS',
        columns: [
          { field: 'scheduledStart', label: 'Date/Time', type: 'DATE', format: 'datetime', visible: true },
          { field: 'candidateName', label: 'Candidate', type: 'STRING', visible: true },
          { field: 'jobTitle', label: 'Position', type: 'STRING', visible: true },
          { field: 'type', label: 'Type', type: 'ENUM', visible: true },
          { field: 'panelSize', label: 'Panel Size', type: 'NUMBER', visible: true },
        ],
        filters: [
          { field: 'scheduledStart', operator: 'GTE', value: new Date() },
        ],
        orderBy: [{ column: 'scheduledStart', direction: 'ASC' }],
        permissions: {
          viewerRoles: ['RECRUITER', 'HIRING_MANAGER', 'HR'],
          editorRoles: ['HR', 'ADMIN'],
        },
      },
      {
        name: 'Diversity Report (EEO)',
        description: 'Track diversity metrics for compliance',
        type: 'CHART',
        dataSource: 'APPLICATIONS',
        columns: [
          { field: 'ethnicity', label: 'Ethnicity', type: 'STRING', visible: true },
          { field: 'count', label: 'Count', type: 'NUMBER', aggregation: 'COUNT', visible: true },
          { field: 'percentage', label: 'Percentage', type: 'NUMBER', format: 'percentage', visible: true },
        ],
        filters: [],
        groupBy: ['ethnicity'],
        chartConfig: {
          chartType: 'BAR',
          xAxis: 'ethnicity',
          yAxis: 'count',
        },
        permissions: {
          viewerRoles: ['HR', 'EXECUTIVE'],
          editorRoles: ['HR', 'ADMIN'],
        },
      },
    ];
  }

  /**
   * Schedule automated report delivery
   */
  async scheduleReport(params: {
    reportId: string;
    schedule: ReportSchedule;
  }): Promise<boolean> {
    const report = this.reports.get(params.reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    report.schedule = params.schedule;

    // TODO: Register with cron job scheduler
    this.logger.log(`Report scheduled: ${report.name} - ${params.schedule.frequency}`);

    return true;
  }

  // Private helper methods

  private async getApplicationsData(
    report: ReportDefinition,
    filters: ReportFilter[],
    params: any
  ): Promise<{ data: any[]; total: number }> {
    const qb = this.applicationRepo.createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.jobPosting', 'jobPosting');

    // Apply filters
    filters.forEach((filter, idx) => {
      this.applyFilter(qb, filter, idx);
    });

    // Apply pagination
    if (params.limit) {
      qb.take(params.limit);
    }
    if (params.offset) {
      qb.skip(params.offset);
    }

    const [applications, total] = await qb.getManyAndCount();

    // Transform to report format
    const data = applications.map(app => this.transformApplicationToRow(app, report.columns));

    return { data, total };
  }

  private async getRequisitionsData(
    report: ReportDefinition,
    filters: ReportFilter[],
    params: any
  ): Promise<{ data: any[]; total: number }> {
    const qb = this.requisitionRepo.createQueryBuilder('req');

    filters.forEach((filter, idx) => {
      this.applyFilter(qb, filter, idx);
    });

    if (params.limit) qb.take(params.limit);
    if (params.offset) qb.skip(params.offset);

    const [requisitions, total] = await qb.getManyAndCount();
    const data = requisitions.map(req => this.transformRequisitionToRow(req, report.columns));

    return { data, total };
  }

  private async getInterviewsData(
    report: ReportDefinition,
    filters: ReportFilter[],
    params: any
  ): Promise<{ data: any[]; total: number }> {
    const qb = this.interviewRepo.createQueryBuilder('interview');

    filters.forEach((filter, idx) => {
      this.applyFilter(qb, filter, idx);
    });

    if (params.limit) qb.take(params.limit);
    if (params.offset) qb.skip(params.offset);

    const [interviews, total] = await qb.getManyAndCount();
    const data = interviews.map(int => this.transformInterviewToRow(int, report.columns));

    return { data, total };
  }

  private async getOffersData(
    report: ReportDefinition,
    filters: ReportFilter[],
    params: any
  ): Promise<{ data: any[]; total: number }> {
    const qb = this.offerRepo.createQueryBuilder('offer');

    filters.forEach((filter, idx) => {
      this.applyFilter(qb, filter, idx);
    });

    if (params.limit) qb.take(params.limit);
    if (params.offset) qb.skip(params.offset);

    const [offers, total] = await qb.getManyAndCount();
    const data = offers.map(offer => this.transformOfferToRow(offer, report.columns));

    return { data, total };
  }

  private async executeCustomSQL(
    report: ReportDefinition,
    filters: ReportFilter[]
  ): Promise<{ data: any[]; total: number }> {
    // TODO: Implement safely with parameterized queries
    // NEVER allow raw user SQL in production without validation
    return { data: [], total: 0 };
  }

  private applyFilter(qb: any, filter: ReportFilter, idx: number): void {
    const paramName = `param${idx}`;

    switch (filter.operator) {
      case 'EQUALS':
        qb.andWhere(`${filter.field} = :${paramName}`, { [paramName]: filter.value });
        break;
      case 'NOT_EQUALS':
        qb.andWhere(`${filter.field} != :${paramName}`, { [paramName]: filter.value });
        break;
      case 'CONTAINS':
        qb.andWhere(`${filter.field} ILIKE :${paramName}`, { [paramName]: `%${filter.value}%` });
        break;
      case 'GT':
        qb.andWhere(`${filter.field} > :${paramName}`, { [paramName]: filter.value });
        break;
      case 'LT':
        qb.andWhere(`${filter.field} < :${paramName}`, { [paramName]: filter.value });
        break;
      case 'GTE':
        qb.andWhere(`${filter.field} >= :${paramName}`, { [paramName]: filter.value });
        break;
      case 'LTE':
        qb.andWhere(`${filter.field} <= :${paramName}`, { [paramName]: filter.value });
        break;
      case 'IN':
        qb.andWhere(`${filter.field} IN (:...${paramName})`, { [paramName]: filter.value });
        break;
      case 'BETWEEN':
        qb.andWhere(`${filter.field} BETWEEN :${paramName}1 AND :${paramName}2`, {
          [`${paramName}1`]: filter.value[0],
          [`${paramName}2`]: filter.value[1],
        });
        break;
    }
  }

  private transformApplicationToRow(app: any, columns: ReportColumn[]): any {
    const row: any = {};
    columns.forEach(col => {
      row[col.field] = this.getNestedValue(app, col.field);
    });
    return row;
  }

  private transformRequisitionToRow(req: any, columns: ReportColumn[]): any {
    const row: any = {};
    columns.forEach(col => {
      row[col.field] = this.getNestedValue(req, col.field);
    });
    return row;
  }

  private transformInterviewToRow(int: any, columns: ReportColumn[]): any {
    const row: any = {};
    columns.forEach(col => {
      row[col.field] = this.getNestedValue(int, col.field);
    });
    return row;
  }

  private transformOfferToRow(offer: any, columns: ReportColumn[]): any {
    const row: any = {};
    columns.forEach(col => {
      row[col.field] = this.getNestedValue(offer, col.field);
    });
    return row;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private applyAggregations(data: any[], report: ReportDefinition): any[] {
    // Group by specified fields
    const groups = new Map<string, any[]>();

    data.forEach(row => {
      const key = report.groupBy!.map(field => row[field]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // Apply aggregations
    const aggregated: any[] = [];

    groups.forEach((rows, key) => {
      const result: any = {};

      // Copy groupBy fields
      report.groupBy!.forEach((field, idx) => {
        result[field] = rows[0][field];
      });

      // Apply aggregations
      report.columns.forEach(col => {
        if (col.aggregation) {
          result[col.field] = this.aggregate(rows, col.field, col.aggregation);
        }
      });

      aggregated.push(result);
    });

    return aggregated;
  }

  private aggregate(rows: any[], field: string, aggregation: string): number {
    const values = rows.map(r => r[field]).filter(v => v != null);

    switch (aggregation) {
      case 'COUNT':
        return values.length;
      case 'SUM':
        return values.reduce((sum, v) => sum + Number(v), 0);
      case 'AVG':
        return values.reduce((sum, v) => sum + Number(v), 0) / values.length;
      case 'MIN':
        return Math.min(...values);
      case 'MAX':
        return Math.max(...values);
      default:
        return 0;
    }
  }

  private exportToCSV(result: any): Buffer {
    // TODO: Implement CSV export
    return Buffer.from('CSV data');
  }

  private exportToExcel(result: any): Buffer {
    // TODO: Implement Excel export with library like exceljs
    return Buffer.from('Excel data');
  }

  private exportToPDF(result: any): Buffer {
    // TODO: Implement PDF export with library like pdfkit
    return Buffer.from('PDF data');
  }
}
