import { axiosInstance } from '../lib/axios';

export interface OnboardingChecklist {
  id: string;
  task: string;
  completed: boolean;
  completedAt?: string;
}

export interface Onboarding {
  id: string;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate?: string;
  mentorId?: string;
  mentorName?: string;
  status: string;
  progress: number;
  checklist: OnboardingChecklist[];
  notes?: string;
  createdAt: string;
}

export const onboardingService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/onboarding', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/onboarding/${id}`);
    return response.data;
  },

  create: async (data: Partial<Onboarding>) => {
    const response = await axiosInstance.post('/onboarding', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Onboarding>) => {
    const response = await axiosInstance.patch(`/onboarding/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/onboarding/${id}`);
    return response.data;
  },

  updateChecklist: async (id: string, checklistId: string, completed: boolean) => {
    const response = await axiosInstance.patch(`/onboarding/${id}/checklist/${checklistId}`, { completed });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/onboarding/stats');
    return response.data;
  },
};
