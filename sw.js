const cacheName = 'wolf-quiz-v1.8'; // Version bei großen Änderungen hochzählen

// Beim Installieren cachen wir nur das Nötigste (die App-Hülle)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Alte Caches aufräumen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== cacheName).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim(); // NEU: Neue SW-Version übernimmt sofort alle offenen Tabs
});

// DER AUTOMATIK-TRICK: Alles, was aufgerufen wird, landet im Cache
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // 1. Wenn wir es im Cache haben, zeigen wir es sofort (schnell!)
      // 2. Parallel fragen wir das Netzwerk nach einer frischen Version
      const networkFetch = fetch(e.request).then(networkResponse => {
        // Wenn die Antwort gültig ist, kopieren wir sie in den Cache
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(cacheName).then(cache => {
            cache.put(e.request, resClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline-Fall: Wenn Netzwerk fehlschlägt, ist das okay
      });

      return cachedResponse || networkFetch;
    })
  );
});
