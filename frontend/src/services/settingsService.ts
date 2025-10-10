import { axiosInstance } from '../lib/axios';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  department?: string;
}

export interface OrganizationSettings {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  fiscalYearStart: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  leaveRequests: boolean;
  expenseApprovals: boolean;
  performanceReviews: boolean;
  payrollNotifications: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  ipWhitelist?: string[];
}

export const settingsService = {
  // Profile Management
  getProfile: async () => {
    const response = await axiosInstance.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await axiosInstance.patch('/settings/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosInstance.post('/settings/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Password Management
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await axiosInstance.post('/settings/password/change', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Organization Settings
  getOrganizationSettings: async () => {
    const response = await axiosInstance.get('/settings/organization');
    return response.data;
  },

  updateOrganizationSettings: async (data: Partial<OrganizationSettings>) => {
    const response = await axiosInstance.patch('/settings/organization', data);
    return response.data;
  },

  uploadOrganizationLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post('/settings/organization/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    const response = await axiosInstance.get('/settings/notifications');
    return response.data;
  },

  updateNotificationPreferences: async (data: Partial<NotificationPreferences>) => {
    const response = await axiosInstance.patch('/settings/notifications', data);
    return response.data;
  },

  // Security Settings
  getSecuritySettings: async () => {
    const response = await axiosInstance.get('/settings/security');
    return response.data;
  },

  updateSecuritySettings: async (data: Partial<SecuritySettings>) => {
    const response = await axiosInstance.patch('/settings/security', data);
    return response.data;
  },

  enable2FA: async () => {
    const response = await axiosInstance.post('/settings/security/2fa/enable');
    return response.data;
  },

  disable2FA: async (code: string) => {
    const response = await axiosInstance.post('/settings/security/2fa/disable', { code });
    return response.data;
  },

  // System Configuration
  getSystemConfig: async () => {
    const response = await axiosInstance.get('/settings/system');
    return response.data;
  },

  updateSystemConfig: async (data: any) => {
    const response = await axiosInstance.patch('/settings/system', data);
    return response.data;
  },

  // Data Management
  exportData: async (dataType: string) => {
    const response = await axiosInstance.get(`/settings/data/export/${dataType}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  importData: async (file: File, dataType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/settings/data/import/${dataType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
