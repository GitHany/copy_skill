<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- 加载进度条 -->
    <div v-if="isLoading" class="loading-progress-bar">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
      </div>
      <div class="progress-text">{{ loadingProgress }}%</div>
    </div>
    
    <!-- 拖拽调整宽度手柄 -->
    <div 
      v-show="!collapsed"
      class="sidebar-resize-handle" 
      :class="{ 'resizing': isResizing }"
      @mousedown="$emit('resize-start', $event)"
      @touchstart.prevent="$emit('resize-start', $event)"
    ></div>
    
    <!-- Logo 区域 -->
    <SidebarHeader
      :command-count="commandCount"
      :collapsed="collapsed"
      :is-mobile="isMobile"
      @collapse="$emit('collapse')"
    />

    <!-- 搜索 & 工具栏 -->
    <SearchBar
      ref="searchBarRef"
      v-model="searchQueryLocal"
      :collapsed="collapsed"
      :show-history="showSearchHistory"
      :search-history="searchHistory"
      :show-favorites-only="showFavoritesOnly"
      :theme-mode="themeMode"
      @focus="showSearchHistory = true"
      @blur="showSearchHistory = false"
      @enter="handleSearchEnter"
      @clear="clearSearch"
      @clear-history="clearSearchHistory"
      @select-history="searchQueryLocal = $event; showSearchHistory = false"
      @expand-all="$emit('expand-all')"
      @collapse-all="$emit('collapse-all')"
      @toggle-favorites="$emit('toggle-favorites')"
      @toggle-theme="$emit('toggle-theme')"
    />

    <!-- 收藏分组 -->
    <div v-if="favorites.length > 0 && !collapsed" class="favorites-section">
      <div class="favorites-header" @click="showFavorites = !showFavorites">
        <span class="folder-arrow" :class="{ expanded: showFavorites }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span class="folder-name">收藏 ({{ favorites.length }})</span>
      </div>
      <Transition name="folder-content">
        <div v-show="showFavorites" class="favorites-commands">
          <div
            v-for="cmd in favorites"
            :key="cmd.id"
            class="command-item favorite-item"
            :class="{ active: selectedCommandId === cmd.id }"
            @click="$emit('select-command', cmd)"
          >
            <span class="command-indicator"></span>
            <span class="command-name" v-html="highlightText(cmd.name, searchQueryLocal)"></span>
            <button class="unfavorite-btn" title="取消收藏" @click.stop="$emit('toggle-favorite', cmd)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 导航树 -->
    <CommandTree
      :displayed-tree="displayedTree"
      :expanded-folders="expandedFolders"
      :collapsed="collapsed"
      :selected-command-id="selectedCommandId"
      :keyboard-selected-id="keyboardSelectedId"
      :search-query="searchQueryLocal"
      @toggle-folder="$emit('toggle-folder', $event)"
      @select-command="$emit('select-command', $event)"
      @hover-command="(cmd, evt) => $emit('hover-command', cmd, evt)"
      @leave-command="$emit('leave-command')"
      @expand-sidebar="$emit('collapse', false)"
      @copy-command="$emit('copy-command', $event)"
    />
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SidebarHeader from './SidebarHeader.vue'
import SearchBar from './SearchBar.vue'
import CommandTree from './CommandTree.vue'
import { highlightText } from '../utils.js'

const props = defineProps({
  displayedTree: {
    type: Array,
    default: () => []
  },
  expandedFolders: {
    type: Object,
    default: () => new Set()
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  loadingProgress: {
    type: Number,
    default: 0
  },
  isResizing: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  commandCount: {
    type: Number,
    default: 0
  },
  selectedCommandId: {
    type: String,
    default: null
  },
  keyboardSelectedId: {
    type: String,
    default: null
  },
  searchQuery: {
    type: String,
    default: ''
  },
  favorites: {
    type: Array,
    default: () => []
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
  'collapse',
  'resize-start',
  'expand-all',
  'collapse-all',
  'toggle-favorites',
  'toggle-theme',
  'toggle-folder',
  'select-command',
  'hover-command',
  'leave-command',
  'update:searchQuery',
  'search-enter',
  'clear-search',
  'clear-history',
  'copy-command'
])

const searchBarRef = ref(null)
const showSearchHistory = ref(false)
const showFavorites = ref(true)
const searchQueryLocal = ref(props.searchQuery)

watch(() => props.searchQuery, (val) => {
  searchQueryLocal.value = val
})

watch(searchQueryLocal, (val) => {
  emit('update:searchQuery', val)
})

const clearSearch = () => {
  searchQueryLocal.value = ''
  emit('clear-search')
}

const handleSearchEnter = () => {
  if (searchQueryLocal.value.trim()) {
    emit('search-enter', searchQueryLocal.value)
  }
  showSearchHistory.value = false
}

const clearSearchHistory = () => {
  emit('clear-history')
}

defineExpose({
  focusSearch: () => searchBarRef.value?.focus()
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 180ms ease-out, min-width 180ms ease-out;
  position: relative;
  z-index: 1;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
  min-width: var(--sidebar-collapsed-width);
}

.sidebar-resize-handle {
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  z-index: 10;
  background: transparent;
  transition: background-color 150ms ease-out;
}

.sidebar-resize-handle:hover,
.sidebar-resize-handle.resizing {
  background: linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%);
  opacity: 0.5;
}

.sidebar-resize-handle.resizing {
  opacity: 1;
}

.sidebar-resize-handle::after {
  content: '';
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 40px;
  background: var(--border-color);
  border-radius: 1px;
  opacity: 0;
  transition: opacity 150ms ease-out, background-color 150ms ease-out;
}

.sidebar-resize-handle:hover::after {
  opacity: 1;
  background: var(--accent-primary);
}

.loading-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-secondary);
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
}

.progress-track {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-align: center;
}

.favorites-section {
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}

.favorites-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  cursor: pointer;
  user-select: none;
}

.favorites-header svg {
  color: var(--accent-primary);
}

.favorites-header .folder-name {
  color: var(--accent-primary);
  font-weight: 500;
}

.favorites-commands {
  padding-bottom: 8px;
}

.favorite-item {
  position: relative;
}

.unfavorite-btn {
  position: absolute;
  right: 8px;
  opacity: 0;
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: opacity 0.15s;
}

.favorite-item:hover .unfavorite-btn {
  opacity: 1;
}

.folder-content-enter-active,
.folder-content-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
  overflow: hidden;
}

.folder-content-enter-from,
.folder-content-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
  transform-origin: top;
}
</style>
