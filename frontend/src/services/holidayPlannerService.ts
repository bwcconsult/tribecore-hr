import { axiosInstance } from '../lib/axios';

// ==================== TYPES ====================

export interface LeaveBalance {
  leaveTypeCode: string;
  leaveTypeName: string;
  color?: string;
  entitled: string;
  accrued: string;
  carriedOver: string;
  purchased: string;
  sold: string;
  taken: string;
  pending: string;
  available: string;
  expiringSoon: string;
  expiryDate?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  durationHours: string;
  durationDays: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason: string;
  createdAt: string;
  autoApproved?: boolean;
  warnings?: string[];
  coverageBreaches?: CoverageBreach[];
  suggestedAlternatives?: string[];
}

export interface CoverageBreach {
  date: string;
  scope: string;
  role?: string;
  scheduled: number;
  onLeave: number;
  remaining: number;
  minRequired: number;
  status: 'OK' | 'WARNING' | 'BREACH' | 'CRITICAL';
  coveragePercent: number;
}

export interface PartialDay {
  date: Date;
  startTime?: string;
  endTime?: string;
  minutes: number;
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeCode: string;
  startDate: Date;
  endDate: Date;
  partialDays?: PartialDay[];
  reason: string;
  employeeNotes?: string;
  attachments?: Attachment[];
  coverEmployeeId?: string;
}

export interface ApproveLeaveDto {
  comment?: string;
  override?: {
    type: 'COVERAGE' | 'EMBARGO' | 'NOTICE' | 'BALANCE' | 'COMPLIANCE';
    reason: string;
    authorizedBy?: string;
  };
  requiresBackfill?: boolean;
  backfillAssignedTo?: string;
}

export interface RejectLeaveDto {
  reason: string;
  suggestedAction?: string;
}

export interface PublicHoliday {
  date: string;
  name: string;
  type: string;
  isCompanySpecific: boolean;
}

export interface LeaveType {
  code: string;
  name: string;
  unit: string;
  entitlement: any;
  accrual: any;
  carryover: any;
  purchaseSell: any;
  minNoticeDays: number;
}

export interface LeavePolicy {
  organizationId: string;
  leaveTypes: LeaveType[];
}

// ==================== SERVICE ====================

export const holidayPlannerService = {
  // ==================== LEAVE REQUESTS ====================

  /**
   * Create a new leave request
   */
  createRequest: async (dto: CreateLeaveRequestDto) => {
    const response = await axiosInstance.post<{
      id: string;
      status: string;
      autoApproved: boolean;
      totalDaysRequested: number;
      totalHoursRequested: string;
      balanceAfter: string;
      warnings: string[];
      coverageBreaches: CoverageBreach[];
      suggestedAlternatives?: Date[];
    }>('/leave/requests', dto);
    return response.data;
  },

  /**
   * Get leave requests with filters
   */
  getRequests: async (filters?: {
    status?: string;
    employeeId?: string;
    approverId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await axiosInstance.get<LeaveRequest[]>('/leave/requests', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get leave request details
   */
  getRequestById: async (id: string) => {
    const response = await axiosInstance.get<any>(`/leave/requests/${id}`);
    return response.data;
  },

  /**
   * Approve a leave request
   */
  approveRequest: async (id: string, dto: ApproveLeaveDto) => {
    const response = await axiosInstance.post<{
      approved: boolean;
      completed: boolean;
      nextStep?: string;
      message: string;
    }>(`/leave/requests/${id}/approve`, dto);
    return response.data;
  },

  /**
   * Reject a leave request
   */
  rejectRequest: async (id: string, dto: RejectLeaveDto) => {
    const response = await axiosInstance.post<{
      rejected: boolean;
      message: string;
    }>(`/leave/requests/${id}/reject`, dto);
    return response.data;
  },

  /**
   * Cancel a leave request
   */
  cancelRequest: async (id: string) => {
    const response = await axiosInstance.post<{
      cancelled: boolean;
      message: string;
    }>(`/leave/requests/${id}/cancel`);
    return response.data;
  },

  // ==================== BALANCES ====================

  /**
   * Get leave balances for an employee
   */
  getBalances: async (employeeId: string, asOf?: string) => {
    const response = await axiosInstance.get<LeaveBalance[]>(
      `/leave/employees/${employeeId}/leave/balances`,
      {
        params: asOf ? { asOf } : undefined,
      },
    );
    return response.data;
  },

  // ==================== PUBLIC HOLIDAYS ====================

  /**
   * Get public holidays
   */
  getPublicHolidays: async (country: string, state?: string, year?: number) => {
    const response = await axiosInstance.get<PublicHoliday[]>('/leave/holidays', {
      params: { country, state, year },
    });
    return response.data;
  },

  // ==================== POLICY ====================

  /**
   * Get organization leave policy
   */
  getPolicy: async (organizationId: string) => {
    const response = await axiosInstance.get<LeavePolicy>(`/leave/policies/${organizationId}`);
    return response.data;
  },

  // ==================== EXPORTS ====================

  /**
   * Export payroll deductions
   */
  exportPayrollDeductions: async (period: string) => {
    const response = await axiosInstance.get('/leave/exports/payroll/leave-deductions', {
      params: { period },
    });
    return response.data;
  },

  // ==================== HELPER METHODS ====================

  /**
   * Calculate working days between dates
   */
  calculateWorkingDays: (startDate: Date, endDate: Date, excludeWeekends: boolean = true): number => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  },

  /**
   * Format duration for display
   */
  formatDuration: (hours: number): string => {
    if (hours < 8) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;
    return remainingHours > 0
      ? `${days}d ${remainingHours.toFixed(1)}h`
      : `${days}d`;
  },

  /**
   * Get status color
   */
  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: '#FFA500',
      APPROVED: '#4CAF50',
      REJECTED: '#F44336',
      CANCELLED: '#9E9E9E',
      DRAFT: '#2196F3',
    };
    return colors[status] || '#757575';
  },

  /**
   * Get coverage status color
   */
  getCoverageStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      OK: '#4CAF50',
      WARNING: '#FFA500',
      BREACH: '#FF5722',
      CRITICAL: '#F44336',
    };
    return colors[status] || '#757575';
  },
};
