import { axiosInstance } from '../lib/axios';

export interface AnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  attritionRate: number;
  headcountGrowth: number;
  avgSalary: number;
  totalPayrollCost: number;
  avgPerformanceRating: number;
  engagementScore: number;
}

export interface DepartmentStats {
  department: string;
  employeeCount: number;
  avgSalary: number;
  avgPerformanceRating: number;
  attritionRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export const analyticsService = {
  // Overall Analytics
  getSummary: async () => {
    const response = await axiosInstance.get('/analytics/summary');
    return response.data;
  },

  // Department Analytics
  getDepartmentStats: async () => {
    const response = await axiosInstance.get('/analytics/departments');
    return response.data;
  },

  // Trends
  getHeadcountTrend: async (months: number = 12) => {
    const response = await axiosInstance.get('/analytics/trends/headcount', {
      params: { months },
    });
    return response.data;
  },

  getAttritionTrend: async (months: number = 12) => {
    const response = await axiosInstance.get('/analytics/trends/attrition', {
      params: { months },
    });
    return response.data;
  },

  getPayrollTrend: async (months: number = 12) => {
    const response = await axiosInstance.get('/analytics/trends/payroll', {
      params: { months },
    });
    return response.data;
  },

  // Diversity & Demographics
  getDiversityMetrics: async () => {
    const response = await axiosInstance.get('/analytics/diversity');
    return response.data;
  },

  getAgeDistribution: async () => {
    const response = await axiosInstance.get('/analytics/demographics/age');
    return response.data;
  },

  // Performance Analytics
  getPerformanceDistribution: async () => {
    const response = await axiosInstance.get('/analytics/performance/distribution');
    return response.data;
  },

  // Attendance & Leave
  getAttendanceStats: async () => {
    const response = await axiosInstance.get('/analytics/attendance');
    return response.data;
  },

  getLeaveStats: async () => {
    const response = await axiosInstance.get('/analytics/leave');
    return response.data;
  },

  // Learning & Development
  getLearningStats: async () => {
    const response = await axiosInstance.get('/analytics/learning');
    return response.data;
  },

  // Benefits
  getBenefitsUtilization: async () => {
    const response = await axiosInstance.get('/analytics/benefits');
    return response.data;
  },

  // Recruitment
  getRecruitmentMetrics: async () => {
    const response = await axiosInstance.get('/analytics/recruitment');
    return response.data;
  },

  // Export Reports
  exportReport: async (reportType: string, format: 'pdf' | 'csv' | 'excel') => {
    const response = await axiosInstance.get(`/analytics/export/${reportType}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
