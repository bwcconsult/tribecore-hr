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

  // Enhanced Learning APIs
  // Course Modules
  createModule: async (courseId: string, data: any) => {
    const response = await axiosInstance.post(`/learning-enhanced/courses/${courseId}/modules`, data);
    return response.data;
  },

  getCourseModules: async (courseId: string) => {
    const response = await axiosInstance.get(`/learning-enhanced/courses/${courseId}/modules`);
    return response.data;
  },

  updateModule: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/learning-enhanced/modules/${id}`, data);
    return response.data;
  },

  deleteModule: async (id: string) => {
    const response = await axiosInstance.delete(`/learning-enhanced/modules/${id}`);
    return response.data;
  },

  // Lessons
  createLesson: async (moduleId: string, data: any) => {
    const response = await axiosInstance.post(`/learning-enhanced/modules/${moduleId}/lessons`, data);
    return response.data;
  },

  getModuleLessons: async (moduleId: string) => {
    const response = await axiosInstance.get(`/learning-enhanced/modules/${moduleId}/lessons`);
    return response.data;
  },

  getLessonById: async (id: string) => {
    const response = await axiosInstance.get(`/learning-enhanced/lessons/${id}`);
    return response.data;
  },

  updateLesson: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/learning-enhanced/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await axiosInstance.delete(`/learning-enhanced/lessons/${id}`);
    return response.data;
  },

  // Progress Tracking
  startLesson: async (enrollmentId: string, lessonId: string, employeeId: string) => {
    const response = await axiosInstance.post('/learning-enhanced/progress/start', {
      enrollmentId,
      lessonId,
      employeeId,
    });
    return response.data;
  },

  updateLessonProgress: async (progressId: string, data: any) => {
    const response = await axiosInstance.patch(`/learning-enhanced/progress/${progressId}`, data);
    return response.data;
  },

  submitQuiz: async (progressId: string, answers: any[]) => {
    const response = await axiosInstance.post(`/learning-enhanced/progress/${progressId}/quiz`, { answers });
    return response.data;
  },

  completeLesson: async (progressId: string) => {
    const response = await axiosInstance.post(`/learning-enhanced/progress/${progressId}/complete`);
    return response.data;
  },

  getEnrollmentProgress: async (enrollmentId: string) => {
    const response = await axiosInstance.get(`/learning-enhanced/enrollments/${enrollmentId}/progress`);
    return response.data;
  },

  // Mandatory Training
  getMandatoryTraining: async () => {
    const response = await axiosInstance.get('/learning-enhanced/mandatory-training');
    return response.data;
  },

  getMandatoryTrainingById: async (id: string) => {
    const response = await axiosInstance.get(`/learning-enhanced/mandatory-training/${id}`);
    return response.data;
  },

  // Dashboards
  getComplianceDashboard: async (organizationId: string) => {
    const response = await axiosInstance.get('/learning-enhanced/compliance/dashboard', {
      params: { organizationId },
    });
    return response.data;
  },

  getEmployeeLearningDashboard: async (employeeId: string) => {
    const response = await axiosInstance.get(`/learning-enhanced/employee/${employeeId}/dashboard`);
    return response.data;
  },
};
