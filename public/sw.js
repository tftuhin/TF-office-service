// Service Worker for persistent notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      tag: data.tag || 'notification',
      requireInteraction: true,
      badge: '🏢',
      vibrate: [200, 100, 200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (e) {
    console.error('Push notification error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
