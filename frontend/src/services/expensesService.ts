import { axiosInstance } from '../lib/axios';

export interface Expense {
  id: string;
  employeeId: string;
  employeeName?: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  merchant?: string;
  description: string;
  receiptUrl?: string;
  status: string;
  approvedBy?: string;
  rejectionReason?: string;
  reimbursementDate?: string;
  paymentMethod?: string;
  createdAt: string;
}

export const expensesService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/expenses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Expense>) => {
    const response = await axiosInstance.post('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Expense>) => {
    const response = await axiosInstance.patch(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/expenses/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await axiosInstance.post(`/expenses/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await axiosInstance.post(`/expenses/${id}/reject`, { reason });
    return response.data;
  },

  reimburse: async (id: string, paymentMethod: string) => {
    const response = await axiosInstance.post(`/expenses/${id}/reimburse`, { paymentMethod });
    return response.data;
  },

  uploadReceipt: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await axiosInstance.post(`/expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/expenses/stats');
    return response.data;
  },
};
