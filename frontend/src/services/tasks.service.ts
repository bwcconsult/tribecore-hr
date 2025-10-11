import { axiosInstance } from '../lib/axios';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  assigneeId: string;
  requesterId?: string;
  dueDate?: string;
  createdAt: string;
  requester?: { firstName: string; lastName: string };
  assignee?: { firstName: string; lastName: string };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  type: string;
  priority?: string;
  assigneeId: string;
  dueDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export const tasksService = {
  async getTasks(params?: { type?: string; status?: string; scope?: string }) {
    const response = await axiosInstance.get('/tasks', { params });
    return response.data;
  },

  async getTask(id: string) {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: CreateTaskDto) {
    const response = await axiosInstance.post('/tasks', data);
    return response.data;
  },

  async startTask(id: string) {
    const response = await axiosInstance.post(`/tasks/${id}/start`);
    return response.data;
  },

  async completeTask(id: string, notes?: string) {
    const response = await axiosInstance.post(`/tasks/${id}/complete`, {
      completionNotes: notes,
    });
    return response.data;
  },

  async cancelTask(id: string, reason?: string) {
    const response = await axiosInstance.post(`/tasks/${id}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  },

  async reassignTask(id: string, assigneeId: string) {
    const response = await axiosInstance.post(`/tasks/${id}/reassign`, {
      assigneeId,
    });
    return response.data;
  },
};
