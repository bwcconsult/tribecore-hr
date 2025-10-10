import { axiosInstance } from '../lib/axios';

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  employmentType: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  status: string;
  closingDate?: string;
  openings: number;
  createdAt: string;
}

export const recruitmentService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/recruitment/jobs', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/recruitment/jobs/${id}`);
    return response.data;
  },

  create: async (data: Partial<Job>) => {
    const response = await axiosInstance.post('/recruitment/jobs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Job>) => {
    const response = await axiosInstance.patch(`/recruitment/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/recruitment/jobs/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/recruitment/stats');
    return response.data;
  },
};
