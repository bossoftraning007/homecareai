const CACHE_NAME = 'homecare-ai-cache-v4'
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
  console.log('[SW] Push event received')
  if (!event.data) {
    console.log('[SW] No data in push event')
    return
  }

  try {
    const data = event.data.json()
    console.log('[SW] Push data:', data)

    const options = {
      body: data.body || 'New notification from HomeCare AI',
      icon: data.icon || '/logo.svg',
      badge: '/logo.svg',
      data: data.data || {},
      tag: data.tag || 'homecare-notification-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300, 100, 300],
      silent: false,
      timestamp: Date.now(),
      actions: [
        { action: 'open', title: 'Open App', icon: '/logo.svg' },
        { action: 'dismiss', title: 'Dismiss', icon: '/logo.svg' },
      ],
    }

    console.log('[SW] Showing notification:', data.title, options)
    event.waitUntil(
      self.registration.showNotification(data.title || 'HomeCare AI', options)
        .then(() => console.log('[SW] Notification shown successfully'))
        .catch(err => console.error('[SW] Failed to show notification:', err))
    )
  } catch (err) {
    console.error('[SW] Error handling push:', err)
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        const matching = windowClients.find(client => client.url.includes(urlToOpen))
        if (matching) {
          return matching.focus()
        }
        return clients.openWindow(urlToOpen)
      })
  )
})

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
    }).then((newSubscription) => {
      return fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription.toJSON()),
      })
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'TEST_PUSH') {
    const payload = event.data.payload
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo.svg',
      badge: '/logo.svg',
      vibrate: [300, 100, 300],
      requireInteraction: true,
    })
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return
  }

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
      if (response.status === 200 && response.type === 'basic') {
        caches.open(CACHE_NAME).then(cache => cache.put(request, cloned))
      }
      return response
    }).catch(() =>
      caches.match(request).then(() => caches.match(OFFLINE_PAGE))
    )
  )
})
