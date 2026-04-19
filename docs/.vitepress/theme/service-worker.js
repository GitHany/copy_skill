// Service Worker for Copy Skill PWA
const CACHE_NAME = 'copy-skill-v1'
const STATIC_ASSETS = [
  '/',
  '/commands',
  '/manifest.json',
  '/pwa-512x512.svg',
  '/commands.json'
]

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return

  // Skip cross-origin requests
  const url = new URL(event.request.url)
  if (url.origin !== location.origin) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 如果缓存中有，返回缓存
      if (cachedResponse) {
        // 同时发起网络请求更新缓存
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response)
            })
          }
        }).catch(() => {})
        return cachedResponse
      }

      // 缓存没有，发起网络请求
      return fetch(event.request).then((response) => {
        // 如果请求成功，缓存起来
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // 离线且没有缓存，返回离线页面
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
    })
  )
})
