import { axiosInstance } from '../lib/axios';

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  employeeName?: string;
  benefitPlanId: string;
  benefitPlanName?: string;
  enrollmentDate: string;
  effectiveDate: string;
  endDate?: string;
  status: string;
  coverage: string;
  employeeContribution: number;
  employerContribution: number;
  totalCost: number;
  dependents?: number;
  notes?: string;
  createdAt: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  type: string;
  description?: string;
  provider?: string;
  cost: number;
  employerCost: number;
  employeeCost: number;
  currency: string;
  coverage?: string;
  eligibility?: string;
  isActive: boolean;
  enrolledCount?: number;
  createdAt: string;
}

export const benefitsService = {
  // Enrollment operations
  getAllEnrollments: async (params?: any) => {
    const response = await axiosInstance.get('/benefits/enrollments', { params });
    return response.data;
  },

  getEnrollmentById: async (id: string) => {
    const response = await axiosInstance.get(`/benefits/enrollments/${id}`);
    return response.data;
  },

  createEnrollment: async (data: Partial<BenefitEnrollment>) => {
    const response = await axiosInstance.post('/benefits/enrollments', data);
    return response.data;
  },

  updateEnrollment: async (id: string, data: Partial<BenefitEnrollment>) => {
    const response = await axiosInstance.patch(`/benefits/enrollments/${id}`, data);
    return response.data;
  },

  deleteEnrollment: async (id: string) => {
    const response = await axiosInstance.delete(`/benefits/enrollments/${id}`);
    return response.data;
  },

  // Plan operations
  getAllPlans: async (params?: any) => {
    const response = await axiosInstance.get('/benefits/plans', { params });
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await axiosInstance.get(`/benefits/plans/${id}`);
    return response.data;
  },

  createPlan: async (data: Partial<BenefitPlan>) => {
    const response = await axiosInstance.post('/benefits/plans', data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<BenefitPlan>) => {
    const response = await axiosInstance.patch(`/benefits/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: string) => {
    const response = await axiosInstance.delete(`/benefits/plans/${id}`);
    return response.data;
  },

  // Additional operations
  getStats: async () => {
    const response = await axiosInstance.get('/benefits/stats');
    return response.data;
  },

  getEmployeeEnrollments: async (employeeId: string) => {
    const response = await axiosInstance.get(`/benefits/employee/${employeeId}/enrollments`);
    return response.data;
  },
};
