import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../services/notificationsService';
import { notificationsServiceEnhanced } from '../services/notificationsServiceEnhanced';
import { useAuthStore } from '../stores/authStore';

interface UseNotificationsOptions {
  pollingInterval?: number;
  autoRefresh?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
}

/**
 * Enterprise-grade notifications hook with:
 * - Automatic retry on failure
 * - Request deduplication
 * - Caching
 * - Loading states
 * - Error recovery
 * - Polling with exponential backoff
 */
export function useNotificationsEnhanced(options: UseNotificationsOptions = {}) {
  const {
    pollingInterval = 30000,
    autoRefresh = true,
    enableRetry = true,
    maxRetries = 3,
  } = options;

  const { isAuthenticated } = useAuthStore();
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const pollingTimerRef = useRef<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Safe state update (only if component is mounted)
   */
  const safeSetState = useCallback((updates: Partial<NotificationsState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!isAuthenticated) return;

    try {
      safeSetState({ loading: true, error: null });
      
      const data = await notificationsServiceEnhanced.getMyNotifications(unreadOnly);
      
      safeSetState({
        notifications: data,
        loading: false,
        error: null,
        retryCount: 0,
        isRetrying: false,
      });
    } catch (err: any) {
      console.error('[useNotifications] Failed to fetch notifications:', err);
      
      const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
      
      safeSetState({
        loading: false,
        error,
      });

      // Auto-retry if enabled
      if (enableRetry && state.retryCount < maxRetries) {
        scheduleRetry();
      }
    }
  }, [isAuthenticated, enableRetry, maxRetries, state.retryCount, safeSetState]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationsServiceEnhanced.getUnreadCount();
      safeSetState({ unreadCount: count });
    } catch (err) {
      console.error('[useNotifications] Failed to fetch unread count:', err);
      // Don't update error state for count failures (non-critical)
    }
  }, [isAuthenticated, safeSetState]);

  /**
   * Schedule retry with exponential backoff
   */
  const scheduleRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
    }

    const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 30000);
    
    safeSetState({
      isRetrying: true,
      retryCount: state.retryCount + 1,
    });

    retryTimerRef.current = setTimeout(() => {
      fetchNotifications();
    }, retryDelay);
  }, [state.retryCount, fetchNotifications, safeSetState]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsServiceEnhanced.markAsRead(notificationId);
      
      // Optimistic update
      safeSetState({
        notifications: state.notifications.map(n =>
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date().toISOString() } 
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      });
    } catch (err: any) {
      console.error('[useNotifications] Failed to mark as read:', err);
      throw err;
    }
  }, [state.notifications, state.unreadCount, safeSetState]);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsServiceEnhanced.markAllAsRead();
      
      // Optimistic update
      safeSetState({
        notifications: state.notifications.map(n => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      });
    } catch (err: any) {
      console.error('[useNotifications] Failed to mark all as read:', err);
      throw err;
    }
  }, [state.notifications, safeSetState]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const notification = state.notifications.find(n => n.id === notificationId);
      
      await notificationsServiceEnhanced.deleteNotification(notificationId);
      
      // Optimistic update
      safeSetState({
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      });
    } catch (err: any) {
      console.error('[useNotifications] Failed to delete notification:', err);
      throw err;
    }
  }, [state.notifications, state.unreadCount, safeSetState]);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    notificationsServiceEnhanced.clearCache();
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  /**
   * Manually retry after error
   */
  const retry = useCallback(() => {
    safeSetState({ error: null, retryCount: 0, isRetrying: false });
    fetchNotifications();
  }, [fetchNotifications, safeSetState]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Prefetch in background
      notificationsServiceEnhanced.prefetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Intentionally only on auth change

  /**
   * Auto-refresh polling with smart intervals
   */
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const startPolling = () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }

      pollingTimerRef.current = setInterval(() => {
        // Only poll if tab is visible (battery optimization)
        if (document.visibilityState === 'visible') {
          fetchUnreadCount();
          
          // Only fetch full notifications if on notifications page
          if (window.location.pathname.includes('/notifications')) {
            fetchNotifications();
          }
        }
      }, pollingInterval);
    };

    startPolling();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh when tab becomes visible
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, autoRefresh, pollingInterval, fetchNotifications, fetchUnreadCount]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    retry,
    fetchNotifications,
  };
}
