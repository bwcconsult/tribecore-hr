import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ========== EQUALITY & DISCRIMINATION ==========
export const createEqualityCase = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/equality-cases`, data);
  return response.data;
};

export const getAllEqualityCases = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/equality-cases?organizationId=${organizationId}`);
  return response.data;
};

export const getEqualityCase = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/equality-cases/${id}`);
  return response.data;
};

export const updateEqualityCase = async (id: string, data: any, updatedBy: string) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/equality-cases/${id}`, { ...data, updatedBy });
  return response.data;
};

export const addReasonableAdjustments = async (id: string, adjustment: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/equality-cases/${id}/adjustments`, adjustment);
  return response.data;
};

// ========== WORKING TIME REGULATIONS ==========
export const createWorkingTimeCompliance = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/working-time-compliance`, data);
  return response.data;
};

export const getWorkingTimeCompliance = async (organizationId: string, employeeId?: string) => {
  let url = `${API_BASE_URL}/employment-law/working-time-compliance?organizationId=${organizationId}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  const response = await axios.get(url);
  return response.data;
};

export const getWorkingTimeViolations = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/working-time-compliance/violations?organizationId=${organizationId}`);
  return response.data;
};

// ========== REDUNDANCY PROCESS ==========
export const createRedundancyProcess = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/redundancy-processes`, data);
  return response.data;
};

export const getAllRedundancyProcesses = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/redundancy-processes?organizationId=${organizationId}`);
  return response.data;
};

export const updateRedundancyProcess = async (id: string, data: any, updatedBy: string) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/redundancy-processes/${id}`, { ...data, updatedBy });
  return response.data;
};

export const addSelectionPool = async (id: string, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/redundancy-processes/${id}/selection-pool`, data);
  return response.data;
};

export const setSelectionCriteria = async (id: string, criteria: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/redundancy-processes/${id}/selection-criteria`, { criteria });
  return response.data;
};

export const scoreEmployee = async (id: string, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/redundancy-processes/${id}/score-employee`, data);
  return response.data;
};

export const offerAlternativeRole = async (id: string, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/redundancy-processes/${id}/alternative-role`, data);
  return response.data;
};

export const calculateRedundancyPay = async (id: string, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/redundancy-processes/${id}/calculate-pay`, data);
  return response.data;
};

// ========== WHISTLEBLOWING ==========
export const createWhistleblowingCase = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/whistleblowing-cases`, data);
  return response.data;
};

export const getAllWhistleblowingCases = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/whistleblowing-cases?organizationId=${organizationId}`);
  return response.data;
};

export const updateWhistleblowingCase = async (id: string, data: any, updatedBy: string) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/whistleblowing-cases/${id}`, { ...data, updatedBy });
  return response.data;
};

// ========== EMPLOYMENT CONTRACTS ==========
export const createEmploymentContract = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/contracts`, data);
  return response.data;
};

export const getAllContracts = async (organizationId: string, employeeId?: string) => {
  let url = `${API_BASE_URL}/employment-law/contracts?organizationId=${organizationId}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  const response = await axios.get(url);
  return response.data;
};

export const getContract = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/contracts/${id}`);
  return response.data;
};

export const updateEmploymentContract = async (id: string, data: any, updatedBy: string) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/contracts/${id}`, { ...data, updatedBy });
  return response.data;
};

// ========== MINIMUM WAGE COMPLIANCE ==========
export const checkMinimumWage = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/minimum-wage-compliance`, data);
  return response.data;
};

export const getMinimumWageCompliance = async (organizationId: string, employeeId?: string) => {
  let url = `${API_BASE_URL}/employment-law/minimum-wage-compliance?organizationId=${organizationId}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  const response = await axios.get(url);
  return response.data;
};

export const getMinimumWageViolations = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/minimum-wage-compliance/violations?organizationId=${organizationId}`);
  return response.data;
};

// ========== FAMILY LEAVE ==========
export const createFamilyLeave = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/family-leave`, data);
  return response.data;
};

export const getAllFamilyLeave = async (organizationId: string, employeeId?: string) => {
  let url = `${API_BASE_URL}/employment-law/family-leave?organizationId=${organizationId}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  const response = await axios.get(url);
  return response.data;
};

export const updateFamilyLeave = async (id: string, data: any) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/family-leave/${id}`, data);
  return response.data;
};

// ========== GDPR COMPLIANCE ==========
export const createGDPRDataRequest = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/gdpr/data-requests`, data);
  return response.data;
};

export const getAllGDPRDataRequests = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/gdpr/data-requests?organizationId=${organizationId}`);
  return response.data;
};

export const updateGDPRDataRequest = async (id: string, status: string, responseDetails?: string, completedBy?: string) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/gdpr/data-requests/${id}`, { status, responseDetails, completedBy });
  return response.data;
};

export const createGDPRDataBreach = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/gdpr/data-breaches`, data);
  return response.data;
};

export const getAllGDPRDataBreaches = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/gdpr/data-breaches?organizationId=${organizationId}`);
  return response.data;
};

// ========== AGENCY WORKERS ==========
export const createAgencyWorker = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/employment-law/agency-workers`, data);
  return response.data;
};

export const getAllAgencyWorkers = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/agency-workers?organizationId=${organizationId}`);
  return response.data;
};

export const updateAgencyWorker = async (id: string, data: any) => {
  const response = await axios.put(`${API_BASE_URL}/employment-law/agency-workers/${id}`, data);
  return response.data;
};

export const checkAgencyWorkerCompliance = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/agency-workers/compliance-check?organizationId=${organizationId}`);
  return response.data;
};

// ========== DASHBOARD & ANALYTICS ==========
export const getEmploymentLawDashboard = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/employment-law/dashboard?organizationId=${organizationId}`);
  return response.data;
};

// Legal Services (existing)
export const createAdviceRequest = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/legal-services/advice-requests`, data);
  return response.data;
};

export const getAllAdviceRequests = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/legal-services/advice-requests?organizationId=${organizationId}`);
  return response.data;
};

export const respondToAdvice = async (id: string, response: string, respondedBy: string) => {
  const res = await axios.put(`${API_BASE_URL}/legal-services/advice-requests/${id}/respond`, { response, respondedBy });
  return res.data;
};

export const getAllTemplates = async (category?: string) => {
  let url = `${API_BASE_URL}/legal-services/templates`;
  if (category) url += `?category=${category}`;
  const response = await axios.get(url);
  return response.data;
};

export const getTemplate = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/legal-services/templates/${id}`);
  return response.data;
};

export const generateDocument = async (id: string, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/legal-services/templates/${id}/generate`, data);
  return response.data;
};

export const getAllClaims = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/legal-services/claims?organizationId=${organizationId}`);
  return response.data;
};

export const createClaim = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/legal-services/claims`, data);
  return response.data;
};

export const getAnalytics = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/legal-services/analytics?organizationId=${organizationId}`);
  return response.data;
};
