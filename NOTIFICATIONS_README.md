<!-- © [2025] EDT&Partners. Licensed under CC BY 4.0. -->
# Notification System - Frontend

This document describes the notification system implemented in the Lecture application frontend.

## Main Features

### ✅ Implemented Features

1. **Automatic notification loading**: When the application loads, it requests the latest 10 notifications from the backend
2. **Mark as read**: System to mark individual notifications or all as read
3. **Action buttons**: Support for configurable buttons that can navigate to specific routes
4. **Push notifications**: Integration with native browser notifications
5. **Real-time**: Integration with AppSync to receive real-time notifications
6. **Different types and priorities**: Support for info, success, warning, error and low, normal, high, urgent priorities
7. **Translation support**: Automatic handling of backend translation keys
8. **Detailed metrics**: Statistics by type, priority and service

## System Structure

### Main Files

- `src/types/index.ts` - Type definitions for notifications
- `src/services/api.ts` - API functions to communicate with the backend
- `src/contexts/NotificationContext.tsx` - React context to handle notification state
- `src/components/NotificationPanel.tsx` - Side notification panel
- `src/components/NotificationButton.tsx` - Notification button in the top bar
- `src/hooks/usePushNotifications.ts` - Hook to handle push notifications
- `src/utils/appsyncEvents.ts` - AppSync events integration

### Components

#### NotificationButton
Button displayed in the top bar with:
- Bell icon
- Badge with unread notifications count
- Clicking opens the notification panel

#### NotificationPanel
Side panel that displays:
- Scrollable notification list
- Priority and type information
- Configurable action buttons
- Option to mark all as read
- Relative date format (e.g., "5 minutes ago")
- Automatic translation of backend keys

## System Usage

### 1. Initial Configuration

The system is automatically configured when the application loads:

```tsx
// In App.tsx
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}
```

### 2. Usage in Components

```tsx
import { useNotifications } from '../contexts/NotificationContext';

const MyComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    handleNotificationAction 
  } = useNotifications();

  // Use notifications...
};
```

### 3. Create Notifications

```tsx
import { createNotification } from '../services/api';

const notification = await createNotification({
  user_id: 'user-id',
  service_id: 'chatbot_conversation',
  title: 'Chatbot completed',
  body: 'Your chatbot is ready to use',
  notification_type: 'success',
  priority: 'high',
  actions: [
    {
      label: 'Open chatbot',
      action: 'navigate',
      url: '/chatbot/123',
      style: 'primary'
    }
  ]
});
```

## Action Types

### Navigation
```tsx
{
  label: 'View details',
  action: 'navigate',
  url: '/dashboard',
  style: 'primary'
}
```

### Open in new tab
```tsx
{
  label: 'View in new tab',
  action: 'open_tab',
  url: '/external-link',
  style: 'secondary'
}
```

### Custom events
```tsx
{
  label: 'Retry',
  action: 'trigger_event',
  data: { operation: 'retry_upload' },
  style: 'danger'
}
```

## Push Notifications

### Request Permissions
```tsx
import { usePushNotifications } from '../hooks/usePushNotifications';

const { permission, requestPermission } = usePushNotifications();

const handleRequestPermission = async () => {
  const granted = await requestPermission();
  if (granted) {
    console.log('Permissions granted');
  }
};
```

### Show Push Notification
```tsx
const { showSimpleNotification } = usePushNotifications();

showSimpleNotification(
  'Title',
  'Notification message',
  { tag: 'unique-tag' }
);
```

## AppSync Integration

The system is integrated with AppSync to receive real-time notifications:

1. **Registered events**:
   - `notification_created`
   - `notification_updated`
   - `notification_deleted`

2. **Automatic handling**:
   - Notifications are automatically updated
   - Push notifications are shown when the page is not visible
   - Unread count is updated

## Translation Handling

The system automatically handles backend translation keys:

```tsx
// If backend returns: "chatbot_conversation.completed.title"
// Frontend automatically translates to: "Chatbot completed"

const getTranslatedText = (text: string) => {
  if (text.includes('.')) {
    const translated = t(text);
    return translated === text ? text : translated;
  }
  return text;
};
```

## Button Styles

- **primary**: Primary button (blue)
- **secondary**: Secondary button (gray)
- **danger**: Destructive action button (red)
- **default**: Default button

## Notification Types

- **info**: General information
- **success**: Successful operation
- **warning**: Warning
- **error**: Error or problem

## Priorities

- **low**: Low priority
- **normal**: Normal priority
- **high**: High priority
- **urgent**: Urgent priority

## Translations

The system includes Spanish translations for:
- Titles and messages
- Notification types
- Priorities
- Button actions
- Service-specific notifications (chatbot, etc.)

## Production Usage

The system is fully integrated and ready for production:

1. **NotificationProvider** wraps the entire application
2. **NotificationButton** is integrated in the top bar
3. **AppSync** is configured for real-time
4. **Translations** are configured
5. **API endpoints** are connected to the backend

## Performance Considerations

1. **Load limit**: Maximum 10 notifications are loaded by default
2. **Efficient updates**: Only updates when necessary
3. **Local cache**: Notifications are maintained in local state
4. **Automatic cleanup**: Push notifications close automatically

## Security

1. **User validation**: Only loads notifications from the authenticated user
2. **Sanitization**: Data is validated before display
3. **Permissions**: Push notifications require explicit permissions

## Troubleshooting

### Common Issues

1. **Notifications don't load**:
   - Verify that the user is authenticated
   - Check console for API errors

2. **Push notifications don't work**:
   - Verify browser permissions
   - Ensure the page is not visible

3. **AppSync doesn't connect**:
   - Verify configuration in authentication context
   - Check connection logs

4. **Translations don't work**:
   - Verify that keys exist in the translation file
   - Check i18n configuration

### Debug Logs

```tsx
// Enable detailed logs
console.log('Notification state:', notifications);
console.log('Unread count:', unreadCount);
console.log('Push permission:', permission);
```

## Upcoming Improvements

- [ ] Support for grouped notifications
- [ ] Notification templates
- [ ] Notification scheduling
- [ ] Support for multiple languages
- [ ] Integration with external services 