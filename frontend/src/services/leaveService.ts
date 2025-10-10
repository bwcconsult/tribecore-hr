import { axiosInstance } from '../lib/axios';

export interface Leave {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  reason: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

export const leaveService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/leave', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/leave/${id}`);
    return response.data;
  },

  create: async (data: Partial<Leave>) => {
    const response = await axiosInstance.post('/leave', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Leave>) => {
    const response = await axiosInstance.patch(`/leave/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/leave/${id}`);
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

  getStats: async () => {
    const response = await axiosInstance.get('/leave/stats');
    return response.data;
  },
};
