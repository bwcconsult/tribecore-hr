import { axiosInstance } from '../lib/axios';

export interface OrganizationSettings {
  employeeIdPrefix?: string;
  workLocations?: string[];
  departments?: string[];
  jobLevels?: string[];
  employmentTypes?: string[];
  payroll?: {
    frequency?: string;
    paymentDay?: number;
  };
  leave?: {
    annualLeaveDefault?: number;
    sickLeaveDefault?: number;
  };
  onboardingChecklist?: Array<{
    id: string;
    title: string;
    description?: string;
    category?: string;
    daysToComplete?: number;
    isRequired: boolean;
    order: number;
  }>;
  compliance?: {
    gdprEnabled?: boolean;
    dataRetentionDays?: number;
  };
}

export const organizationService = {
  getSettings: async (organizationId: string) => {
    const response = await axiosInstance.get(`/organization/${organizationId}/settings`);
    return response.data;
  },

  updateSettings: async (organizationId: string, settings: Partial<OrganizationSettings>) => {
    const response = await axiosInstance.patch(`/organization/${organizationId}/settings`, settings);
    return response.data;
  },

  getWorkLocations: async (organizationId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/organization/${organizationId}/settings/work-locations`);
    return response.data;
  },

  getDepartments: async (organizationId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/organization/${organizationId}/settings/departments`);
    return response.data;
  },

  getJobLevels: async (organizationId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/organization/${organizationId}/settings/job-levels`);
    return response.data;
  },

  getOnboardingChecklist: async (organizationId: string) => {
    const response = await axiosInstance.get(`/organization/${organizationId}/settings/onboarding-checklist`);
    return response.data;
  },
};
