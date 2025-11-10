// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState } from 'react';
import { useNotifications } from '../contexts/useNotifications';
import { useTranslation } from 'react-i18next';
import NotificationPanel from './NotificationPanel';
import bellIcon from '../assets/bell.svg';

const NotificationButton: React.FC = () => {
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleClick = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title={t('notifications.title')}
      >
        <img
          src={bellIcon}
          alt={t('notifications.title')}
          className="w-6 h-6"
        />
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
};

export default NotificationButton; 