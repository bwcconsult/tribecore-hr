import { axiosInstance } from '../lib/axios';

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName?: string;
  project?: string;
  task: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  billable: boolean;
  description?: string;
  createdAt: string;
}

export const timeTrackingService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/time-tracking', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/time-tracking/${id}`);
    return response.data;
  },

  create: async (data: Partial<TimeEntry>) => {
    const response = await axiosInstance.post('/time-tracking', data);
    return response.data;
  },

  update: async (id: string, data: Partial<TimeEntry>) => {
    const response = await axiosInstance.patch(`/time-tracking/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/time-tracking/${id}`);
    return response.data;
  },

  startTimer: async (data: { task: string; project?: string; billable?: boolean }) => {
    const response = await axiosInstance.post('/time-tracking/start', data);
    return response.data;
  },

  stopTimer: async (id: string) => {
    const response = await axiosInstance.post(`/time-tracking/${id}/stop`);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/time-tracking/stats');
    return response.data;
  },

  getActiveTimer: async () => {
    const response = await axiosInstance.get('/time-tracking/active');
    return response.data;
  },
};
