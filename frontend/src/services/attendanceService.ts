import { axiosInstance } from '../lib/axios';

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: string;
  workHours?: number;
  notes?: string;
  createdAt: string;
}

export const attendanceService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/attendance', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/attendance/${id}`);
    return response.data;
  },

  create: async (data: Partial<Attendance>) => {
    const response = await axiosInstance.post('/attendance', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Attendance>) => {
    const response = await axiosInstance.patch(`/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/attendance/${id}`);
    return response.data;
  },

  clockIn: async (data: { employeeId: string; notes?: string }) => {
    const response = await axiosInstance.post('/attendance/clock-in', data);
    return response.data;
  },

  clockOut: async (id: string, notes?: string) => {
    const response = await axiosInstance.post(`/attendance/${id}/clock-out`, { notes });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/attendance/stats');
    return response.data;
  },

  getTodayAttendance: async () => {
    const response = await axiosInstance.get('/attendance/today');
    return response.data;
  },
};
