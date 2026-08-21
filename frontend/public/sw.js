const CACHE_NAME = 'homecare-ai-cache-v2'
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
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

self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: '/logo.svg',
    data: data.data || {},
    tag: data.tag || 'homecare-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        const matching = windowClients.find(client => client.url === urlToOpen)
        if (matching) {
          return matching.focus()
        }
        return clients.openWindow(urlToOpen)
      })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never cache API responses - they contain sensitive health data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  if (url.pathname.startsWith('/_next/') || url.pathname.match(/(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)$/)) {
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
