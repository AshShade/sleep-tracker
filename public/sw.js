self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))));
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') return;
  e.respondWith(fetch(e.request).then(res => {
    const c = caches.open('v3').then(cache => cache.put(e.request, res.clone()));
    void c; return res;
  }).catch(() => caches.match(e.request)));
});
