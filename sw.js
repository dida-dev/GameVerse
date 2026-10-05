const CACHE_NAME = 'v1_cache';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Intercepter les requêtes pour servir le contenu depuis le cache si hors ligne
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
