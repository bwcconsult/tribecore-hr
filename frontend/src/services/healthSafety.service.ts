import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ========== HEALTH & SAFETY POLICY ==========
export const createHealthSafetyPolicy = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/policies`, data);
  return response.data;
};

export const getAllPolicies = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/policies?organizationId=${organizationId}`);
  return response.data;
};

export const getActivePolicy = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/policies/active?organizationId=${organizationId}`);
  return response.data;
};

export const updateHealthSafetyPolicy = async (id: string, data: any) => {
  const response = await axios.put(`${API_BASE_URL}/health-safety-enhanced/policies/${id}`, data);
  return response.data;
};

// ========== TRAINING MANAGEMENT ==========
export const createTrainingRecord = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/training`, data);
  return response.data;
};

export const getAllTraining = async (organizationId: string, employeeId?: string) => {
  let url = `${API_BASE_URL}/health-safety-enhanced/training?organizationId=${organizationId}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  const response = await axios.get(url);
  return response.data;
};

export const getExpiringTraining = async (organizationId: string, days: number = 30) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/training/expiring?organizationId=${organizationId}&days=${days}`);
  return response.data;
};

export const updateTrainingRecord = async (id: string, data: any) => {
  const response = await axios.put(`${API_BASE_URL}/health-safety-enhanced/training/${id}`, data);
  return response.data;
};

// ========== DSE ASSESSMENTS ==========
export const createDSEAssessment = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/dse-assessments`, data);
  return response.data;
};

export const getAllDSEAssessments = async (organizationId: string, employeeId?: string) => {
  let url = `${API_BASE_URL}/health-safety-enhanced/dse-assessments?organizationId=${organizationId}`;
  if (employeeId) url += `&employeeId=${employeeId}`;
  const response = await axios.get(url);
  return response.data;
};

export const getDSEAssessmentsDueReview = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/dse-assessments/due-review?organizationId=${organizationId}`);
  return response.data;
};

// ========== MANUAL HANDLING ASSESSMENTS ==========
export const createManualHandlingAssessment = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/manual-handling`, data);
  return response.data;
};

export const getAllManualHandlingAssessments = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/manual-handling?organizationId=${organizationId}`);
  return response.data;
};

// ========== FIRE RISK ASSESSMENTS ==========
export const createFireRiskAssessment = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/fire-risk-assessments`, data);
  return response.data;
};

export const getAllFireRiskAssessments = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/fire-risk-assessments?organizationId=${organizationId}`);
  return response.data;
};

// ========== RIDDOR REPORTING ==========
export const createRIDDORReport = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/riddor`, data);
  return response.data;
};

export const getAllRIDDORReports = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/riddor?organizationId=${organizationId}`);
  return response.data;
};

export const updateRIDDORReport = async (id: string, data: any) => {
  const response = await axios.put(`${API_BASE_URL}/health-safety-enhanced/riddor/${id}`, data);
  return response.data;
};

// ========== PPE MANAGEMENT ==========
export const createPPE = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/ppe`, data);
  return response.data;
};

export const issuePPE = async (id: string, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/ppe/${id}/issue`, data);
  return response.data;
};

export const getAllPPE = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/ppe?organizationId=${organizationId}`);
  return response.data;
};

export const getLowStockPPE = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/ppe/low-stock?organizationId=${organizationId}`);
  return response.data;
};

// ========== WORKPLACE INSPECTIONS ==========
export const createWorkplaceInspection = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/inspections`, data);
  return response.data;
};

export const getAllWorkplaceInspections = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/inspections?organizationId=${organizationId}`);
  return response.data;
};

// ========== HSE ENFORCEMENT ==========
export const createHSEEnforcement = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety-enhanced/enforcement`, data);
  return response.data;
};

export const getAllHSEEnforcement = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/enforcement?organizationId=${organizationId}`);
  return response.data;
};

export const updateHSEEnforcement = async (id: string, data: any) => {
  const response = await axios.put(`${API_BASE_URL}/health-safety-enhanced/enforcement/${id}`, data);
  return response.data;
};

// ========== COMPLIANCE DASHBOARD ==========
export const getComplianceDashboard = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety-enhanced/dashboard?organizationId=${organizationId}`);
  return response.data;
};

// ========== EXISTING ENDPOINTS (from original service) ==========
export const createRiskAssessment = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety/risk-assessments`, data);
  return response.data;
};

export const getAllRiskAssessments = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety/risk-assessments?organizationId=${organizationId}`);
  return response.data;
};

export const approveRiskAssessment = async (id: string, approvedBy: string) => {
  const response = await axios.put(`${API_BASE_URL}/health-safety/risk-assessments/${id}/approve`, { approvedBy });
  return response.data;
};

export const createIncident = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety/incidents`, data);
  return response.data;
};

export const getAllIncidents = async (organizationId: string, filters?: any) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety/incidents`, {
    params: { organizationId, ...filters },
  });
  return response.data;
};

export const createHazardousSubstance = async (data: any) => {
  const response = await axios.post(`${API_BASE_URL}/health-safety/substances`, data);
  return response.data;
};

export const getAllHazardousSubstances = async (organizationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety/substances?organizationId=${organizationId}`);
  return response.data;
};

export const getHealthSafetyAnalytics = async (organizationId: string, startDate: Date, endDate: Date) => {
  const response = await axios.get(`${API_BASE_URL}/health-safety/analytics`, {
    params: { organizationId, startDate, endDate },
  });
  return response.data;
};
