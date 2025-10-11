import { axiosInstance } from '../lib/axios';

export interface AbsencePlan {
  id: string;
  name: string;
  type: string;
  unit: string;
  description?: string;
  defaultEntitlementDays?: number;
}

export interface AbsenceBalance {
  id: string;
  userId: string;
  planId: string;
  period: string;
  entitlementDays: number;
  takenDays: number;
  scheduledDays: number;
  pendingDays: number;
  remainingDays: number;
  availableDays: number;
  episodes: number;
  plan?: AbsencePlan;
}

export interface AbsenceRequest {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isPartialDay: boolean;
  calculatedDays: number;
  status: string;
  notes?: string;
  createdAt: string;
  plan?: AbsencePlan;
}

export interface CreateAbsenceRequestDto {
  planId: string;
  startDate: string;
  endDate: string;
  isPartialDay?: boolean;
  partialDayType?: string;
  hours?: number;
  reasonCode?: string;
  notes?: string;
  attachmentIds?: string[];
}

export const absenceService = {
  async getPlans() {
    const response = await axiosInstance.get('/absence/plans');
    return response.data;
  },

  async getMyBalances(period?: string) {
    const response = await axiosInstance.get('/absence/balances', {
      params: { period },
    });
    return response.data;
  },

  async getUserBalances(userId: string, period?: string) {
    const response = await axiosInstance.get(`/absence/balances/${userId}`, {
      params: { period },
    });
    return response.data;
  },

  async createRequest(data: CreateAbsenceRequestDto) {
    const response = await axiosInstance.post('/absence/requests', data);
    return response.data;
  },

  async getRequests(params?: { status?: string; planId?: string }) {
    const response = await axiosInstance.get('/absence/requests', { params });
    return response.data;
  },

  async approveRequest(id: string, comment?: string) {
    const response = await axiosInstance.post(`/absence/requests/${id}/approve`, {
      comment,
    });
    return response.data;
  },

  async rejectRequest(id: string, reason: string, comment?: string) {
    const response = await axiosInstance.post(`/absence/requests/${id}/reject`, {
      reason,
      comment,
    });
    return response.data;
  },

  async cancelRequest(id: string) {
    const response = await axiosInstance.post(`/absence/requests/${id}/cancel`);
    return response.data;
  },

  async getSicknessEpisodes(startDate?: string, endDate?: string) {
    const response = await axiosInstance.get('/absence/sickness', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async createSicknessEpisode(data: any) {
    const response = await axiosInstance.post('/absence/sickness', data);
    return response.data;
  },
};
