const cacheName = 'wolf-quiz-v12'; // Version erhöht für den "Harten Reset"

// Beim Installieren cachen wir die App-Hülle und das neue Icon
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './apple-touch-icon.png' // Hier zwingen wir den Wolf in den Speicher
      ]);
    })
  );
  self.skipWaiting();
});

// Alle alten Caches (v10, v11 etc.) restlos löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== cacheName).map(k => caches.delete(k))
      );
    })
  );
});

// Alles, was aufgerufen wird, landet im neuen Cache
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      const networkFetch = fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(cacheName).then(cache => {
            cache.put(e.request, resClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline-Modus
      });

      return cachedResponse || networkFetch;
    })
  );
});
