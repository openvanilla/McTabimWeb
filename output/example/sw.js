const CACHE_NAME = 'v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './privacy_policy.html',
  './css/index.css',
  './bundle.js',
  './index.js',
  './icon192.png',
  './icon512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    }),
  );
});
