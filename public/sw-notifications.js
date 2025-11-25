/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Service Worker to handle notifications with actions
self.addEventListener('install', (event) => {
  console.log('Service Worker installed for notifications');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated for notifications');
  event.waitUntil(self.clients.claim());
});

// Handle click on the main notification
self.addEventListener('notificationclick', (event) => {

  event.notification.close();
  
  const data = event.notification.data;
  
  // If there is a URL in the data, navigate to it
  if (data?.url) {
    const url = data.url.startsWith('http') 
      ? data.url 
      : `${self.location.origin}${data.url}`;
    
    event.waitUntil(
      self.clients.openWindow(url)
    );
  } else {
    // If there is no URL, focus the existing window
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});

// Handle click on the action buttons
self.addEventListener('notificationactionclick', (event) => {
  
  event.notification.close();
  
  const data = event.notification.data;
  const actionIndex = parseInt(event.action.replace('action_', ''));
  
  if (data?.actions && data.actions[actionIndex]) {
    const action = data.actions[actionIndex];
    
    switch (action.action) {
      case 'navigate':
        if (action.url) {
          const url = action.url.startsWith('http') 
            ? action.url 
            : `${self.location.origin}${action.url}`;
          
          event.waitUntil(
            self.clients.openWindow(url)
          );
        }
        break;
        
      case 'open_tab':
        if (action.url) {
          const url = action.url.startsWith('http') 
            ? action.url 
            : `${self.location.origin}${action.url}`;
          
          event.waitUntil(
            self.clients.openWindow(url)
          );
        }
        break;
        
      case 'trigger_event':
        // Send message to all clients
        event.waitUntil(
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'notification_action',
                action: action.action,
                data: action.data
              });
            });
          })
        );
        break;
        
      default:
        // Send message for custom actions
        event.waitUntil(
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'notification_action',
                action: action.action,
                data: action.data
              });
            });
          })
        );
        break;
    }
  }
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  
  if (event.data && event.data.type === 'showNotification') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
}); 