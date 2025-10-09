import { axiosInstance } from '../lib/axios';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
  hireDate: string;
  baseSalary: number;
  workLocation: string;
}

export const employeeService = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get('/employees', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: Partial<Employee>) => {
    const response = await axiosInstance.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Employee>) => {
    const response = await axiosInstance.patch(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/employees/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/employees/stats');
    return response.data;
  },
};
