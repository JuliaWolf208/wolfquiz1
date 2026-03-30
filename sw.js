const cacheName = 'wolf-quiz-v33'; // Version erhöhen bei Änderungen

// Beim Installieren: nur Grundstruktur cachen
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

// Alte Caches löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(k => k !== cacheName)
          .map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch-Handler (FIX: Icons nicht cachen!)
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 🔥 WICHTIG: Icons und Bilder NICHT cachen
  if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) {
    return; // immer direkt vom Netzwerk laden
  }

  e.respondWith(
    caches.match(e.reques
