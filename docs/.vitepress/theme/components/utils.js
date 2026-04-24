/**
 * LRU Cache implementation for search highlight optimization
 * Limits cache size to prevent memory leaks
 */
export class LRUCache {
  constructor(maxSize = 500) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) {
      return undefined
    }
    // Move to end (most recently used)
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    // If key exists, remove it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // If at max size, remove oldest (first) entry
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key) {
    return this.cache.has(key)
  }

  clear() {
    this.cache.clear()
  }

  get size() {
    return this.cache.size
  }
}

/**
 * Creates a debounced version of a function using requestAnimationFrame
 * for better performance
 */
export function useDebounceRAF(callback, defaultDelay = 150) {
  let rafId = null
  let timeoutId = null

  const debounced = (...args) => {
    // Cancel pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    // Clear pending timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    // Use RAF for immediate visual feedback, then setTimeout for actual execution
    rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        callback(...args)
        rafId = null
        timeoutId = null
      }, defaultDelay)
    })
  }

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const flush = (...args) => {
    cancel()
    callback(...args)
  }

  return { debounced, cancel, flush }
}

/**
 * Creates a throttled version of a function using requestAnimationFrame
 */
export function useThrottleRAF(callback) {
  let rafId = null
  let lastArgs = null

  const throttled = (...args) => {
    lastArgs = args
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        callback(...lastArgs)
        rafId = null
      })
    }
  }

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  return { throttled, cancel }
}

// Escape HTML special characters
export function escapeHtml(str) {
  if (!str) return str
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Highlight text with search query (uses LRU cache internally)
const highlightCache = new LRUCache(500)

export function highlightText(text, query) {
  if (!text) return text
  if (!query) return escapeHtml(text)

  const cacheKey = `${text}|${query}`
  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey)
  }

  const queries = query.toLowerCase().split(/\s+/).filter(q => q)
  if (queries.length === 0) return escapeHtml(text)

  const escapedText = escapeHtml(text)
  const regex = new RegExp(
    `(${queries.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  )
  const result = escapedText.replace(regex, '<mark class="highlight">$1</mark>')

  highlightCache.set(cacheKey, result)
  return result
}
