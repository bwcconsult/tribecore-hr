import { axiosInstance } from '../lib/axios';

export const leaveService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/leave', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/leave/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post('/leave', data);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await axiosInstance.post(`/leave/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await axiosInstance.post(`/leave/${id}/reject`, { reason });
    return response.data;
  },

  getBalance: async (employeeId: string, year: number) => {
    const response = await axiosInstance.get(`/leave/balance/${employeeId}`, {
      params: { year },
    });
    return response.data;
  },
};
