const CACHE_NAME = 'edudocs-v3';
const ASSETS = [
  '/Edu-docs-premium/index.html',
  '/Edu-docs-premium/auth.html',
  '/Edu-docs-premium/mes-docs.html',
  '/Edu-docs-premium/admin.html',
  '/Edu-docs-premium/style.css',
  '/Edu-docs-premium/app.js',
  '/Edu-docs-premium/manifest.json'
];

const BYPASS_DOMAINS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'firebaseapp.com',
  'googleapis.com',
  'gstatic.com',
  'jsdelivr.net',
  'emailjs.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'ibb.co',
  'unsplash.com'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.warn('Cache install error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (BYPASS_DOMAINS.some(d => url.hostname.includes(d))) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
