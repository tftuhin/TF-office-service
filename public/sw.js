// Service Worker for persistent notifications, background sync, and offline support

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Activate immediately
});

// Activate event - claim all clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle push notifications from server
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  if (!event.data) {
    console.log('No data in push notification');
    return;
  }

  try {
    const data = event.data.json();
    showNotification(data.title || 'Themefisher', data.body || 'New notification');
  } catch (e) {
    console.error('Push notification parse error:', e);
    // Fallback if not JSON
    showNotification('Themefisher Office Service', event.data.text());
  }
});

// Simpler notification function
function showNotification(title, body) {
  const options = {
    body: body,
    tag: 'order-notification',
    requireInteraction: true,
    badge: '🏢',
    icon: '/manifest.json', // Use manifest icon
    vibrate: [200, 100, 200, 100, 200],
  };

  return self.registration.showNotification(title, options);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window
      for (const client of clientList) {
        if (client.url.includes('/canteen') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/canteen');
      }
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    showNotification(event.data.title, event.data.body);
  } else if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for messages to trigger notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      fetch('/api/orders').then(() => {
        showNotification('Orders Updated', 'New orders have arrived');
      })
    );
  }
});
