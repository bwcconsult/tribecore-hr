import { axiosInstance } from '../lib/axios';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor?: string;
  duration: number; // in hours
  level: string;
  format: string;
  status: string;
  maxEnrollments?: number;
  currentEnrollments?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  currency?: string;
  certificateOffered: boolean;
  createdAt: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseName?: string;
  employeeId: string;
  employeeName?: string;
  enrollmentDate: string;
  startDate?: string;
  completionDate?: string;
  status: string;
  progress: number;
  score?: number;
  certificateIssued: boolean;
  notes?: string;
  createdAt: string;
}

export const learningService = {
  // Course operations
  getAllCourses: async (params?: any) => {
    const response = await axiosInstance.get('/learning/courses', { params });
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await axiosInstance.get(`/learning/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: Partial<Course>) => {
    const response = await axiosInstance.post('/learning/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    const response = await axiosInstance.patch(`/learning/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await axiosInstance.delete(`/learning/courses/${id}`);
    return response.data;
  },

  // Enrollment operations
  getAllEnrollments: async (params?: any) => {
    const response = await axiosInstance.get('/learning/enrollments', { params });
    return response.data;
  },

  getEnrollmentById: async (id: string) => {
    const response = await axiosInstance.get(`/learning/enrollments/${id}`);
    return response.data;
  },

  createEnrollment: async (data: Partial<CourseEnrollment>) => {
    const response = await axiosInstance.post('/learning/enrollments', data);
    return response.data;
  },

  updateEnrollment: async (id: string, data: Partial<CourseEnrollment>) => {
    const response = await axiosInstance.patch(`/learning/enrollments/${id}`, data);
    return response.data;
  },

  deleteEnrollment: async (id: string) => {
    const response = await axiosInstance.delete(`/learning/enrollments/${id}`);
    return response.data;
  },

  updateProgress: async (id: string, progress: number) => {
    const response = await axiosInstance.patch(`/learning/enrollments/${id}/progress`, { progress });
    return response.data;
  },

  completeCourse: async (id: string, score?: number) => {
    const response = await axiosInstance.post(`/learning/enrollments/${id}/complete`, { score });
    return response.data;
  },

  issueCertificate: async (id: string) => {
    const response = await axiosInstance.post(`/learning/enrollments/${id}/certificate`);
    return response.data;
  },

  // Additional operations
  getStats: async () => {
    const response = await axiosInstance.get('/learning/stats');
    return response.data;
  },

  getEmployeeEnrollments: async (employeeId: string) => {
    const response = await axiosInstance.get(`/learning/employee/${employeeId}/enrollments`);
    return response.data;
  },

  getCourseEnrollments: async (courseId: string) => {
    const response = await axiosInstance.get(`/learning/courses/${courseId}/enrollments`);
    return response.data;
  },
};
