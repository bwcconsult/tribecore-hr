import { axiosInstance } from '../lib/axios';

export interface AISystem {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  vendor: string;
  vendorContact?: string;
  riskLevel: 'MINIMAL' | 'LIMITED' | 'HIGH' | 'UNACCEPTABLE';
  usageArea: 'RECRUITMENT' | 'PERFORMANCE' | 'SCHEDULING' | 'PAYROLL' | 'LEARNING' | 'ATTRITION' | 'CHATBOT' | 'OTHER';
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'DECOMMISSIONED' | 'PROHIBITED';
  requiresHumanReview: boolean;
  hasTransparencyNotice: boolean;
  transparencyNoticeText?: string;
  hasDataProtectionImpactAssessment: boolean;
  dpiaCompletedDate?: string;
  dpiaDocumentUrl?: string;
  trainingDataSources?: string;
  modelVersion?: string;
  lastModelUpdate?: string;
  biasTested: boolean;
  lastBiasTestDate?: string;
  biasTestResults?: any;
  performanceMetrics?: any;
  humanReviewConfig?: any;
  loggingEnabled: boolean;
  logRetentionDays: number;
  auditLogLocation?: string;
  prohibitedPracticesCheck?: any;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  certified: boolean;
  certifiedBy?: string;
  certificationDate?: string;
  certificationExpiryDate?: string;
  apiEndpoint?: string;
  integrationConfig?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AIDecisionLog {
  id: string;
  organizationId: string;
  aiSystemId: string;
  aiSystem?: AISystem;
  subjectType: string;
  subjectId: string;
  subjectName?: string;
  decisionType: string;
  outcome: 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'OVERRIDDEN';
  confidenceScore?: number;
  aiOutput: any;
  inputData?: any;
  humanReviewed: boolean;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  overridden: boolean;
  overrideReason?: string;
  finalDecision?: any;
  modelVersion?: string;
  modelEndpoint?: string;
  decisionTimestamp: string;
  auditFlagged: boolean;
  auditNotes?: string;
  feedbackReceived: boolean;
  outcomeTracking?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const aiGovernanceService = {
  // AI Systems
  createAISystem: async (data: Partial<AISystem>) => {
    const response = await axiosInstance.post('/ai-governance/systems', data);
    return response.data;
  },

  updateAISystem: async (id: string, data: Partial<AISystem>) => {
    const response = await axiosInstance.put(`/ai-governance/systems/${id}`, data);
    return response.data;
  },

  getAISystem: async (id: string): Promise<AISystem> => {
    const response = await axiosInstance.get(`/ai-governance/systems/${id}`);
    return response.data;
  },

  getAISystemsByOrg: async (organizationId: string): Promise<AISystem[]> => {
    const response = await axiosInstance.get(`/ai-governance/organizations/${organizationId}/systems`);
    return response.data;
  },

  getHighRiskAISystems: async (organizationId: string): Promise<AISystem[]> => {
    const response = await axiosInstance.get(`/ai-governance/organizations/${organizationId}/systems/high-risk`);
    return response.data;
  },

  recordBiasTest: async (data: any) => {
    const response = await axiosInstance.post('/ai-governance/systems/bias-test', data);
    return response.data;
  },

  updateModelVersion: async (data: any) => {
    const response = await axiosInstance.post('/ai-governance/systems/model-version', data);
    return response.data;
  },

  certifyAISystem: async (data: any) => {
    const response = await axiosInstance.post('/ai-governance/systems/certify', data);
    return response.data;
  },

  decommissionAISystem: async (id: string, reason: string) => {
    const response = await axiosInstance.put(`/ai-governance/systems/${id}/decommission`, { reason });
    return response.data;
  },

  // AI Decision Logs
  logAIDecision: async (data: any) => {
    const response = await axiosInstance.post('/ai-governance/decisions/log', data);
    return response.data;
  },

  reviewAIDecision: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/ai-governance/decisions/${id}/review`, data);
    return response.data;
  },

  recordDecisionOutcome: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/ai-governance/decisions/${id}/outcome`, data);
    return response.data;
  },

  getAIDecisionLogs: async (params?: any) => {
    const response = await axiosInstance.get('/ai-governance/decisions', { params });
    return response.data;
  },

  getDecisionLogsBySubject: async (subjectType: string, subjectId: string): Promise<AIDecisionLog[]> => {
    const response = await axiosInstance.get(`/ai-governance/decisions/subject/${subjectType}/${subjectId}`);
    return response.data;
  },

  getFlaggedDecisions: async (organizationId: string): Promise<AIDecisionLog[]> => {
    const response = await axiosInstance.get(`/ai-governance/organizations/${organizationId}/decisions/flagged`);
    return response.data;
  },

  // Compliance & Reporting
  generateComplianceReport: async (data: any) => {
    const response = await axiosInstance.post('/ai-governance/compliance/report', data);
    return response.data;
  },

  getSystemsDueForReview: async (organizationId: string): Promise<AISystem[]> => {
    const response = await axiosInstance.get(`/ai-governance/organizations/${organizationId}/systems/due-for-review`);
    return response.data;
  },

  getDashboard: async (organizationId: string) => {
    const response = await axiosInstance.get(`/ai-governance/organizations/${organizationId}/dashboard`);
    return response.data;
  },
};
