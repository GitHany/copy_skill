<template>
  <div v-show="!collapsed" class="search-area">
    <div class="search-wrapper">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        ref="inputRef"
        :value="modelValue"
        type="text"
        placeholder="搜索命令或关键词..."
        class="search-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus')"
        @blur="handleBlur"
        @keydown.enter="$emit('enter')"
      />
      <button
        v-if="modelValue"
        class="search-clear"
        title="清除搜索"
        @click="$emit('clear')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <kbd v-else class="search-kbd">⌘K</kbd>

      <!-- 搜索历史下拉 -->
      <Transition name="dropdown">
        <div v-if="showHistory && searchHistory.length > 0 && !modelValue" class="search-history">
          <div class="search-history-header">
            <span>搜索历史</span>
            <button class="search-history-clear" @click="$emit('clear-history')">清除</button>
          </div>
          <div class="search-history-list">
            <button
              v-for="(item, index) in searchHistory"
              :key="index"
              class="search-history-item"
              @click="$emit('select-history', item)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ item }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div class="tree-toolbar">
      <button class="toolbar-btn" title="展开全部" @click="$emit('expand-all')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"/>
          <polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>
      <button class="toolbar-btn" title="折叠全部" @click="$emit('collapse-all')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 14 10 14 10 20"/>
          <polyline points="20 10 14 10 14 4"/>
          <line x1="14" y1="10" x2="21" y2="3"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>
      <button
        class="toolbar-btn"
        :class="{ active: showFavoritesOnly }"
        title="只看收藏"
        @click="$emit('toggle-favorites')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" :fill="showFavoritesOnly ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
      <button class="toolbar-btn" :title="'主题: ' + themeMode" @click="$emit('toggle-theme')">
        <svg v-if="themeMode === 'dark'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
        <svg v-else-if="themeMode === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  showHistory: {
    type: Boolean,
    default: false
  },
  searchHistory: {
    type: Array,
    default: () => []
  },
  showFavoritesOnly: {
    type: Boolean,
    default: false
  },
  themeMode: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'enter',
  'clear',
  'clear-history',
  'select-history',
  'expand-all',
  'collapse-all',
  'toggle-favorites',
  'toggle-theme'
])

const inputRef = ref(null)
let blurTimer = null

const handleBlur = () => {
  if (blurTimer) clearTimeout(blurTimer)
  blurTimer = setTimeout(() => {
    emit('blur')
  }, 200)
}

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<style scoped>
.search-area {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 38px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-ui);
  color: var(--text-primary);
  outline: none;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.search-kbd {
  position: absolute;
  right: 10px;
  padding: 2px 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.search-clear {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.search-clear:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.search-clear:active {
  transform: scale(0.9);
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 8px;
  padding: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.search-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}

.search-history-clear {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 150ms ease-out;
}

.search-history-clear:hover {
  background: var(--accent-glow);
}

.search-history-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search-history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 13px;
  text-align: left;
  transition: background-color 150ms ease-out;
}

.search-history-item:hover {
  background: var(--bg-hover);
}

.search-history-item:active {
  transform: scale(0.98);
}

.search-history-item svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.tree-toolbar {
  display: flex;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.toolbar-btn {
  flex: 1;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.toolbar-btn:active {
  transform: scale(0.94);
}

.toolbar-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}
</style>
