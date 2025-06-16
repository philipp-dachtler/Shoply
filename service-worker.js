const CACHE_NAME = 'shoply-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.png'
];

// 1. Installationsphase: Cache wichtige Ressourcen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Aktivierungsphase: Alte Caches bereinigen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );

  // Starte den Hintergrund-Sync (Fallback für Browser ohne periodic sync)
  startBackgroundSync();
});

// 3. Fetch-Event: Cache-First-Strategie
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});

// 4. Push-Benachrichtigungen
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'Einkaufs-Erinnerung',
    body: 'Hast du heute schon eingekauft? 🛒',
    icon: './icons/icon-192.png',
    badge: './icons/icon-96.png'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      vibrate: [200, 100, 200],
      data: { url: self.location.origin }
    })
  );
});

// 5. Klick auf Benachrichtigung
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow(event.notification.data.url);
      })
  );
});

// 6. Hintergrund-Sync (Fallback für periodische Erinnerungen)
function startBackgroundSync() {
  // Nur als Fallback für Browser ohne periodic sync
  if (!('periodicSync' in self.registration)) {
    setInterval(() => {
      self.registration.showNotification('Einkaufs-Erinnerung', {
        body: 'Regelmäßige Erinnerung: Einkaufsliste prüfen',
        icon: './icons/icon-192.png',
        vibrate: [200, 100, 200]
      });
    }, 12 * 60 * 60 * 1000); // 12 Stunden
  }
}

// 7. Nachrichten von der App empfangen (für manuelle Trigger)
self.addEventListener('message', (event) => {
  if (event.data.type === 'SHOW_REMINDER') {
    self.registration.showNotification(event.data.title || 'Shoply', {
      body: event.data.body || 'Denk an deinen Einkauf!',
      icon: './icons/icon-192.png'
    });
  }
});
