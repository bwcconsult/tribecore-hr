import { axiosInstance } from '../lib/axios';

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  bonuses: number;
  overtime: number;
  grossPay: number;
  taxDeduction: number;
  insuranceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  status: string;
  payDate: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export const payrollService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/payroll', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/payroll/${id}`);
    return response.data;
  },

  create: async (data: Partial<Payroll>) => {
    const response = await axiosInstance.post('/payroll', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Payroll>) => {
    const response = await axiosInstance.patch(`/payroll/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/payroll/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await axiosInstance.post(`/payroll/${id}/approve`);
    return response.data;
  },

  process: async (id: string) => {
    const response = await axiosInstance.post(`/payroll/${id}/process`);
    return response.data;
  },

  getSummary: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/payroll/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/payroll/stats');
    return response.data;
  },

  generatePayslip: async (id: string) => {
    const response = await axiosInstance.get(`/payroll/${id}/payslip`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Employee-specific methods
  getMyDashboard: async () => {
    const response = await axiosInstance.get('/payroll/my/dashboard');
    return response.data;
  },

  getMyPayslips: async (params?: any) => {
    const response = await axiosInstance.get('/payroll/my/payslips', { params });
    return response.data;
  },

  getMyPayrollDetails: async () => {
    const response = await axiosInstance.get('/payroll/my/details');
    return response.data;
  },

  getMyPayslip: async (id: string) => {
    const response = await axiosInstance.get(`/payroll/my/payslips/${id}`);
    return response.data;
  },

  downloadMyPayslip: async (id: string) => {
    const response = await axiosInstance.get(`/payroll/my/payslips/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
