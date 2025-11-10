import React from 'react';
import { useNotifications } from '../contexts/useNotifications';
import { Notification, NotificationAction } from '../types';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { 
  es, 
  enUS, 
  fr, 
  de, 
  it, 
  pt, 
  ptBR, 
  ru, 
  ja, 
  ko, 
  zhCN, 
  zhTW, 
  ar, 
  tr, 
  vi, 
  hi, 
  nl, 
  sv, 
  pl 
} from 'date-fns/locale';
import { AuthContext } from '../authentication/authContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = React.useContext(AuthContext);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    markAsRead, 
    markAllAsRead, 
    handleNotificationAction, 
    deleteNotification,
    loadMoreNotifications
  } = useNotifications();

  // Mapping of application locales to date-fns locales
  const localeMap: { [key: string]: any } = {
    'es': es,
    'es-ES': es,
    'es-MX': es,
    'en': enUS,
    'en-US': enUS,
    'fr': fr,
    'fr-CA': fr,
    'de': de,
    'it': it,
    'pt': pt,
    'pt-BR': ptBR,
    'ru': ru,
    'ja': ja,
    'ko': ko,
    'zh': zhCN,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'ar': ar,
    'tr': tr,
    'vi': vi,
    'hi': hi,
    'ur': enUS, // Urdu is not available in date-fns, use English as fallback
    'nl': nl,
    'sv': sv,
    'pl': pl
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const handleActionClick = (action: NotificationAction) => {
    handleNotificationAction(action);
    onClose();
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };

  const formatDate = (dateString: string) => {
    try {
      // Get the user's locale or use English as fallback
      const userLocale = user?.locale || 'en-US';
      const dateFnsLocale = localeMap[userLocale] || enUS;
      
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: dateFnsLocale 
      });
    } catch {
      return dateString;
    }
  };

  // Function to get translated text or show original text
  const getTranslatedText = (text: string) => {
    // If the text seems to be a translation key (contains dots)
    if (text.includes('.')) {
      const translated = t(text);
      // If the translation is equal to the original text, it means that the translation does not exist
      return translated === text ? text : translated;
    }
    return text;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t('notifications.close_panel')}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('notifications.title')}
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t('notifications.mark_all_read')}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              {t('notifications.loading')}
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && notifications?.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {t('notifications.no_notifications')}
            </div>
          )}

          {!loading && !error && notifications?.length > 0 && (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    notification.is_read 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('notifications.notification')}: ${getTranslatedText(notification.title)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-lg">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {getTranslatedText(notification.title)}
                        </p>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteNotification(notification.id); }}
                          className="text-gray-400 hover:text-red-600 text-lg px-2"
                          title={t('notifications.delete')}
                        >
                          ×
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {getTranslatedText(notification.body)}
                      </p>
                      
                      {/* Actions */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {notification.actions.map((action: any, index: number) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(action);
                              }}
                              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                                action.style === 'primary'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : action.style === 'danger'
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : action.style === 'secondary'
                                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {getTranslatedText(action.label)}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Date below the action buttons */}
                      <div className="mt-2 text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMoreNotifications}
                    disabled={loadingMore}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      loadingMore
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loadingMore ? t('notifications.loading_more') : t('notifications.load_more')}
                  </button>
                </div>
              )}
              
              {/* No more notifications indicator */}
              {!hasMore && notifications.length > 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">
                  {t('notifications.no_more_notifications')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel; 