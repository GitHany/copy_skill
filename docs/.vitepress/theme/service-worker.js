// Service Worker for Copy Skill PWA
const CACHE_NAME = 'copy-skill-v1'

// 安装 - 跳过预缓存，避免路径问题
self.addEventListener('install', (event) => {
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

// 拦截请求 - 缓存优先，网络更新
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== location.origin) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 缓存存在，返回缓存同时更新
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response)
            })
          }
        }).catch(() => {})
        return cachedResponse
      }

      // 缓存不存在，从网络获取
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // 离线且没有缓存
        if (event.request.destination === 'document') {
          return caches.match('/copy_skill/')
        }
      })
    })
  )
})
