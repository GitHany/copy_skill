// Service Worker for Copy Skill PWA - 针对30万+命令优化
const CACHE_NAME = 'copy-skill-v2'
const STATIC_CACHE = 'copy-skill-static-v2'
const DYNAMIC_CACHE = 'copy-skill-dynamic-v2'

// 静态资源列表（构建时预缓存）
const STATIC_ASSETS = [
  '/copy_skill/',
  '/copy_skill/index.html',
  '/copy_skill/commands.json',
  '/copy_skill/manifest.json',
  '/copy_skill/favicon.ico'
]

// 安装 - 预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).catch((err) => {
      console.error('预缓存失败:', err)
    })
  )
  self.skipWaiting()
})

// 激活 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 拦截请求 - 智能缓存策略
self.addEventListener('fetch', (event) => {
  // 跳过非HTTP请求（包括chrome-extension、chrome-devtools等）
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) return
  
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  
  // 跳过API请求
  if (url.pathname.startsWith('/api/')) return

  // commands.json使用Network First策略
  if (url.pathname.includes('commands.json')) {
    event.respondWith(networkFirstStrategy(event.request, DYNAMIC_CACHE))
    return
  }

  // 静态资源使用Cache First策略
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request, STATIC_CACHE))
    return
  }

  // 其他资源使用Stale While Revalidate策略
  event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE))
})

// Cache First策略
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const response = await fetch(request)
    if (response && response.ok) {
      try {
        const cache = await caches.open(cacheName)
        const responseToCache = response.clone()
        await cache.put(request, responseToCache)
      } catch (cacheErr) {
        // 忽略缓存写入错误（例如chrome-extension请求）
        console.debug('缓存写入失败:', cacheErr.message)
      }
    }
    return response
  } catch (err) {
    return new Response('离线不可用', { status: 503 })
  }
}

// Network First策略
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      try {
        const cache = await caches.open(cacheName)
        const responseToCache = response.clone()
        await cache.put(request, responseToCache)
      } catch (cacheErr) {
        console.debug('缓存写入失败:', cacheErr.message)
      }
    }
    return response
  } catch (err) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    return new Response('离线不可用', { status: 503 })
  }
}

// Stale While Revalidate策略
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) {
      try {
        caches.open(cacheName).then((cache) => {
          const responseToCache = response.clone()
          cache.put(request, responseToCache)
        })
      } catch (cacheErr) {
        console.debug('缓存写入失败:', cacheErr.message)
      }
    }
    return response
  }).catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

// 判断是否是静态资源
function isStaticAsset(pathname) {
  return /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf)$/.test(pathname)
}

// 后台同步（当网络恢复时更新数据）
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-commands') {
    event.waitUntil(updateCommandsData())
  }
})

async function updateCommandsData() {
  try {
    const response = await fetch('/copy_skill/commands.json')
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put('/copy_skill/commands.json', response.clone())
    }
  } catch (err) {
    console.error('后台同步失败:', err)
  }
}
