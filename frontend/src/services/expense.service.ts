import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface ExpenseItem {
  id?: string;
  categoryId: string;
  amount: number;
  currency?: string;
  expenseDate: string;
  vendor?: string;
  description: string;
  projectId?: string;
  departmentId?: string;
  mileageDistance?: number;
  mileageRate?: number;
  startLocation?: string;
  endLocation?: string;
  receiptRequired?: boolean;
  receiptAttached?: boolean;
}

export interface ExpenseClaim {
  id?: string;
  claimNumber?: string;
  employeeId?: string;
  title: string;
  description?: string;
  totalAmount?: number;
  currency?: string;
  exchangeRate?: number;
  status?: string;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  departmentId?: string;
  projectId?: string;
  items: ExpenseItem[];
  hasPolicyViolations?: boolean;
  policyViolations?: any[];
  approvals?: any[];
  employee?: any;
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
    const response = await axios.post(`${API_BASE_URL}/expenses/claims`, data);
    return response.data;
  },

  async getAllClaims(query?: ExpenseQuery) {
    const response = await axios.get(`${API_BASE_URL}/expenses/claims`, { params: query });
    return response.data;
  },

  async getMyClaims(query?: ExpenseQuery) {
    const response = await axios.get(`${API_BASE_URL}/expenses/claims/my-expenses`, { params: query });
    return response.data;
  },

  async getClaim(id: string) {
    const response = await axios.get(`${API_BASE_URL}/expenses/claims/${id}`);
    return response.data;
  },

  async updateClaim(id: string, data: Partial<ExpenseClaim>) {
    const response = await axios.put(`${API_BASE_URL}/expenses/claims/${id}`, data);
    return response.data;
  },

  async submitClaim(id: string) {
    const response = await axios.post(`${API_BASE_URL}/expenses/claims/${id}/submit`);
    return response.data;
  },

  async deleteClaim(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/expenses/claims/${id}`);
    return response.data;
  },

  async getClaimStatistics(employeeId?: string) {
    const response = await axios.get(`${API_BASE_URL}/expenses/claims/statistics`, {
      params: { employeeId },
    });
    return response.data;
  },

  // Approvals
  async getPendingApprovals() {
    const response = await axios.get(`${API_BASE_URL}/expenses/approvals/pending`);
    return response.data;
  },

  async approveExpense(approvalId: string, data: ApprovalAction) {
    const response = await axios.post(`${API_BASE_URL}/expenses/approvals/${approvalId}/approve`, data);
    return response.data;
  },

  async getApprovalHistory(claimId: string) {
    const response = await axios.get(`${API_BASE_URL}/expenses/approvals/claim/${claimId}`);
    return response.data;
  },

  async getApprovalStatistics() {
    const response = await axios.get(`${API_BASE_URL}/expenses/approvals/statistics`);
    return response.data;
  },

  async delegateApproval(approvalId: string, toUserId: string) {
    const response = await axios.post(`${API_BASE_URL}/expenses/approvals/${approvalId}/delegate`, {
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

  // File upload (placeholder - will implement with actual file storage)
  async uploadReceipt(expenseItemId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expenseItemId', expenseItemId);

    const response = await axios.post(`${API_BASE_URL}/expenses/receipts/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default expenseService;
