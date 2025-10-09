import { axiosInstance } from '../lib/axios';

export const payrollService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/payroll', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/payroll/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post('/payroll', data);
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
};
