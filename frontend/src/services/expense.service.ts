import { axiosInstance as axios } from '../lib/axios';

const API_BASE_URL = '';

export interface ExpenseItem {
  id?: string;
  categoryId: string;
  amount: number;
  currencyCode?: string;
  txnDate: string;
  merchant?: string;
  description?: string;
  taxCodeId?: string;
  receiptUrl?: string;
  distanceKm?: number;
  perDiem?: boolean;
  projectSplitPct?: number;
  glCodeOverride?: string;
  policyFlags?: any;
}

export interface ExpenseClaim {
  id?: string;
  title: string;
  description?: string;
  currencyCode?: string;
  totalAmount?: number;
  status?: string;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  createdById?: string;
  createdBy?: any;
  approverId?: string;
  approver?: any;
  projectId?: string;
  project?: any;
  merchantSummary?: string;
  items: ExpenseItem[];
  approvals?: any[];
  currency?: any;
}

export interface ExpenseQuery {
  status?: string;
  employeeId?: string;
  departmentId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApprovalAction {
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  rejectionReason?: string;
  isOverride?: boolean;
  overrideJustification?: string;
}

const expenseService = {
  // Expense Claims
  async createClaim(data: ExpenseClaim) {
    const response = await axios.post(`${API_BASE_URL}/api/expenses`, data);
    return response.data;
  },

  async getAllClaims(query?: ExpenseQuery) {
    const response = await axios.get(`${API_BASE_URL}/api/expenses`, { params: query });
    return response.data;
  },

  async getMyClaims(query?: ExpenseQuery) {
    const response = await axios.get(`${API_BASE_URL}/api/expenses/my-expenses`, { params: query });
    return response.data;
  },

  async getClaim(id: string) {
    const response = await axios.get(`${API_BASE_URL}/api/expenses/${id}`);
    return response.data;
  },

  async updateClaim(id: string, data: Partial<ExpenseClaim>) {
    const response = await axios.put(`${API_BASE_URL}/api/expenses/${id}`, data);
    return response.data;
  },

  async submitClaim(id: string) {
    const response = await axios.post(`${API_BASE_URL}/api/expenses/${id}/submit`);
    return response.data;
  },

  async deleteClaim(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
    return response.data;
  },

  async getClaimStatistics(employeeId?: string) {
    const response = await axios.get(`${API_BASE_URL}/api/expenses/stats`, {
      params: { employeeId },
    });
    return response.data;
  },

  // Approvals
  async getPendingApprovals() {
    const response = await axios.get(`${API_BASE_URL}/api/approvals`, { params: { me: '1', decision: 'PENDING' } });
    return response.data;
  },

  async approveExpense(claimId: string, comment?: string) {
    const response = await axios.post(`${API_BASE_URL}/api/expenses/${claimId}/approve`, { comment });
    return response.data;
  },

  async rejectExpense(claimId: string, comment: string) {
    const response = await axios.post(`${API_BASE_URL}/api/expenses/${claimId}/reject`, { comment });
    return response.data;
  },

  async getApprovalHistory(claimId: string) {
    const response = await axios.get(`${API_BASE_URL}/api/approvals`, { params: { claimId } });
    return response.data;
  },

  async getApprovalStatistics() {
    const response = await axios.get(`${API_BASE_URL}/api/approvals/stats`);
    return response.data;
  },

  async delegateApproval(approvalId: string, toUserId: string) {
    const response = await axios.post(`${API_BASE_URL}/api/approvals/${approvalId}/delegate`, {
      toUserId,
    });
    return response.data;
  },

  // Reimbursements
  async getReimbursements(status?: string) {
    const response = await axios.get(`${API_BASE_URL}/expenses/reimbursements`, {
      params: { status },
    });
    return response.data;
  },

  async createReimbursement(claimId: string, data: any) {
    const response = await axios.post(`${API_BASE_URL}/expenses/reimbursements/claim/${claimId}`, data);
    return response.data;
  },

  async markReimbursementPaid(id: string, paymentReference: string) {
    const response = await axios.post(`${API_BASE_URL}/expenses/reimbursements/${id}/mark-paid`, {
      paymentReference,
    });
    return response.data;
  },

  async getReimbursementStatistics() {
    const response = await axios.get(`${API_BASE_URL}/expenses/reimbursements/statistics`);
    return response.data;
  },

  // Categories & Tax Codes
  async getCategories() {
    const response = await axios.get(`${API_BASE_URL}/api/expense-categories`);
    return response.data;
  },

  async getTaxCodes() {
    const response = await axios.get(`${API_BASE_URL}/api/tax-codes`);
    return response.data;
  },

  async seedCategories() {
    const response = await axios.post(`${API_BASE_URL}/api/expenses/categories/seed`);
    return response.data;
  },

  // Analytics
  async getAnalyticsOverview(startDate?: string, endDate?: string, departmentId?: string, employeeId?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (departmentId) params.append('departmentId', departmentId);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/overview?${params.toString()}`);
    return response.data;
  },

  async getExpenseTrends(months: number = 12, departmentId?: string, employeeId?: string) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (departmentId) params.append('departmentId', departmentId);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/trends?${params.toString()}`);
    return response.data;
  },

  async getCategoryBreakdown(startDate?: string, endDate?: string, departmentId?: string, employeeId?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (departmentId) params.append('departmentId', departmentId);
    if (employeeId) params.append('employeeId', employeeId);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/by-category?${params.toString()}`);
    return response.data;
  },

  async getTopSpenders(limit: number = 10, startDate?: string, endDate?: string, departmentId?: string) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (departmentId) params.append('departmentId', departmentId);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/top-spenders?${params.toString()}`);
    return response.data;
  },

  async getApprovalMetrics(startDate?: string, endDate?: string, approverId?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (approverId) params.append('approverId', approverId);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/approval-metrics?${params.toString()}`);
    return response.data;
  },

  async getDepartmentComparison(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/by-department?${params.toString()}`);
    return response.data;
  },

  async getPolicyViolations(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`${API_BASE_URL}/expenses/analytics/policy-violations?${params.toString()}`);
    return response.data;
  },

  // File upload
  async uploadReceipt(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/api/receipts/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mark as Paid (Finance only)
  async markAsPaid(claimId: string) {
    const response = await axios.post(`${API_BASE_URL}/api/expenses/${claimId}/mark-paid`);
    return response.data;
  },
};

export default expenseService;
