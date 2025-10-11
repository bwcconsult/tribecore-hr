import api from './api';

export interface CalendarEvent {
  id: string;
  type: 'HOLIDAY' | 'BIRTHDAY' | 'LEVEL_UP_DAY' | 'SICKNESS' | 'OTHER_ABSENCE' | 'BANK_HOLIDAY';
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  status: string;
  hoursImpact?: number;
  daysImpact?: number;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  metadata?: {
    leaveRequestId?: string;
    absenceType?: string;
    approvedBy?: string;
    approvedAt?: string;
    reason?: string;
    notes?: string;
  };
}

export interface BankHoliday {
  id: string;
  region: string;
  date: string;
  name: string;
  isHalfDay: boolean;
  description?: string;
}

export interface AbsenceBalance {
  id: string;
  planType: 'HOLIDAY' | 'BIRTHDAY' | 'LEVEL_UP_DAY' | 'SICKNESS' | 'OTHER_ABSENCE' | 'TOIL';
  periodStart: string;
  periodEnd: string;
  entitlementDays: number;
  entitlementHours: number;
  takenDays: number;
  takenHours: number;
  remainingDays: number;
  remainingHours: number;
  episodes: number;
  thresholds?: {
    daysWarning?: number;
    daysAlert?: number;
    episodesWarning?: number;
    episodesAlert?: number;
  };
}

export interface CalendarQueryParams {
  from: string;
  to: string;
  scope?: 'SELF' | 'DIRECT_REPORTS' | 'TEAM' | 'ORGANIZATION' | 'PEERS' | 'MANAGER';
  types?: string[];
  userIds?: string[];
  region?: string;
}

export interface AnnualOverviewParams {
  year: string;
  userId?: string;
}

const calendarService = {
  // Get calendar events
  getEvents: async (params: CalendarQueryParams) => {
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },

  // Get annual overview
  getAnnualOverview: async (params: AnnualOverviewParams) => {
    const response = await api.get('/calendar/annual-overview', { params });
    return response.data;
  },

  // Get absence balances
  getAbsenceBalances: async (userId: string) => {
    const response = await api.get(`/calendar/balances/${userId}`);
    return response.data as AbsenceBalance[];
  },

  // Get my absence balances
  getMyAbsenceBalances: async () => {
    const response = await api.get('/calendar/balances/me');
    return response.data as AbsenceBalance[];
  },

  // Get bank holidays
  getBankHolidays: async (region?: string) => {
    const response = await api.get('/calendar/bank-holidays', {
      params: { region },
    });
    return response.data as BankHoliday[];
  },

  // Create bank holiday (Admin only)
  createBankHoliday: async (data: {
    region: string;
    date: string;
    name: string;
    isHalfDay?: boolean;
    description?: string;
  }) => {
    const response = await api.post('/calendar/bank-holidays', data);
    return response.data;
  },

  // Update bank holiday (Admin only)
  updateBankHoliday: async (id: string, data: Partial<BankHoliday>) => {
    const response = await api.patch(`/calendar/bank-holidays/${id}`, data);
    return response.data;
  },

  // Delete bank holiday (Admin only)
  deleteBankHoliday: async (id: string) => {
    await api.delete(`/calendar/bank-holidays/${id}`);
  },

  // Export to PDF
  exportToPDF: async (params: {
    view: string;
    from: string;
    to: string;
    types?: string[];
    userIds?: string[];
    title?: string;
  }) => {
    const response = await api.post('/calendar/export/pdf', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get ICS subscription
  getICSSubscription: async (scope: string) => {
    const response = await api.get('/calendar/export/ics', {
      params: { scope },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default calendarService;
