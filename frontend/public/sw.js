const CACHE_NAME = 'homecare-ai-cache-v1'
const OFFLINE_PAGE = '/offline'

const urlsToCache = [
  '/',
  '/offline',
  '/chat',
  '/tracker',
  '/medications',
  '/insights',
  '/symptoms',
  '/symptoms-timeline',
  '/manifest.json',
  '/logo.svg',
]

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      ).then(() => self.clients.claim())
    )
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith('/_next/') || url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cachedResponse => {
          const networkFetch = fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone())
            return networkResponse
          })
          return cachedResponse || networkFetch
        }).catch(() => cachedResponse)
      ).catch(() => new Response('', { status: 200, statusText: 'OK' }))
    )
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        const cloned = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, cloned))
        return response
      }).catch(() =>
        caches.match(request).then(cached => cached || new Response(JSON.stringify({ offline: true }), {
          headers: { 'Content-Type': 'application/json' },
        }))
      )
    )
    return
  }

  event.respondWith(
    fetch(request).then(response => {
      const cloned = response.clone()
      if (response.status === 200) {
        caches.open(CACHE_NAME).then(cache => cache.put(request, cloned))
      }
      return response
    }).catch(() =>
      caches.match(request).then(() => caches.match(OFFLINE_PAGE))
    )
  )
})
