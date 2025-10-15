import { axiosInstance } from '../lib/axios';

export interface ClientAccount {
  id: string;
  organizationId: string;
  name: string;
  tier: 'Standard' | 'Professional' | 'Enterprise';
  region: string;
  industry?: string;
  crmId?: string;
  successManagerId?: string;
  billingCurrency: string;
  website?: string;
  employeeCount?: number;
  annualRevenue?: number;
  active: boolean;
  metadata?: any;
  contacts?: ClientContact[];
  onboardingCases?: ClientOnboardingCase[];
}

export interface ClientContact {
  id: string;
  accountId: string;
  name: string;
  email: string;
  role: 'Sponsor' | 'ProjectLead' | 'IT' | 'Security' | 'Finance' | 'EndUser';
  phone?: string;
  jobTitle?: string;
  primaryContact: boolean;
  active: boolean;
  metadata?: any;
}

export interface ClientOnboardingCase {
  id: string;
  organizationId: string;
  accountId: string;
  csmId?: string;
  tier: 'Standard' | 'Professional' | 'Enterprise';
  region: string;
  goLiveTarget: string;
  status: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  completionPercentage: number;
  kickoffDate?: string;
  goLiveDate?: string;
  hypercareEndDate?: string;
  gateChecks?: {
    securityApproved?: boolean;
    legalApproved?: boolean;
    billingApproved?: boolean;
    uatApproved?: boolean;
    runbookApproved?: boolean;
  };
  metadata?: any;
  account?: ClientAccount;
  workstreams?: Workstream[];
  environments?: Environment[];
  risks?: Risk[];
}

export interface Workstream {
  id: string;
  caseId: string;
  name: 'Security' | 'Legal' | 'Technical' | 'Billing' | 'Training';
  leadId?: string;
  completionPercentage: number;
  active: boolean;
  metadata?: any;
  tasks?: COTask[];
}

export interface COTask {
  id: string;
  workstreamId: string;
  title: string;
  description?: string;
  ownerTeam: 'CSM' | 'Solutions' | 'Security' | 'Finance' | 'Client';
  assigneeId?: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  dependencies: string[];
  slaHours?: number;
  noteCount: number;
  completedAt?: string;
  completedBy?: string;
  blockReason?: string;
  metadata?: any;
}

export interface CODocument {
  id: string;
  caseId: string;
  type: 'DPA' | 'MSA' | 'SOW' | 'Cert' | 'Runbook' | 'SCC' | 'DPIA' | 'PenTest' | 'Other';
  name: string;
  description?: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
  signedAt?: string;
  signedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isRequired: boolean;
  expiresAt?: string;
  metadata?: any;
}

export interface Environment {
  id: string;
  caseId: string;
  envType: 'sandbox' | 'uat' | 'staging' | 'prod';
  region: string;
  domain: string;
  status: 'PENDING' | 'PROVISIONING' | 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';
  apiKeyRef?: string;
  ssoConfig?: string;
  provisionedAt?: string;
  goLiveAt?: string;
  metadata?: any;
}

export interface Risk {
  id: string;
  caseId: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  mitigation?: string;
  ownerId?: string;
  status: 'Open' | 'Mitigating' | 'Closed' | 'Accepted';
  identifiedAt?: string;
  resolvedAt?: string;
  targetResolutionDate?: string;
  impact?: string;
  probability?: number;
  metadata?: any;
}

export interface SuccessPlan {
  id: string;
  caseId: string;
  objectives: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    achieved: boolean;
  }>;
  kpis: Array<{
    id: string;
    name: string;
    target: number;
    actual?: number;
    unit: string;
    frequency: string;
  }>;
  reviewCadence: 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly';
  nextReviewDate?: string;
  lastReviewDate?: string;
  metadata?: any;
}

class CXOService {
  // ========== ACCOUNTS ==========
  async getAccounts(organizationId: string) {
    const response = await axiosInstance.get(`/cxo/accounts?organizationId=${organizationId}`);
    return response.data;
  }

  async getAccount(id: string) {
    const response = await axiosInstance.get(`/cxo/accounts/${id}`);
    return response.data;
  }

  async createAccount(data: Partial<ClientAccount>) {
    const response = await axiosInstance.post('/cxo/accounts', data);
    return response.data;
  }

  async updateAccount(id: string, data: Partial<ClientAccount>) {
    const response = await axiosInstance.patch(`/cxo/accounts/${id}`, data);
    return response.data;
  }

  // ========== CONTACTS ==========
  async getContacts(accountId: string) {
    const response = await axiosInstance.get(`/cxo/accounts/${accountId}/contacts`);
    return response.data;
  }

  async createContact(accountId: string, data: Partial<ClientContact>) {
    const response = await axiosInstance.post(`/cxo/accounts/${accountId}/contacts`, data);
    return response.data;
  }

  // ========== CASES ==========
  async getCases(filters: {
    organizationId: string;
    status?: string;
    csmId?: string;
    tier?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });

    const response = await axiosInstance.get(`/cxo/cases?${params}`);
    return response.data;
  }

  async getCase(id: string) {
    const response = await axiosInstance.get(`/cxo/cases/${id}`);
    return response.data;
  }

  async createCase(data: Partial<ClientOnboardingCase>) {
    const response = await axiosInstance.post('/cxo/cases', data);
    return response.data;
  }

  async updateCase(id: string, data: Partial<ClientOnboardingCase>) {
    const response = await axiosInstance.patch(`/cxo/cases/${id}`, data);
    return response.data;
  }

  async updateCaseStatus(id: string, status: string) {
    const response = await axiosInstance.patch(`/cxo/cases/${id}/status`, { status });
    return response.data;
  }

  async deleteCase(id: string) {
    const response = await axiosInstance.delete(`/cxo/cases/${id}`);
    return response.data;
  }

  async checkGoLiveGate(id: string) {
    const response = await axiosInstance.get(`/cxo/cases/${id}/go-live-gate`);
    return response.data;
  }

  async updateGateCheck(id: string, gateName: string, approved: boolean) {
    const response = await axiosInstance.patch(`/cxo/cases/${id}/gate/${gateName}`, { approved });
    return response.data;
  }

  async getCompletion(id: string) {
    const response = await axiosInstance.get(`/cxo/cases/${id}/completion`);
    return response.data;
  }

  // ========== WORKSTREAMS ==========
  async createWorkstream(caseId: string, data: Partial<Workstream>) {
    const response = await axiosInstance.post(`/cxo/cases/${caseId}/workstreams`, data);
    return response.data;
  }

  async getWorkstream(id: string) {
    const response = await axiosInstance.get(`/cxo/workstreams/${id}`);
    return response.data;
  }

  // ========== TASKS ==========
  async createTask(workstreamId: string, data: Partial<COTask>) {
    const response = await axiosInstance.post(`/cxo/workstreams/${workstreamId}/tasks`, data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<COTask>) {
    const response = await axiosInstance.patch(`/cxo/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await axiosInstance.delete(`/cxo/tasks/${id}`);
    return response.data;
  }

  // ========== DOCUMENTS ==========
  async getDocuments(caseId: string) {
    const response = await axiosInstance.get(`/cxo/cases/${caseId}/documents`);
    return response.data;
  }

  async createDocument(caseId: string, data: Partial<CODocument>) {
    const response = await axiosInstance.post(`/cxo/cases/${caseId}/documents`, data);
    return response.data;
  }

  async updateDocument(id: string, data: Partial<CODocument>) {
    const response = await axiosInstance.patch(`/cxo/documents/${id}`, data);
    return response.data;
  }

  // ========== ENVIRONMENTS ==========
  async getEnvironments(caseId: string) {
    const response = await axiosInstance.get(`/cxo/cases/${caseId}/environments`);
    return response.data;
  }

  async createEnvironment(caseId: string, data: Partial<Environment>) {
    const response = await axiosInstance.post(`/cxo/cases/${caseId}/environments`, data);
    return response.data;
  }

  async updateEnvironment(id: string, data: Partial<Environment>) {
    const response = await axiosInstance.patch(`/cxo/environments/${id}`, data);
    return response.data;
  }

  // ========== RISKS ==========
  async getRisks(caseId: string) {
    const response = await axiosInstance.get(`/cxo/cases/${caseId}/risks`);
    return response.data;
  }

  async getRiskBurndown(caseId: string) {
    const response = await axiosInstance.get(`/cxo/cases/${caseId}/risks/burndown`);
    return response.data;
  }

  async getCriticalRisks(caseId: string) {
    const response = await axiosInstance.get(`/cxo/cases/${caseId}/risks/critical`);
    return response.data;
  }

  async createRisk(caseId: string, data: Partial<Risk>) {
    const response = await axiosInstance.post(`/cxo/cases/${caseId}/risks`, data);
    return response.data;
  }

  async updateRisk(id: string, data: Partial<Risk>) {
    const response = await axiosInstance.patch(`/cxo/risks/${id}`, data);
    return response.data;
  }

  async deleteRisk(id: string) {
    const response = await axiosInstance.delete(`/cxo/risks/${id}`);
    return response.data;
  }

  // ========== SUCCESS PLANS ==========
  async getSuccessPlan(caseId: string) {
    const response = await axiosInstance.get(`/cxo/cases/${caseId}/success-plan`);
    return response.data;
  }

  async createSuccessPlan(caseId: string, data: Partial<SuccessPlan>) {
    const response = await axiosInstance.post(`/cxo/cases/${caseId}/success-plan`, data);
    return response.data;
  }

  async updateSuccessPlan(id: string, data: Partial<SuccessPlan>) {
    const response = await axiosInstance.patch(`/cxo/success-plans/${id}`, data);
    return response.data;
  }

  // ========== DASHBOARD ==========
  async getDashboardStats(organizationId: string, csmId?: string) {
    const params = new URLSearchParams({ organizationId });
    if (csmId) params.append('csmId', csmId);

    const response = await axiosInstance.get(`/dashboard/cxo?${params}`);
    return response.data;
  }
}

export const cxoService = new CXOService();
