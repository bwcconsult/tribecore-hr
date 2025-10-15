import { axiosInstance } from '../lib/axios';

export interface OnboardingTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  country: string;
  entityId?: string;
  version: number;
  tags: string[];
  active: boolean;
  checklistItems: ChecklistItem[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  ownerRole: string;
  durationDays: number;
  required: boolean;
  dependencies: string[];
  slaHours?: number;
  orderIndex: number;
  metadata?: any;
}

export interface OnboardingCase {
  id: string;
  candidateId?: string;
  employeeId?: string;
  organizationId: string;
  country: string;
  site?: string;
  department?: string;
  jobTitle: string;
  startDate: string;
  status: string;
  roleBlueprintId?: string;
  hiringManagerId?: string;
  buddyId?: string;
  mentorId?: string;
  provisioningComplete: boolean;
  rightToWorkVerified: boolean;
  backgroundCheckComplete: boolean;
  metadata?: any;
  tasks?: OnboardingTask[];
  employee?: any;
}

export interface OnboardingTask {
  id: string;
  organizationId: string;
  caseId: string;
  type: string;
  title: string;
  description?: string;
  assigneeRole: string;
  assigneeId?: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  dependencies: string[];
  slaHours?: number;
  noteCount: number;
  lastActivityAt?: string;
  completedAt?: string;
  completedBy?: string;
  blockReason?: string;
  metadata?: any;
}

export interface OnboardingDocument {
  id: string;
  organizationId: string;
  caseId: string;
  kind: string;
  name: string;
  description?: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
  eSigned: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  isRequired: boolean;
  expiresAt?: string;
  metadata?: any;
}

export interface ProvisioningTicket {
  id: string;
  organizationId: string;
  caseId: string;
  system: string;
  externalRef?: string;
  status: string;
  assignedTo?: string;
  requestedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  metadataJson?: any;
}

export interface Checkin {
  id: string;
  organizationId: string;
  caseId: string;
  type: '30' | '60' | '90' | 'PROBATION_END' | 'CUSTOM';
  scheduledFor: string;
  submittedAt?: string;
  submittedBy?: string;
  rating?: number;
  comments?: string;
  formJson?: any;
  completed: boolean;
  nextAction?: string;
  nextActionDue?: string;
}

class OnboardingService {
  // ========== TEMPLATES ==========
  async getTemplates(filters: {
    organizationId: string;
    country?: string;
    active?: boolean;
    tags?: string[];
  }) {
    const params = new URLSearchParams();
    params.append('organizationId', filters.organizationId);
    if (filters.country) params.append('country', filters.country);
    if (filters.active !== undefined) params.append('active', String(filters.active));
    if (filters.tags) params.append('tags', filters.tags.join(','));

    const response = await axiosInstance.get(`/onboarding/templates?${params}`);
    return response.data;
  }

  async getTemplate(id: string) {
    const response = await axiosInstance.get(`/onboarding/templates/${id}`);
    return response.data;
  }

  async createTemplate(data: Partial<OnboardingTemplate>) {
    const response = await axiosInstance.post('/onboarding/templates', data);
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<OnboardingTemplate>) {
    const response = await axiosInstance.put(`/onboarding/templates/${id}`, data);
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await axiosInstance.delete(`/onboarding/templates/${id}`);
    return response.data;
  }

  async cloneTemplate(id: string, name?: string) {
    const response = await axiosInstance.post(`/onboarding/templates/${id}/clone`, { name });
    return response.data;
  }

  async generateCaseFromTemplate(
    templateId: string,
    data: {
      employeeId: string;
      startDate: string;
      candidateId?: string;
      organizationId?: string;
      country?: string;
      site?: string;
      department?: string;
      jobTitle?: string;
      hiringManagerId?: string;
      buddyId?: string;
      mentorId?: string;
      metadata?: any;
    },
  ) {
    const response = await axiosInstance.post(
      `/onboarding/templates/${templateId}/generate-case`,
      data,
    );
    return response.data;
  }

  // ========== CASES ==========
  async getCases(filters: {
    organizationId: string;
    status?: string;
    ownerId?: string;
    department?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });

    const response = await axiosInstance.get(`/onboarding/cases?${params}`);
    return response.data;
  }

  async getCase(id: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${id}`);
    return response.data;
  }

  async createCase(data: Partial<OnboardingCase>) {
    const response = await axiosInstance.post('/onboarding/cases', data);
    return response.data;
  }

  async updateCase(id: string, data: Partial<OnboardingCase>) {
    const response = await axiosInstance.patch(`/onboarding/cases/${id}`, data);
    return response.data;
  }

  async updateCaseStatus(id: string, status: string) {
    const response = await axiosInstance.patch(`/onboarding/cases/${id}/status`, { status });
    return response.data;
  }

  async deleteCase(id: string) {
    const response = await axiosInstance.delete(`/onboarding/cases/${id}`);
    return response.data;
  }

  async checkDay1Readiness(id: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${id}/readiness`);
    return response.data;
  }

  async getOverdueTasks(id: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${id}/overdue-tasks`);
    return response.data;
  }

  async getBlockedTasks(id: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${id}/blocked-tasks`);
    return response.data;
  }

  // ========== TASKS ==========
  async createTask(caseId: string, data: Partial<OnboardingTask>) {
    const response = await axiosInstance.post(`/onboarding/cases/${caseId}/tasks`, data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<OnboardingTask>) {
    const response = await axiosInstance.patch(`/onboarding/tasks/${id}`, data);
    return response.data;
  }

  async completeTask(id: string, completedBy: string) {
    const response = await axiosInstance.patch(`/onboarding/tasks/${id}/complete`, {
      completedBy,
    });
    return response.data;
  }

  async blockTask(id: string, reason: string) {
    const response = await axiosInstance.patch(`/onboarding/tasks/${id}/block`, { reason });
    return response.data;
  }

  async unblockTask(id: string) {
    const response = await axiosInstance.patch(`/onboarding/tasks/${id}/unblock`);
    return response.data;
  }

  // ========== DOCUMENTS ==========
  async getDocuments(caseId: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${caseId}/documents`);
    return response.data;
  }

  async createDocument(caseId: string, data: Partial<OnboardingDocument>) {
    const response = await axiosInstance.post(`/onboarding/cases/${caseId}/documents`, data);
    return response.data;
  }

  async verifyDocument(id: string, verifiedBy: string) {
    const response = await axiosInstance.patch(`/onboarding/documents/${id}/verify`, {
      verifiedBy,
    });
    return response.data;
  }

  // ========== PROVISIONING ==========
  async getProvisioningTickets(caseId: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${caseId}/provisioning`);
    return response.data;
  }

  async createProvisioningTicket(caseId: string, data: Partial<ProvisioningTicket>) {
    const response = await axiosInstance.post(`/onboarding/cases/${caseId}/provisioning`, data);
    return response.data;
  }

  async updateProvisioningTicket(id: string, data: Partial<ProvisioningTicket>) {
    const response = await axiosInstance.patch(`/onboarding/provisioning/${id}`, data);
    return response.data;
  }

  // ========== CHECKINS ==========
  async getCheckins(caseId: string) {
    const response = await axiosInstance.get(`/onboarding/cases/${caseId}/checkins`);
    return response.data;
  }

  async createCheckin(caseId: string, data: Partial<Checkin>) {
    const response = await axiosInstance.post(`/onboarding/cases/${caseId}/checkins`, data);
    return response.data;
  }

  async updateCheckin(id: string, data: Partial<Checkin>) {
    const response = await axiosInstance.patch(`/onboarding/checkins/${id}`, data);
    return response.data;
  }

  async submitCheckin(
    id: string,
    data: { rating: number; comments: string; formJson?: any; submittedBy: string },
  ) {
    const response = await axiosInstance.patch(`/onboarding/checkins/${id}/submit`, data);
    return response.data;
  }

  // ========== DASHBOARD ==========
  async getDashboardStats(organizationId: string) {
    const response = await axiosInstance.get(
      `/dashboard/onboarding?organizationId=${organizationId}`,
    );
    return response.data;
  }
}

export const onboardingService = new OnboardingService();
