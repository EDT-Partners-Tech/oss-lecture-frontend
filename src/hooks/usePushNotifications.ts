import { useState, useEffect, useCallback } from 'react';
import type { Notification as NotificationType } from '../types';
import { t } from 'i18next';

// Extend the notification API types to include actions
interface NotificationActionWeb {
  action: string;
  title: string;
  icon?: string;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationActionWeb[];
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Register the Service Worker for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-notifications.js')
        .then((registration) => {
          setServiceWorkerRegistration(registration);
          
          // Wait for the Service Worker to be active
          return registration.update();
        })
        .then(() => {
          setIsServiceWorkerReady(true);
        })
        .catch((error) => {
          console.warn('Error registering Service Worker for notifications:', error);
        });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support push notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  const showNotification = useCallback((notification: NotificationType) => {
    if (permission !== 'granted' || !('Notification' in window)) {
      console.warn('Notification permissions not granted');
      return;
    }

    // Only show push notifications if the page is not visible
    if (!document.hidden) {
      return;
    }

    // Check if the Service Worker is available
    if (!serviceWorkerRegistration || !isServiceWorkerReady) {
      console.warn('Service Worker is not ready to show notifications');
      return;
    }

    // Prepare the actions for the push notification
    const actions: NotificationActionWeb[] = [];
    if (notification.actions && notification.actions.length > 0) {
      // Limit to 2 actions maximum (limit of the notification API)
      const limitedActions = notification.actions.slice(0, 2);
      
      limitedActions.forEach((action, index) => {
        actions.push({
          action: `action_${index}`,
          title: t(action.label),
          icon: getActionIcon(action.style),
        });
      });
    }

    const notificationOptions: ExtendedNotificationOptions = {
      body: t(notification.body),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: notification.id, // Avoid duplicates
      requireInteraction: notification.priority === 'urgent',
      data: {
        notificationId: notification.id,
        actions: notification.actions,
        url: notification.actions?.[0]?.url,
      },
    };

    // Add actions only if they exist
    if (actions.length > 0) {
      notificationOptions.actions = actions;
    }

    // Use the Service Worker to show the notification
    serviceWorkerRegistration.showNotification(t(notification.title), notificationOptions);
  }, [permission, serviceWorkerRegistration, isServiceWorkerReady]);

  // Function to get the appropriate icon based on the action style
  const getActionIcon = (style?: string): string => {
    switch (style) {
      case 'primary':
        return '/src/assets/check.svg';
      case 'danger':
        return '/src/assets/delete.svg';
      case 'secondary':
        return '/src/assets/info.svg';
      default:
        return '/src/assets/arrowback.svg';
    }
  };

  const showSimpleNotification = useCallback((title: string, body: string, options?: {
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
  }) => {
    if (permission !== 'granted' || !('Notification' in window)) {
      return;
    }

    if (!serviceWorkerRegistration || !isServiceWorkerReady) {
      console.warn('Service Worker is not ready to show notifications');
      return;
    }

    const notificationOptions: ExtendedNotificationOptions = {
      body,
      icon: options?.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: options?.tag,
      requireInteraction: options?.requireInteraction || false,
    };

    serviceWorkerRegistration.showNotification(title, notificationOptions);
  }, [permission, serviceWorkerRegistration, isServiceWorkerReady]);

  return {
    permission,
    requestPermission,
    showNotification,
    showSimpleNotification,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    hasServiceWorker: !!serviceWorkerRegistration,
    isServiceWorkerReady,
  };
}; 