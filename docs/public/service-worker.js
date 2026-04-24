// Service Worker for Copy Skill PWA - 针对30万+命令优化
const CACHE_VERSION = 'v3'
const STATIC_CACHE = `copy-skill-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `copy-skill-dynamic-${CACHE_VERSION}`

// 静态资源列表（构建时预缓存）
const STATIC_ASSETS = [
  '/copy_skill/',
  '/copy_skill/index.html',
  '/copy_skill/commands.json',
  '/copy_skill/manifest.json',
  '/copy_skill/favicon.ico'
]

// 离线回退页面
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线 - Copy Skill</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0c0c0f;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .offline-container {
      text-align: center;
      max-width: 400px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 { font-size: 24px; margin-bottom: 12px; color: #f59e0b; }
    p { color: #888; margin-bottom: 20px; line-height: 1.6; }
    button {
      background: #f59e0b;
      color: #000;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #fbbf24; }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📡</div>
    <h1>当前处于离线状态</h1>
    <p>请检查您的网络连接后，点击下方按钮重试。</p>
    <button onclick="window.location.reload()">重新加载</button>
  </div>
</body>
</html>
`

// 安装 - 预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('部分静态资源预缓存失败:', err)
        // 不阻止安装，继续
      })
    })
  )
  self.skipWaiting()
})

// 激活 - 清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // 只保留当前版本的缓存
            return name.startsWith('copy-skill-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE
          })
          .map((name) => {
            console.log('清理旧缓存:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      // 立即接管所有客户端
      return self.clients.claim()
    })
  )
})

// 拦截请求 - 智能缓存策略
self.addEventListener('fetch', (event) => {
  // 跳过非HTTP请求（包括chrome-extension、chrome-devtools等）
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) return
  
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  
  // 跳过API请求
  if (url.pathname.startsWith('/api/')) return

  // commands.json使用Network First策略（数据频繁更新）
  if (url.pathname.includes('commands.json')) {
    event.respondWith(networkFirstStrategy(event.request, DYNAMIC_CACHE))
    return
  }

  // 静态资源使用Cache First策略
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request, STATIC_CACHE))
    return
  }

  // HTML页面使用Network First with Offline Fallback
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(event.request))
    return
  }

  // 其他资源使用Stale While Revalidate策略
  event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE))
})

// Network First with Offline Fallback
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      return response
    }
    throw new Error('Network response not ok')
  } catch (err) {
    // 尝试从缓存获取
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    
    // 返回离线页面
    return new Response(OFFLINE_PAGE, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}

// Cache First策略
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  try {
    const response = await fetch(request)
    if (response && response.ok && !response.bodyUsed) {
      const responseToCache = response.clone()
      try {
        const cache = await caches.open(cacheName)
        await cache.put(request, responseToCache)
      } catch (cacheErr) {
        // 忽略缓存写入错误（例如chrome-extension请求）
        console.debug('缓存写入失败:', cacheErr.message)
      }
    }
    return response
  } catch (err) {
    // 返回空响应而不是错误页面
    return new Response('', { status: 503, statusText: 'Service Unavailable' })
  }
}

// Network First策略
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response && response.ok && !response.bodyUsed) {
      const responseToCache = response.clone()
      try {
        const cache = await caches.open(cacheName)
        await cache.put(request, responseToCache)
      } catch (cacheErr) {
        console.debug('缓存写入失败:', cacheErr.message)
      }
      return response
    }
    throw new Error('Network response not ok')
  } catch (err) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    return new Response('离线不可用', { status: 503 })
  }
}

// Stale While Revalidate策略
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  let responseToCache = null
  
  try {
    const response = await fetch(request)
    // 立即 clone，避免 body 被消费
    if (response && response.ok) {
      try {
        responseToCache = response.clone()
        const cache = await caches.open(cacheName)
        await cache.put(request, responseToCache)
      } catch (cacheErr) {
        console.debug('缓存写入失败:', cacheErr.message)
      }
    }
    return response
  } catch (err) {
    return cachedResponse || new Response('', { status: 503 })
  }
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
    if (response && response.ok) {
      const responseToCache = response.clone()
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put('/copy_skill/commands.json', responseToCache)
    }
  } catch (err) {
    console.error('后台同步失败:', err)
  }
}
