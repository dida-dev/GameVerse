const CACHE_NAME = "gamevault-v3"; // <--- 1. Incremented version

const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];

// Install: Save core app shell
self.addEventListener("install", event => {
    self.skipWaiting(); // Instantly activate new service worker
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES);
        })
    );
});

// Activate: Delete old caches (like gamevault-v1) automatically
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network-First strategy (always check server first, fallback to cache if offline)
self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Update cache with the new response from network
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If offline or network fails, use cached copy
                return caches.match(event.request);
            })
    );
});