const CACHE_NAME = 'homecare-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('[SW] Push received!', event)

  let title = 'HomeCare AI'
  let body = 'You have a new notification'
  let url = '/'

  try {
    if (event.data) {
      const data = event.data.json()
      title = data.title || title
      body = data.body || body
      url = data.url || url
    }
  } catch (e) {
    console.log('[SW] Parse error:', e)
  }

  const options = {
    body: body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: { url: url },
    requireInteraction: true,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
