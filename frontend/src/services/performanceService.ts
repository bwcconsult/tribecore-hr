import { axiosInstance } from '../lib/axios';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName?: string;
  reviewerId: string;
  reviewerName?: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewDate: string;
  status: string;
  overallRating: number;
  technicalSkills?: number;
  communication?: number;
  teamwork?: number;
  leadership?: number;
  problemSolving?: number;
  productivity?: number;
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  comments?: string;
  employeeFeedback?: string;
  createdAt: string;
}

export const performanceService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/performance', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/performance/${id}`);
    return response.data;
  },

  create: async (data: Partial<PerformanceReview>) => {
    const response = await axiosInstance.post('/performance', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PerformanceReview>) => {
    const response = await axiosInstance.patch(`/performance/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/performance/${id}`);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await axiosInstance.post(`/performance/${id}/submit`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await axiosInstance.post(`/performance/${id}/complete`);
    return response.data;
  },

  addEmployeeFeedback: async (id: string, feedback: string) => {
    const response = await axiosInstance.post(`/performance/${id}/feedback`, { feedback });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/performance/stats');
    return response.data;
  },

  getEmployeeHistory: async (employeeId: string) => {
    const response = await axiosInstance.get(`/performance/employee/${employeeId}`);
    return response.data;
  },
};
