// Basic English PWA — Service Worker
const CACHE = 'basic-english-v5'
// Relative paths so the app works under a sub-path (e.g. /basic_english/)
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/validator.js',
  './js/chat.js',
  './js/teaching.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', e => {
  // Skip API calls (chat) — don't cache those
  if (e.request.url.includes('/api/') || e.request.url.includes('chat/completions')) return

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        // Cache new requests on the fly (for future offline use)
        if (res.ok && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(cache => cache.put(e.request, clone))
        }
        return res
      })
    )
  )
})
