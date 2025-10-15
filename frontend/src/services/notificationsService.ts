import { axiosInstance } from '../lib/axios';

export type NotificationType = 
  | 'SYSTEM' | 'ANNOUNCEMENT' | 'SECURITY'
  | 'EMPLOYEE' | 'ONBOARDING' | 'OFFBOARDING'
  | 'ATTENDANCE' | 'LEAVE' | 'OVERTIME' | 'SHIFT' | 'TIMESHEET'
  | 'PAYROLL' | 'EXPENSE' | 'BENEFIT' | 'COMPENSATION'
  | 'PERFORMANCE' | 'RECOGNITION' | 'LEARNING' | 'GOAL'
  | 'RECRUITMENT' | 'APPLICANT' | 'INTERVIEW' | 'OFFER'
  | 'CONTRACT' | 'CONTRACT_APPROVAL' | 'CONTRACT_RENEWAL' | 'CONTRACT_EXPIRY' | 'OBLIGATION'
  | 'DOCUMENT' | 'ESIGNATURE' | 'COMPLIANCE' | 'AUDIT'
  | 'IAM' | 'DELEGATION' | 'ACCESS_REQUEST' | 'ROLE_CHANGE'
  | 'TASK' | 'APPROVAL' | 'REMINDER' | 'ALERT';

export interface Notification {
  id: string;
  recipientId: string;
  organizationId: string;
  type: NotificationType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  emailSent: boolean;
  pushSent: boolean;
  senderId?: string;
  senderName?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  icon?: string;
  category?: string;
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
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put('/notifications/mark-all-read');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  },

  /**
   * Clear all read notifications
   */
  clearRead: async (): Promise<{ deleted: number }> => {
    const response = await axiosInstance.delete('/notifications/clear-read');
    return response.data;
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<any> => {
    const response = await axiosInstance.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: any): Promise<any> => {
    const response = await axiosInstance.put('/notifications/preferences', preferences);
    return response.data;
  },
};
