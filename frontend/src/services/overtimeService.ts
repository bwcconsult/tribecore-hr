import axiosInstance from '../lib/axios';

// ==================== TYPES ====================

export interface Shift {
  id: string;
  employeeId: string;
  organizationId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  actualHours?: number;
  shiftType: 'DAY' | 'NIGHT' | 'EVENING' | 'HOLIDAY' | 'WEEKEND' | 'STANDBY' | 'ON_CALL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CONFIRMED' | 'APPROVED';
  source: string;
  breaks?: Break[];
  overtimeHours?: number;
  overtimeAmount?: number;
  fatigueScore?: number;
  flags?: any;
}

export interface Break {
  id: string;
  start: Date;
  end: Date;
  durationMinutes: number;
  isPaid: boolean;
  type: 'MEAL' | 'REST' | 'OTHER';
  notes?: string;
}

export interface OvertimeLine {
  id: string;
  shiftId: string;
  rateClass: string;
  basis: string;
  quantityHours: number;
  multiplier: number;
  calculatedAmount: number;
  earningCode: string;
  explainTrace: any;
  status: string;
}

export interface FatigueScore {
  employeeId: string;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: {
    hoursWorked: number;
    nightShifts: number;
    consecutiveDays: number;
    overtimeHours: number;
    restDeficit: number;
    shiftLength: number;
  };
  recommendations: string[];
  breaches: any[];
}

export interface CompTimeBalance {
  employeeId: string;
  balanceHours: number;
  totalAccrued: number;
  totalRedeemed: number;
  expiringWithin30Days: number;
}

export interface Budget {
  id: string;
  name: string;
  costCenter?: string;
  project?: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  capHours?: number;
  capAmount?: number;
  spentHours: number;
  spentAmount: number;
  remainingHours?: number;
  remainingAmount?: number;
  percentageUsed: number;
  status: string;
}

export interface OvertimeApproval {
  id: string;
  shiftId: string;
  employeeId: string;
  currentLevel: string;
  status: string;
  hoursRequested: number;
  amountEstimated: number;
  dueAt?: Date;
  isOverdue: boolean;
}

// ==================== SERVICE ====================

class OvertimeService {
  private baseURL = '/overtime-enhanced';

  // ==================== SHIFT MANAGEMENT ====================

  /**
   * Create a new shift / Clock in
   */
  async createShift(data: {
    employeeId: string;
    organizationId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart?: Date;
    shiftType?: string;
    source: string;
    locationId?: string;
    costCenter?: string;
    project?: string;
    deviceId?: string;
    isEmergency?: boolean;
    isRemote?: boolean;
    taskDescription?: string;
  }): Promise<{ success: boolean; shift?: Shift; warnings?: string[] }> {
    const response = await axiosInstance.post(`${this.baseURL}/shifts`, data);
    return response.data;
  }

  /**
   * Punch in or out
   */
  async punch(shiftId: string, data: {
    timestamp: Date;
    latitude?: number;
    longitude?: number;
    deviceId?: string;
    biometricToken?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post(`${this.baseURL}/shifts/${shiftId}/punch`, data);
    return response.data;
  }

  /**
   * Add break to shift
   */
  async addBreak(shiftId: string, data: {
    start: Date;
    end: Date;
    isPaid: boolean;
    type: 'MEAL' | 'REST' | 'OTHER';
    notes?: string;
  }): Promise<{ success: boolean; break?: Break }> {
    const response = await axiosInstance.post(`${this.baseURL}/shifts/${shiftId}/breaks`, data);
    return response.data;
  }

  /**
   * Complete shift
   */
  async completeShift(shiftId: string): Promise<{ success: boolean }> {
    const response = await axiosInstance.patch(`${this.baseURL}/shifts/${shiftId}/complete`);
    return response.data;
  }

  // ==================== OVERTIME CALCULATION ====================

  /**
   * Calculate overtime for shift
   */
  async calculateOvertime(data: {
    shiftId: string;
    employeeBaseRate?: number;
    weeklyHoursWorked?: number;
    consecutiveDaysWorked?: number;
  }): Promise<{
    success: boolean;
    shiftId: string;
    totalOvertimeHours: number;
    totalOvertimeAmount: number;
    overtimeLines: any[];
    warnings: string[];
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/calculate`, data);
    return response.data;
  }

  /**
   * Preview overtime calculation without saving
   */
  async previewOvertime(data: {
    shiftId: string;
    employeeBaseRate?: number;
    weeklyHoursWorked?: number;
    consecutiveDaysWorked?: number;
  }): Promise<any> {
    const response = await axiosInstance.post(`${this.baseURL}/calculate/preview`, data);
    return response.data;
  }

  // ==================== APPROVALS ====================

  /**
   * Get pending approvals
   */
  async getPendingApprovals(managerId: string, level?: string): Promise<{
    success: boolean;
    count: number;
    approvals: OvertimeApproval[];
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/approvals/pending`, {
      params: { managerId, level },
    });
    return response.data;
  }

  /**
   * Approve overtime
   */
  async approveOvertime(approvalId: string, data: {
    approvedBy: string;
    comments?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post(`${this.baseURL}/approvals/${approvalId}/approve`, data);
    return response.data;
  }

  /**
   * Reject overtime
   */
  async rejectOvertime(approvalId: string, data: {
    rejectedBy: string;
    reason: string;
  }): Promise<{ success: boolean }> {
    const response = await axiosInstance.post(`${this.baseURL}/approvals/${approvalId}/reject`, data);
    return response.data;
  }

  /**
   * Bulk approve shifts
   */
  async bulkApprove(data: {
    shiftIds: string[];
    approvedBy: string;
    comments?: string;
  }): Promise<{
    success: boolean;
    approved: number;
    failed: number;
    results: any[];
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/approvals/bulk-approve`, data);
    return response.data;
  }

  // ==================== COMP-TIME ====================

  /**
   * Get comp-time balance
   */
  async getCompTimeBalance(employeeId: string): Promise<CompTimeBalance> {
    const response = await axiosInstance.get(`${this.baseURL}/comp-time/balance/${employeeId}`);
    return response.data;
  }

  /**
   * Redeem comp-time
   */
  async redeemCompTime(data: {
    employeeId: string;
    hoursToRedeem: number;
    approvedBy: string;
    leaveRequestId?: string;
    reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
    remainingBalance: number;
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/comp-time/redeem`, data);
    return response.data;
  }

  // ==================== FATIGUE & SAFETY ====================

  /**
   * Check fatigue score
   */
  async checkFatigue(employeeId: string, asOfDate?: Date): Promise<FatigueScore> {
    const response = await axiosInstance.post(`${this.baseURL}/fatigue/check`, {
      employeeId,
      asOfDate,
    });
    return response.data;
  }

  /**
   * Check rest compliance
   */
  async checkRestCompliance(data: {
    employeeId: string;
    proposedShiftStart: Date;
    country: string;
    sector?: string;
  }): Promise<{
    success: boolean;
    compliant: boolean;
    hasBreach: boolean;
    hoursSinceLastShift: number;
    minimumRequired: number;
    deficit: number;
    severity: string;
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/rest/check`, data);
    return response.data;
  }

  /**
   * Check if fit for shift
   */
  async checkFitForShift(
    employeeId: string,
    shiftStart: Date,
    duration: number,
    country: string,
  ): Promise<{
    success: boolean;
    fit: boolean;
    score: number;
    reasons: string[];
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/fatigue/fit-for-shift/${employeeId}`, {
      params: {
        shiftStart: shiftStart.toISOString(),
        duration,
        country,
      },
    });
    return response.data;
  }

  // ==================== BUDGET ====================

  /**
   * Check budget capacity
   */
  async checkBudgetCapacity(
    costCenter: string,
    project: string,
    hours: number,
    amount: number,
  ): Promise<{
    success: boolean;
    hasCapacity: boolean;
    budgetId: string;
    remaining: { hours?: number; amount?: number };
    percentUsed: number;
    status: string;
    warnings: string[];
    requiresApproval: boolean;
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/budgets/check-capacity`, {
      params: { costCenter, project, hours, amount },
    });
    return response.data;
  }

  /**
   * Get budget forecast
   */
  async getBudgetForecast(budgetId: string): Promise<{
    success: boolean;
    budgetId: string;
    currentSpend: number;
    projectedSpend: number;
    projectedOverrun: number;
    daysRemaining: number;
    averageDailySpend: number;
    recommendations: string[];
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/budgets/${budgetId}/forecast`);
    return response.data;
  }

  /**
   * Get budgets needing attention
   */
  async getBudgetsNeedingAttention(): Promise<{
    success: boolean;
    count: number;
    budgets: Budget[];
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/budgets/attention`);
    return response.data;
  }

  // ==================== POLICIES ====================

  /**
   * Initialize default policies
   */
  async initializePolicies(organizationId: string, countries?: string[]): Promise<{
    success: boolean;
    message: string;
    policies: any[];
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/policies/initialize`, {
      organizationId,
      countries,
    });
    return response.data;
  }

  /**
   * Get applicable policy
   */
  async getApplicablePolicy(
    country: string,
    sector?: string,
    state?: string,
    date?: Date,
  ): Promise<{
    success: boolean;
    policy?: any;
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/policies/applicable`, {
      params: { country, sector, state, date: date?.toISOString() },
    });
    return response.data;
  }

  // ==================== REPORTING ====================

  /**
   * Query overtime lines
   */
  async queryOvertimeLines(filters: {
    employeeId?: string;
    costCenter?: string;
    project?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    page: number;
    limit: number;
    total: number;
    data: OvertimeLine[];
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/lines`, { params: filters });
    return response.data;
  }

  /**
   * Export to payroll
   */
  async exportToPayroll(data: {
    payrollId: string;
    periodStart?: Date;
    periodEnd?: Date;
    costCenters?: string[];
    lockLines?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    linesExported: number;
    totalAmount: number;
  }> {
    const response = await axiosInstance.post(`${this.baseURL}/export/payroll`, data);
    return response.data;
  }

  /**
   * Get audit trail
   */
  async getAuditTrail(lineId: string): Promise<{
    success: boolean;
    lineId: string;
    explainTrace: any;
    timeBlocks: any[];
    approvals: any[];
  }> {
    const response = await axiosInstance.get(`${this.baseURL}/audit/${lineId}`);
    return response.data;
  }
}

export default new OvertimeService();
