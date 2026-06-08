// Service Worker for persistent notifications and background sync

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push notification received with no data');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      tag: data.tag || 'notification',
      requireInteraction: true,
      badge: '🏢',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231a2b45" width="192" height="192"/><text x="96" y="130" font-size="100" text-anchor="middle" fill="white">📦</text></svg>',
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text x="96" y="130" font-size="100" text-anchor="middle">👁️</text></svg>',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Themefisher Office Service', options)
    );
  } catch (e) {
    console.error('Push notification error:', e);
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('New Order', {
        body: 'A new order has been placed',
        requireInteraction: true,
        badge: '🏢',
        vibrate: [200, 100, 200, 100, 200],
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Look for existing window
      for (const client of clientList) {
        if (client.url === '/' || client.url.includes('/canteen')) {
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

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Keep service worker alive and listen for messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
