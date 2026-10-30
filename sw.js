// Keep It Fit — service worker
// Rețea întâi (vezi mereu ultima versiune de pe GitHub), cache doar când nu e internet.
var CACHE = 'keepitfit-v1';
var CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  // Nu atinge sincronizarea cu Google Sheets și alte cereri non-GET
  if (req.method !== 'GET' || req.url.indexOf('script.google.com') > -1) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && new URL(req.url).origin === self.location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
    })
  );
});
