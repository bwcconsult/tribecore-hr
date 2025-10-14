import { axiosInstance } from '../lib/axios';

export interface Notification {
  id: string;
  recipientId: string;
  organizationId: string;
  type: 'SYSTEM' | 'PAYROLL' | 'LEAVE' | 'ATTENDANCE' | 'PERFORMANCE' | 'DOCUMENT' | 'BENEFIT' | 'EXPENSE' | 'TIMESHEET' | 'ONBOARDING' | 'RECRUITMENT' | 'LEARNING' | 'ANNOUNCEMENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  relatedEntityId?: string;
  emailSent: boolean;
  pushSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export const notificationsService = {
  /**
   * Get all notifications for current user
   */
  getMyNotifications: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await axiosInstance.get('/notifications/my-notifications', {
      params: { unreadOnly },
    });
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data.count || response.data;
  },

  /**
   * Get notification statistics
   */
  getStats: async (): Promise<NotificationStats> => {
    const response = await axiosInstance.get('/notifications/stats');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.post('/notifications/mark-all-read');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  },

  /**
   * Delete multiple notifications
   */
  deleteMultiple: async (notificationIds: string[]): Promise<void> => {
    await axiosInstance.post('/notifications/delete-multiple', { ids: notificationIds });
  },

  /**
   * Get notification by ID
   */
  getById: async (notificationId: string): Promise<Notification> => {
    const response = await axiosInstance.get(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get notifications by type
   */
  getByType: async (type: Notification['type']): Promise<Notification[]> => {
    const response = await axiosInstance.get('/notifications/by-type', {
      params: { type },
    });
    return response.data;
  },

  /**
   * Get notifications by priority
   */
  getByPriority: async (priority: Notification['priority']): Promise<Notification[]> => {
    const response = await axiosInstance.get('/notifications/by-priority', {
      params: { priority },
    });
    return response.data;
  },
};
