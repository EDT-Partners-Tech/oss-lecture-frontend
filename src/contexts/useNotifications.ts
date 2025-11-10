// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';
import type { NotificationContextType } from './NotificationContext';

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 