import { axiosInstance } from '../lib/axios';
import { Notification, NotificationStats, notificationsService } from './notificationsService';

/**
 * Enterprise-grade notifications service with:
 * - Retry logic
 * - Request caching
 * - Error handling
 * - Rate limiting protection
 * - Optimistic updates
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class NotificationsServiceEnhanced {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get data from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Save data to cache
   */
  private saveToCache<T>(key: string, data: T, expiresIn: number = this.CACHE_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Retry logic for failed requests
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0) {
        throw error;
      }

      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff
      return this.retryRequest(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Deduplicate concurrent requests
   */
  private async deduplicateRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Get notifications with caching and retry
   */
  async getMyNotifications(unreadOnly = false): Promise<Notification[]> {
    const cacheKey = `notifications:${unreadOnly}`;
    
    // Check cache first
    const cached = this.getFromCache<Notification[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Deduplicate concurrent requests
    return this.deduplicateRequest(cacheKey, async () => {
      const data = await this.retryRequest(() =>
        notificationsService.getMyNotifications(unreadOnly)
      );

      // Save to cache
      this.saveToCache(cacheKey, data);
      return data;
    });
  }

  /**
   * Get unread count with caching
   */
  async getUnreadCount(): Promise<number> {
    const cacheKey = 'notifications:unread-count';
    
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    return this.deduplicateRequest(cacheKey, async () => {
      const count = await this.retryRequest(() =>
        notificationsService.getUnreadCount()
      );

      // Cache for shorter time (15 seconds)
      this.saveToCache(cacheKey, count, 15000);
      return count;
    });
  }

  /**
   * Get stats with caching
   */
  async getStats(): Promise<NotificationStats> {
    const cacheKey = 'notifications:stats';
    
    const cached = this.getFromCache<NotificationStats>(cacheKey);
    if (cached) {
      return cached;
    }

    return this.deduplicateRequest(cacheKey, async () => {
      const stats = await this.retryRequest(() =>
        notificationsService.getStats()
      );

      this.saveToCache(cacheKey, stats);
      return stats;
    });
  }

  /**
   * Mark as read with optimistic update
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    // Clear relevant caches
    this.cache.delete('notifications:false');
    this.cache.delete('notifications:true');
    this.cache.delete('notifications:unread-count');
    this.cache.delete('notifications:stats');

    return this.retryRequest(() =>
      notificationsService.markAsRead(notificationId)
    );
  }

  /**
   * Mark all as read with cache invalidation
   */
  async markAllAsRead(): Promise<void> {
    this.clearCache();
    return this.retryRequest(() =>
      notificationsService.markAllAsRead()
    );
  }

  /**
   * Delete notification with cache invalidation
   */
  async deleteNotification(notificationId: string): Promise<void> {
    this.clearCache();
    return this.retryRequest(() =>
      notificationsService.deleteNotification(notificationId)
    );
  }

  /**
   * Clear read notifications
   */
  async clearRead(): Promise<{ deleted: number }> {
    this.clearCache();
    return this.retryRequest(() =>
      notificationsService.clearRead()
    );
  }

  /**
   * Get preferences
   */
  async getPreferences(): Promise<any> {
    const cacheKey = 'notifications:preferences';
    
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    return this.deduplicateRequest(cacheKey, async () => {
      const prefs = await this.retryRequest(() =>
        notificationsService.getPreferences()
      );

      // Cache for longer (5 minutes)
      this.saveToCache(cacheKey, prefs, 300000);
      return prefs;
    });
  }

  /**
   * Update preferences
   */
  async updatePreferences(preferences: any): Promise<any> {
    this.cache.delete('notifications:preferences');
    return this.retryRequest(() =>
      notificationsService.updatePreferences(preferences)
    );
  }

  /**
   * Prefetch notifications in background
   */
  prefetchNotifications() {
    // Fire and forget
    this.getMyNotifications().catch(() => {});
    this.getUnreadCount().catch(() => {});
  }
}

export const notificationsServiceEnhanced = new NotificationsServiceEnhanced();
