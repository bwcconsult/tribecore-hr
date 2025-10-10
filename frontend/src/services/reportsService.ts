import { axiosInstance } from '../lib/axios';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  fields: string[];
  filters: any[];
  isCustom: boolean;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedBy: string;
  generatedAt: string;
  parameters: any;
  status: string;
  downloadUrl?: string;
}

export const reportsService = {
  // Report Templates
  getTemplates: async () => {
    const response = await axiosInstance.get('/reports/templates');
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await axiosInstance.get(`/reports/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: Partial<ReportTemplate>) => {
    const response = await axiosInstance.post('/reports/templates', data);
    return response.data;
  },

  // Generate Reports
  generateReport: async (templateId: string, parameters?: any) => {
    const response = await axiosInstance.post(`/reports/generate/${templateId}`, parameters);
    return response.data;
  },

  getReportHistory: async (limit: number = 10) => {
    const response = await axiosInstance.get('/reports/history', { params: { limit } });
    return response.data;
  },

  // Predefined Reports
  getWorkforceReport: async (filters?: any) => {
    const response = await axiosInstance.get('/reports/workforce', { params: filters });
    return response.data;
  },

  getPayrollReport: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/reports/payroll', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getLeaveReport: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/reports/leave', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getPerformanceReport: async (filters?: any) => {
    const response = await axiosInstance.get('/reports/performance', { params: filters });
    return response.data;
  },

  getAttendanceReport: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/reports/attendance', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getBenefitsReport: async () => {
    const response = await axiosInstance.get('/reports/benefits');
    return response.data;
  },

  getExpensesReport: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/reports/expenses', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  // Export Reports
  exportReport: async (reportId: string, format: 'pdf' | 'csv' | 'excel') => {
    const response = await axiosInstance.get(`/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  exportCustomReport: async (reportType: string, format: 'pdf' | 'csv' | 'excel', data: any) => {
    const response = await axiosInstance.post(`/reports/export/${reportType}`, data, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Schedule Reports
  scheduleReport: async (templateId: string, schedule: any) => {
    const response = await axiosInstance.post(`/reports/schedule`, {
      templateId,
      schedule,
    });
    return response.data;
  },

  getScheduledReports: async () => {
    const response = await axiosInstance.get('/reports/scheduled');
    return response.data;
  },
};
