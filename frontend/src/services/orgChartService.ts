import { axiosInstance } from '../lib/axios';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  headOfDepartmentId?: string;
  employeeCount: number;
  location?: string;
  costCenter?: string;
  level: number;
  isActive: boolean;
  color?: string;
  icon?: string;
  children?: Department[];
}

export enum PositionLevel {
  EXECUTIVE = 'EXECUTIVE',
  SENIOR_MANAGEMENT = 'SENIOR_MANAGEMENT',
  MIDDLE_MANAGEMENT = 'MIDDLE_MANAGEMENT',
  PROFESSIONAL = 'PROFESSIONAL',
  INTERMEDIATE = 'INTERMEDIATE',
  ENTRY = 'ENTRY',
  INTERN = 'INTERN',
}

export interface Position {
  id: string;
  code: string;
  title: string;
  description?: string;
  departmentId?: string;
  level: PositionLevel;
  reportsToPositionId?: string;
  hierarchyLevel: number;
  minSalary?: number;
  maxSalary?: number;
  headcount: number;
  vacantPositions: number;
  isActive: boolean;
}

export interface OrgChartNode {
  id: string;
  nodeType: 'EMPLOYEE' | 'POSITION' | 'DEPARTMENT';
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeAvatar?: string;
  positionId?: string;
  positionTitle?: string;
  positionLevel?: string;
  departmentId?: string;
  departmentName?: string;
  level: number;
  directReports: number;
  totalReports: number;
  children: OrgChartNode[];
  metadata?: any;
  displaySettings?: any;
  isActive: boolean;
}

export interface OrgChartStats {
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  managementLevels: number;
  avgSpanOfControl: number;
  vacantPositions: number;
  departmentBreakdown: { name: string; count: number }[];
  levelBreakdown: { level: string; count: number }[];
}

export const orgChartService = {
  // Org Chart APIs
  getOrgChart: async (): Promise<OrgChartNode[]> => {
    const response = await axiosInstance.get('/organization/chart');
    return response.data;
  },

  getOrgChartStats: async (): Promise<OrgChartStats> => {
    const response = await axiosInstance.get('/organization/chart/stats');
    return response.data;
  },

  getDepartmentChart: async (departmentId: string): Promise<OrgChartNode[]> => {
    const response = await axiosInstance.get(`/organization/chart/department/${departmentId}`);
    return response.data;
  },

  getEmployeeReporting: async (employeeId: string): Promise<any> => {
    const response = await axiosInstance.get(`/organization/chart/employee/${employeeId}/reporting`);
    return response.data;
  },

  searchOrgChart: async (query: string): Promise<OrgChartNode[]> => {
    const response = await axiosInstance.get('/organization/chart/search', {
      params: { q: query },
    });
    return response.data;
  },

  rebuildOrgChart: async (): Promise<void> => {
    await axiosInstance.post('/organization/chart/rebuild');
  },

  // Department APIs
  getDepartments: async (): Promise<Department[]> => {
    const response = await axiosInstance.get('/organization/departments');
    return response.data;
  },

  getDepartmentTree: async (): Promise<Department[]> => {
    const response = await axiosInstance.get('/organization/departments/tree');
    return response.data;
  },

  getDepartment: async (id: string): Promise<Department> => {
    const response = await axiosInstance.get(`/organization/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    const response = await axiosInstance.post('/organization/departments', data);
    return response.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    const response = await axiosInstance.put(`/organization/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/organization/departments/${id}`);
  },

  // Position APIs
  getPositions: async (filters?: {
    departmentId?: string;
    level?: PositionLevel;
  }): Promise<Position[]> => {
    const response = await axiosInstance.get('/organization/positions', { params: filters });
    return response.data;
  },

  getVacantPositions: async (): Promise<Position[]> => {
    const response = await axiosInstance.get('/organization/positions/vacant');
    return response.data;
  },

  getPosition: async (id: string): Promise<Position> => {
    const response = await axiosInstance.get(`/organization/positions/${id}`);
    return response.data;
  },

  createPosition: async (data: Partial<Position>): Promise<Position> => {
    const response = await axiosInstance.post('/organization/positions', data);
    return response.data;
  },

  updatePosition: async (id: string, data: Partial<Position>): Promise<Position> => {
    const response = await axiosInstance.put(`/organization/positions/${id}`, data);
    return response.data;
  },

  deletePosition: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/organization/positions/${id}`);
  },
};
