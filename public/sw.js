self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))));
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') return; // HTML always from network
  e.respondWith(caches.open('v2').then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
});
