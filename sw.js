self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('controle-v1').then(cache => {
      return cache.addAll(['index.html','app.js']);
    })
  );
});