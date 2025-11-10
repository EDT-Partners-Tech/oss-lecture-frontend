import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Notification, 
  NotificationFilters, 
  NotificationMetrics,
  NotificationAction 
} from '../types';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationMetrics,
  deleteNotification 
} from '../services/api';
import { useAuth } from '../authentication/useAuth';
import { triggerEvent, subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  metrics: NotificationMetrics | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentOffset: number;
  fetchNotifications: (filters?: NotificationFilters, append?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  handleNotificationAction: (action: NotificationAction) => void;
  refreshMetrics: (days?: number) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export { NotificationContext };

export type { NotificationContextType };

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const { user } = useAuth();
  const { showNotification } = usePushNotifications();

  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}, append: boolean = false) => {
    if (!user?.user_id) {
      return;
    }
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const defaultFilters: NotificationFilters = {
        limit: 10,
        offset: append ? currentOffset : 0,
        ...filters
      };
      
      const response = await getNotifications(defaultFilters);
      
      if (append) {
        setNotifications(prev => [...prev, ...response.data]);
        // Update offset after successful append
        setCurrentOffset(prev => prev + 10);
      } else {
        setNotifications(response.data);
        setCurrentOffset(10);
      }
      
      // Check if there are more notifications
      // If the response has fewer items than the limit, there are no more notifications
      const hasMoreNotifications = response.data.length === defaultFilters.limit;
      setHasMore(hasMoreNotifications);
      
      // If this was an append request and we got fewer items than expected, 
      // we've reached the end, so don't allow more requests
      if (append && !hasMoreNotifications) {
        console.log('Reached end of notifications, no more requests will be made');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las notificaciones';
      setError(errorMessage);
      console.error('NotificationProvider - Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.user_id, currentOffset]);

  const loadMoreNotifications = useCallback(async () => {
    // Only load more if we're not already loading and there are more notifications available
    if (!loadingMore && hasMore && !loading) {
      try {
        await fetchNotifications({}, true);
      } catch (error) {
        console.error('Error loading more notifications:', error);
      }
    }
  }, [loadingMore, hasMore, loading, fetchNotifications]);

  const refreshMetrics = useCallback(async (days?: number) => {
    if (!user?.user_id) return;
    
    try {
      await fetchNotifications();
      const metricsData = await getNotificationMetrics(days);
      setMetrics(metricsData);
      setUnreadCount(metricsData.total_unread);
    } catch (err: any) {
      console.error('Error fetching notification metrics:', err);
    }
  }, [user?.user_id, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Refresh metrics
      await refreshMetrics();
    } catch (err: any) {
      setError(err.message || 'Error al marcar la notificación como leída');
      console.error('Error marking notification as read:', err);
    }
  }, [refreshMetrics]);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      // Refresh metrics
      await refreshMetrics();
    } catch (err: any) {
      setError(err.message || 'Error al marcar todas las notificaciones como leídas');
      console.error('Error marking all notifications as read:', err);
    }
  }, [refreshMetrics]);

  const deleteNotificationHandler = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Refresh metrics
      await refreshMetrics();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la notificación');
      console.error('Error deleting notification:', err);
    }
  }, [refreshMetrics]);

  const handleNotificationAction = useCallback((action: NotificationAction) => {
    // Handle different action types
    switch (action.action) {
      case 'navigate':
        if (action.url) {
          // Add domain if it's a relative URL
          const url = action.url.startsWith('http') 
            ? action.url 
            : `${window.location.origin}${action.url}`;
          window.location.href = url;
        }
        break;
      case 'open_tab':
        if (action.url) {
          const url = action.url.startsWith('http') 
            ? action.url 
            : `${window.location.origin}${action.url}`;
          window.open(url, '_blank');
        }
        break;
      case 'trigger_event':
        if (action.data) {
          triggerEvent(action.action, action.data);
        }
        break;
      default:
        // Trigger a custom event that other components can listen to
        triggerEvent('notification_action', { action, data: action.data });
        break;
    }
  }, []);

  // Handle new notifications from AppSync
  const handleNewNotification = useCallback((event: any) => {
    // Show push notification if the page is not visible
    if (event?.use_push_notification && document.hidden) {
      const notificationData: Notification = {
        id: event.id || Date.now().toString(),
        user_id: event.user_id || user?.user_id || '',
        service_id: event.service_id || '',
        title: event.title || 'Nueva notificación',
        body: event.body || '',
        data: event.data || {},
        use_push_notification: event.use_push_notification || false,
        is_read: false,
        actions: event.actions || [],
        notification_type: event.notification_type || 'info',
        priority: event.priority || 'normal',
        created_at: new Date().toISOString(),
      };
      
      showNotification(notificationData);
    }
    
    // Only refresh metrics, not notifications to avoid resetting the pagination
    fetchNotifications();
    refreshMetrics();
  }, [user?.user_id, showNotification, fetchNotifications, refreshMetrics]);

  // Initial load
  const initialLoadDone = useRef<string | null>(null);
  useEffect(() => {
    if (user?.user_id && initialLoadDone.current !== user.user_id) {
      fetchNotifications();
      refreshMetrics();
      initialLoadDone.current = user.user_id;
    }
  }, [user?.user_id, fetchNotifications, refreshMetrics]);

  // Listen for AppSync notification events
  useEffect(() => {
    if (user?.user_id) {
      // Subscribe to notification events
      subscribeToEvent('notificationUpdate', handleNewNotification);
      
      return () => {
        unsubscribeFromEvent('notificationUpdate', handleNewNotification);
      };
    }
  }, [user?.user_id, handleNewNotification]);

  // Listen for Service Worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'notification_action') {
        const { action, data } = event.data;
        
        // Create a notification action to handle
        const notificationAction: NotificationAction = {
          action: action,
          label: 'Action',
          data: data
        };
        
        handleNotificationAction(notificationAction);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, [handleNotificationAction]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    metrics,
    loading,
    loadingMore,
    error,
    hasMore,
    currentOffset,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationHandler,
    handleNotificationAction,
    refreshMetrics,
    loadMoreNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 