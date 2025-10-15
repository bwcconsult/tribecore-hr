import axios from '../lib/axios';

export interface Requisition {
  id: string;
  organizationId: string;
  createdBy: string;
  departmentId: string;
  locationId?: string;
  jobTitle: string;
  headcount: number;
  employmentType: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  currency: string;
  hiringManagerId: string;
  recruiterId?: string;
  urgencyLevel: string;
  isUrgent: boolean;
  status: string;
  approvals: any[];
  fullyApproved: boolean;
  approvedAt?: Date;
  budgetAmount?: number;
  justification?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  candidateId: string;
  jobPostingId: string;
  organizationId: string;
  stage: string;
  status: string;
  scoreTotal?: number;
  flags: any[];
  tags: string[];
  candidate?: any;
  jobPosting?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  applicationId: string;
  organizationId: string;
  type: string;
  panel: any[];
  scheduledStart: Date;
  scheduledEnd: Date;
  location?: string;
  meetingLink?: string;
  outcome?: string;
  createdAt: Date;
}

export interface Scorecard {
  id: string;
  interviewId: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  status: string;
  recommendation?: string;
  overallScore?: number;
  dueAt: Date;
  submittedAt?: Date;
}

class RecruitmentService {
  // ==================== REQUISITIONS ====================

  async getRequisitions(params?: any) {
    const response = await axios.get('/api/v1/recruitment/requisitions', { params });
    return response.data;
  }

  async getRequisition(id: string) {
    const response = await axios.get(`/api/v1/recruitment/requisitions/${id}`);
    return response.data;
  }

  async createRequisition(data: any) {
    const response = await axios.post('/api/v1/recruitment/requisitions', data);
    return response.data;
  }

  async updateRequisition(id: string, data: any) {
    const response = await axios.patch(`/api/v1/recruitment/requisitions/${id}`, data);
    return response.data;
  }

  async deleteRequisition(id: string) {
    await axios.delete(`/api/v1/recruitment/requisitions/${id}`);
  }

  async submitRequisitionForApproval(id: string) {
    const response = await axios.post(`/api/v1/recruitment/requisitions/${id}/submit`);
    return response.data;
  }

  async approveRequisition(id: string, comments?: string) {
    const response = await axios.post(`/api/v1/recruitment/requisitions/${id}/approve`, { comments });
    return response.data;
  }

  async rejectRequisition(id: string, reason: string) {
    const response = await axios.post(`/api/v1/recruitment/requisitions/${id}/reject`, { reason });
    return response.data;
  }

  async getPendingApprovals() {
    const response = await axios.get('/api/v1/recruitment/requisitions/pending-approvals/list');
    return response.data;
  }

  async getRequisitionStats() {
    const response = await axios.get('/api/v1/recruitment/requisitions/stats/summary');
    return response.data;
  }

  async cloneRequisition(id: string) {
    const response = await axios.post(`/api/v1/recruitment/requisitions/${id}/clone`);
    return response.data;
  }

  async cancelRequisition(id: string, reason: string) {
    const response = await axios.post(`/api/v1/recruitment/requisitions/${id}/cancel`, { reason });
    return response.data;
  }

  // ==================== APPLICATIONS ====================

  async getApplications(params?: any) {
    const response = await axios.get('/api/v1/recruitment/applications', { params });
    return response.data;
  }

  async getApplication(id: string) {
    const response = await axios.get(`/api/v1/recruitment/applications/${id}`);
    return response.data;
  }

  async getPipeline(requisitionId: string) {
    const response = await axios.get(`/api/v1/recruitment/applications/pipeline/${requisitionId}`);
    return response.data;
  }

  async moveApplicationStage(id: string, toStage: string, comment?: string, reasonCategory?: string) {
    const response = await axios.post(`/api/v1/recruitment/applications/${id}/move`, {
      toStage,
      comment,
      reasonCategory,
    });
    return response.data;
  }

  async rejectApplication(id: string, reason: string, feedback?: string) {
    const response = await axios.post(`/api/v1/recruitment/applications/${id}/reject`, {
      reason,
      feedback,
    });
    return response.data;
  }

  async bulkMoveApplications(applicationIds: string[], toStage: string, comment?: string) {
    const response = await axios.post('/api/v1/recruitment/applications/bulk/move', {
      applicationIds,
      toStage,
      comment,
    });
    return response.data;
  }

  async bulkRejectApplications(applicationIds: string[], reason: string, feedback?: string) {
    const response = await axios.post('/api/v1/recruitment/applications/bulk/reject', {
      applicationIds,
      reason,
      feedback,
    });
    return response.data;
  }

  async scoreApplication(id: string) {
    const response = await axios.post(`/api/v1/recruitment/applications/${id}/score`);
    return response.data;
  }

  async bulkScoreApplications(applicationIds: string[]) {
    const response = await axios.post('/api/v1/recruitment/applications/bulk/score', {
      applicationIds,
    });
    return response.data;
  }

  async addFlag(id: string, type: 'RED' | 'AMBER' | 'GREEN', reason: string) {
    const response = await axios.post(`/api/v1/recruitment/applications/${id}/flags`, {
      type,
      reason,
    });
    return response.data;
  }

  async removeFlag(id: string, flagIndex: number) {
    await axios.delete(`/api/v1/recruitment/applications/${id}/flags/${flagIndex}`);
  }

  async addTag(id: string, tag: string) {
    const response = await axios.post(`/api/v1/recruitment/applications/${id}/tags`, { tag });
    return response.data;
  }

  async removeTag(id: string, tag: string) {
    await axios.delete(`/api/v1/recruitment/applications/${id}/tags/${tag}`);
  }

  async getAvailableTransitions(id: string) {
    const response = await axios.get(`/api/v1/recruitment/applications/${id}/transitions`);
    return response.data;
  }

  async getApplicationStats(requisitionId?: string) {
    const params = requisitionId ? { requisitionId } : {};
    const response = await axios.get('/api/v1/recruitment/applications/stats/summary', { params });
    return response.data;
  }

  // ==================== INTERVIEWS ====================

  async scheduleInterview(data: any) {
    const response = await axios.post('/api/v1/recruitment/interviews', data);
    return response.data;
  }

  async getInterviews(params?: any) {
    const response = await axios.get('/api/v1/recruitment/interviews', { params });
    return response.data;
  }

  async getInterview(id: string) {
    const response = await axios.get(`/api/v1/recruitment/interviews/${id}`);
    return response.data;
  }

  async rescheduleInterview(id: string, newStart: string, newEnd: string, reason?: string) {
    const response = await axios.patch(`/api/v1/recruitment/interviews/${id}/reschedule`, {
      newStart,
      newEnd,
      reason,
    });
    return response.data;
  }

  async cancelInterview(id: string, reason: string) {
    await axios.delete(`/api/v1/recruitment/interviews/${id}`, { data: { reason } });
  }

  async findAvailableSlots(data: any) {
    const response = await axios.post('/api/v1/recruitment/interviews/available-slots', data);
    return response.data;
  }

  async getPanelLoad(panelUserIds: string[], fromDate: string, toDate: string) {
    const response = await axios.post('/api/v1/recruitment/interviews/panel-load', {
      panelUserIds,
      fromDate,
      toDate,
    });
    return response.data;
  }

  async suggestPanel(candidatePoolUserIds: string[], requiredPanelSize: number, interviewDate: string) {
    const response = await axios.post('/api/v1/recruitment/interviews/suggest-panel', {
      candidatePoolUserIds,
      requiredPanelSize,
      interviewDate,
    });
    return response.data;
  }

  async completeInterview(id: string) {
    const response = await axios.post(`/api/v1/recruitment/interviews/${id}/complete`);
    return response.data;
  }

  async getMyUpcomingInterviews() {
    const response = await axios.get('/api/v1/recruitment/interviews/my-interviews/upcoming');
    return response.data;
  }

  async getMyPendingScorecards() {
    const response = await axios.get('/api/v1/recruitment/interviews/my-scorecards/pending');
    return response.data;
  }

  async getScorecard(scorecardId: string) {
    const response = await axios.get(`/api/v1/recruitment/interviews/scorecards/${scorecardId}`);
    return response.data;
  }

  async updateScorecard(scorecardId: string, data: any) {
    const response = await axios.patch(`/api/v1/recruitment/interviews/scorecards/${scorecardId}`, data);
    return response.data;
  }

  async submitScorecard(scorecardId: string, data: any) {
    const response = await axios.post(`/api/v1/recruitment/interviews/scorecards/${scorecardId}/submit`, data);
    return response.data;
  }

  async getInterviewStats() {
    const response = await axios.get('/api/v1/recruitment/interviews/stats/summary');
    return response.data;
  }

  // ==================== ANALYTICS ====================

  async getFunnelMetrics(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/funnel', { params });
    return response.data;
  }

  async getTimeToHireMetrics(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/time-to-hire', { params });
    return response.data;
  }

  async getSourceOfHireMetrics(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/source-of-hire', { params });
    return response.data;
  }

  async getOfferAcceptanceMetrics(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/offer-acceptance', { params });
    return response.data;
  }

  async getRecruiterPerformance(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/recruiter-performance', { params });
    return response.data;
  }

  async getCostPerHire(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/cost-per-hire', { params });
    return response.data;
  }

  async getInterviewToOfferRatio(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/interview-to-offer-ratio', { params });
    return response.data;
  }

  async getRequisitionAging() {
    const response = await axios.get('/api/v1/recruitment/analytics/requisition-aging');
    return response.data;
  }

  async getDashboard(params?: any) {
    const response = await axios.get('/api/v1/recruitment/analytics/dashboard', { params });
    return response.data;
  }
}

export const recruitmentService = new RecruitmentService();
