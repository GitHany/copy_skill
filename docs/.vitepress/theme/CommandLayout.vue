<template>
  <div class="command-app" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile-sidebar-open': mobileSidebarOpen }">
    <!-- 移动端菜单按钮 -->
    <button v-show="!mobileSidebarOpen && isMobile" class="mobile-menu-btn" @click="mobileSidebarOpen = true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <!-- 移动端遮罩层 -->
    <div v-show="mobileSidebarOpen" class="mobile-overlay" @click="mobileSidebarOpen = false"></div>

    <!-- 移动端底部导航栏 -->
    <nav v-if="isMobile" class="mobile-bottom-nav">
      <button class="nav-btn" :class="{ active: !overviewCollapsed }" @click="overviewCollapsed = !overviewCollapsed">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>概览</span>
      </button>
      <button class="nav-btn" :class="{ active: showFavoritesOnly }" @click="toggleFavoritesMobile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>收藏</span>
      </button>
      <button class="nav-btn" @click="searchInputRef?.focusSearch()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>搜索</span>
      </button>
      <button class="nav-btn" @click="mobileSidebarOpen = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>菜单</span>
      </button>
    </nav>

    <!-- 侧边栏 -->
    <Sidebar
      ref="sidebarRef"
      v-model:searchQuery="searchQuery"
      :displayed-tree="displayedTree"
      :expanded-folders="expandedFolders"
      :collapsed="sidebarCollapsed"
      :is-loading="isLoading"
      :loading-progress="loadingProgress"
      :is-resizing="isResizing"
      :is-mobile="isMobile"
      :command-count="commands.length"
      :selected-command-id="selectedCommand?.id"
      :keyboard-selected-id="keyboardSelectedId"
      :favorites="favorites"
      :search-history="searchHistory"
      :show-favorites-only="showFavoritesOnly"
      :theme-mode="themeMode"
      @collapse="handleCollapseClick"
      @resize-start="startResize"
      @expand-all="expandAll"
      @collapse-all="collapseAll"
      @toggle-favorites="showFavoritesOnly = !showFavoritesOnly"
      @toggle-theme="toggleTheme"
      @toggle-folder="toggleFolder"
      @select-command="selectCommand"
      @hover-command="showPreview"
      @leave-command="hidePreview"
      @search-enter="handleSearchEnter"
      @clear-search="clearSearch"
      @clear-history="clearSearchHistory"
      @copy-command="handleInlineCopy"
    />

    <!-- 主内容区 -->
    <main class="content">
      <!-- 快捷键帮助面板 -->
      <ShortcutsHelp
        :show="showShortcutsHelp"
        @close="showShortcutsHelp = false"
      />

      <!-- 顶部模块概览 -->
      <ModuleOverview
        :modules="modules"
        :filtered-modules="filteredModules"
        :category-tabs="categoryTabs"
        :selected-category="selectedCategory"
        :selected-module="selectedModule"
        :collapsed="overviewCollapsed"
        :total-commands="totalCommands"
        @toggle-overview="toggleOverview"
        @select-category="selectCategory"
        @select-module="selectModule"
      />

      <!-- 命令详情 -->
      <CommandDetail
        v-if="selectedCommand"
        :command="selectedCommand"
        :is-favorited="isSelectedCommandFavorited"
        :copied-index="copiedIndex"
        :search-query="searchQuery"
        @toggle-favorite="toggleFavorite"
        @copy="copyCommand"
        @keyword-click="searchQuery = $event"
      />

      <!-- 空状态 -->
      <EmptyState v-else />
    </main>

    <!-- 命令面板 ⌘K -->
    <CommandPalette
      ref="paletteRef"
      :show="showPalette"
      :query="paletteQuery"
      :results="paletteResults"
      :selected-index="paletteSelectedIndex"
      @close="showPalette = false"
      @update:query="paletteQuery = $event"
      @move-selection="movePaletteSelection"
      @execute="executePaletteSelection"
      @select="selectPaletteItem"
      @hover="paletteSelectedIndex = $event"
    />

    <!-- Hover 预览 -->
    <CommandPreview
      :command="previewCommand"
      :position="previewPosition"
    />

    <!-- 复制成功 toast -->
    <Toast :show="showToast" />

    <!-- 占位符输入弹窗 -->
    <PlaceholderModal
      :show="showPlaceholderModal"
      :params="placeholderParams"
      :values="placeholderValues"
      :command-text="pendingCommandText"
      @close="showPlaceholderModal = false"
      @confirm="confirmPlaceholderCopy"
      @fill-all="fillAllExamples"
      @fill-example="fillExample"
      @update="(key, value) => { placeholderValues.value[key] = value }"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { dataManager } from './CommandDataManager.js'
import Sidebar from './components/Sidebar/Sidebar.vue'
import ShortcutsHelp from './components/Modals/ShortcutsHelp.vue'
import ModuleOverview from './components/Content/ModuleOverview.vue'
import CommandDetail from './components/Content/CommandDetail.vue'
import EmptyState from './components/Content/EmptyState.vue'
import CommandPalette from './components/Modals/CommandPalette.vue'
import CommandPreview from './components/Preview/CommandPreview.vue'
import PlaceholderModal from './components/Modals/PlaceholderModal.vue'
import Toast from './components/common/Toast.vue'


// ==================== 状态定义 ====================
// 核心数据 - 使用 shallowRef 优化大数据量性能
const commands = shallowRef([]) // 所有命令列表
const tree = shallowRef([]) // 树形结构的命令
const expandedFolders = ref(new Set()) // 展开的文件夹ID集合

// 搜索正则缓存
const searchRegexCache = new Map()
const getSearchRegex = (query) => {
  if (!query) return null
  if (searchRegexCache.has(query)) {
    return searchRegexCache.get(query)
  }
  const queries = query.toLowerCase().split(/\s+/).filter(q => q)
  if (queries.length === 0) return null
  const regex = new RegExp(
    queries.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'gi'
  )
  searchRegexCache.set(query, regex)
  // 限制缓存大小
  if (searchRegexCache.size > 20) {
    const firstKey = searchRegexCache.keys().next().value
    searchRegexCache.delete(firstKey)
  }
  return regex
}
const selectedCommand = ref(null) // 当前选中的命令

// ==================== 性能优化：预计算数据 ====================
let _idCounter = 0 // 简单递增 ID 生成器
const getNextId = () => {
  _idCounter++
  return `cmd-${_idCounter}`
}

// LRU 缓存类
class LRUCache {
  constructor(maxSize = 20) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return undefined
    const value = this.cache.get(key)
    // 移到末尾（最新使用）
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的（第一个）
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear() {
    this.cache.clear()
  }
}

// UI 状态
const searchQuery = ref('') // 搜索关键词
const isCopied = ref(false) // 复制成功状态
const copiedIndex = ref(-2) // -2 = nothing copied, -1 = 主命令，其他 = extensions 索引
const showToast = ref(false) // Toast 显示状态
const sidebarCollapsed = ref(false) // 侧边栏折叠状态
const mobileSidebarOpen = ref(false) // 移动端侧边栏打开状态
const isMobile = ref(false) // 是否移动端
const isResizing = ref(false) // 是否正在调整侧边栏宽度

// Refs
const sidebarRef = ref(null)
const searchInputRef = ref(null)
const paletteRef = ref(null)

// ==================== 主题管理 ====================
const themeMode = ref('dark')

const loadTheme = () => {
  try {
    const saved = localStorage.getItem('themeMode')
    if (saved) themeMode.value = saved
    applyTheme()
  } catch (e) {}
}

const applyTheme = () => {
  try {
    document.documentElement.setAttribute('data-theme', themeMode.value)
  } catch (e) {}
}

const toggleTheme = () => {
  const modes = ['dark', 'light']
  const currentIndex = modes.indexOf(themeMode.value)
  themeMode.value = modes[(currentIndex + 1) % modes.length]
  applyTheme()
  try { localStorage.setItem('themeMode', themeMode.value) } catch (e) {}
}

// ==================== 搜索历史管理 ====================
const searchHistory = ref([])

const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('searchHistory')
    if (saved) searchHistory.value = JSON.parse(saved)
  } catch (e) {}
}

const addToSearchHistory = (query) => {
  if (!query || !query.trim()) return
  const trimmed = query.trim()
  searchHistory.value = [trimmed, ...searchHistory.value.filter(h => h !== trimmed)].slice(0, 10)
  scheduleSave('searchHistory')
}

const clearSearchHistory = () => {
  searchHistory.value = []
  scheduleSave('searchHistory')
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleSearchEnter = () => {
  if (searchQuery.value.trim()) {
    addToSearchHistory(searchQuery.value)
  }
}

// ========== localStorage 批量写入优化 ==========
const pendingWrites = new Set()
let saveTimer = null

const scheduleSave = (key) => {
  pendingWrites.add(key)
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (pendingWrites.has('favorites')) {
      try { localStorage.setItem('favoriteCommands', JSON.stringify(favoritesRaw.value)) } catch (e) {}
      pendingWrites.delete('favorites')
    }
    if (pendingWrites.has('searchHistory')) {
      try { localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value)) } catch (e) {}
      pendingWrites.delete('searchHistory')
    }
    if (pendingWrites.has('recentCommands')) {
      try { localStorage.setItem('recentCommands', JSON.stringify(recentCommands.value)) } catch (e) {}
      pendingWrites.delete('recentCommands')
    }
    if (pendingWrites.has('layoutState')) {
      try { localStorage.setItem('layoutState', JSON.stringify({ sidebarCollapsed: sidebarCollapsed.value, sidebarWidth: 320, overviewCollapsed: overviewCollapsed.value, expandedFolders: Array.from(expandedFolders.value) })) } catch (e) {}
      pendingWrites.delete('layoutState')
    }
  }, 300)
}

let searchDebounceTimer = null
const debouncedSearchQuery = ref('')

watch(searchQuery, (newQuery) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newQuery
  }, 150)
})

// 占位符输入
const showPlaceholderModal = ref(false)
const placeholderValues = ref({})
const placeholderParams = ref([])

// ==================== 命令面板 ====================
const showPalette = ref(false)
const paletteQuery = ref('')
const paletteSelectedIndex = ref(0)
const recentCommands = ref([])

// ==================== 快捷键帮助面板 ====================
const showShortcutsHelp = ref(false)

// ==================== 收藏数据 ====================
const favorites = computed(() => {
  const commandIds = new Set(commands.value.map(c => c.id))
  return favoritesRaw.value.filter(f => commandIds.has(f.id))
})

const isSelectedCommandFavorited = computed(() => {
  if (!selectedCommand.value) return false
  return favorites.value.some(c => c.id === selectedCommand.value.id)
})

const favoritesRaw = ref([])
const showFavoritesOnly = ref(false)

// ==================== 模块标签 ====================
const modules = ref([])
const selectedModule = ref('all')
// 优化：使用 ref 而不是 computed，在 buildTree 时直接计算
const totalCommands = ref(0)
const overviewCollapsed = ref(false)

const toggleOverview = () => {
  overviewCollapsed.value = !overviewCollapsed.value
}

const handleCollapseClick = () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = false
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
    saveLayoutState()
  }
}

const startResize = (_e) => {
  if (isMobile.value && !mobileSidebarOpen.value) return
  isResizing.value = true
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
  
  const handleMove = (moveEvent) => {
    const currentX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX
    const newWidth = currentX
    const minWidth = 200
    const maxWidth = isMobile.value ? Math.min(500, window.innerWidth * 0.85) : Math.min(500, window.innerWidth - 100)
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`)
    }
  }
  
  const handleMouseMove = (moveEvent) => handleMove(moveEvent)
  const handleTouchMove = (moveEvent) => handleMove(moveEvent)
  
  const handleEnd = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleEnd)
    saveLayoutState()
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleEnd)
}

const toggleFavoritesMobile = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
  if (showFavoritesOnly.value && favorites.value.length > 0) {
    selectedCommand.value = favorites.value[0]
  } else if (!showFavoritesOnly.value && commands.value.length > 0) {
    selectedCommand.value = null
  }
}

// 分类标签系统
const selectedCategory = ref('all')
const categoryTabs = ref([])

const filteredModules = computed(() => {
  const moduleList = modules.value.filter(m => m.id !== 'all')
  
  if (selectedCategory.value === 'all') {
    return moduleList
  }
  
  const category = categoryTabs.value.find(c => c.id === selectedCategory.value)
  if (!category) return moduleList
  
  return moduleList.filter(mod => {
    const firstChar = mod.name.charAt(0).toUpperCase()
    return category.ranges.some(range => {
      if (range.length === 1) {
        return firstChar === range[0]
      }
      return firstChar >= range[0] && firstChar <= range[1]
    })
  })
})

const generateCategoryTabs = () => {
  const moduleList = modules.value.filter(m => m.id !== 'all')
  
  const groups = {
    'A-E': { ranges: [['A'], ['B'], ['C'], ['D'], ['E']], modules: [] },
    'F-J': { ranges: [['F'], ['G'], ['H'], ['I'], ['J']], modules: [] },
    'K-O': { ranges: [['K'], ['L'], ['M'], ['N'], ['O']], modules: [] },
    'P-T': { ranges: [['P'], ['Q'], ['R'], ['S'], ['T']], modules: [] },
    'U-Z': { ranges: [['U'], ['V'], ['W'], ['X'], ['Y'], ['Z']], modules: [] }
  }
  
  moduleList.forEach(mod => {
    const firstChar = mod.name.charAt(0).toUpperCase()
    for (const [, group] of Object.entries(groups)) {
      const inGroup = group.ranges.some(range => {
        if (range.length === 1) return firstChar === range[0]
        return firstChar >= range[0] && firstChar <= range[1]
      })
      if (inGroup) {
        group.modules.push(mod)
        break
      }
    }
  })
  
  categoryTabs.value = [
    { id: 'all', label: `全部 (${moduleList.length})` },
    ...Object.entries(groups)
      .filter(([_, group]) => group.modules.length > 0)
      .map(([key, group]) => ({
        id: key,
        label: `${key} (${group.modules.length})`,
        ranges: group.ranges
      }))
  ]
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  if (categoryId !== 'all') {
    const category = categoryTabs.value.find(c => c.id === categoryId)
    if (category) {
      const inCategory = filteredModules.value.some(m => m.id === selectedModule.value)
      if (!inCategory) {
        selectedModule.value = 'all'
      }
    }
  }
}

const MODULE_ICONS = {
  'Claude Skills': '🤖',
  'Linux 命令': '🐧',
  'Git 命令': '🔀',
  '提示词': '💡',
  'GSD 工作流': '🔄',
  'default': '📁'
}

const extractModules = () => {
  const moduleMap = {}
  commands.value.forEach(cmd => {
    if (!cmd.data || !cmd.data.cmd) return
    const dirPath = cmd.dirPath || '/未分类/'
    const path = dirPath.replace(/^\/|\/$/g, '')
    if (!path) return
    const parts = path.split('/')
    const topModule = parts[0]
    if (!moduleMap[topModule]) {
      moduleMap[topModule] = { id: topModule, name: topModule, count: 0, icon: MODULE_ICONS[topModule] || MODULE_ICONS['default'] }
    }
    moduleMap[topModule].count++
  })
  modules.value = [
    { id: 'all', name: '全部', count: commands.value.filter(c => c.data && c.data.cmd).length, icon: '📋' },
    ...Object.values(moduleMap)
  ]
  generateCategoryTabs()
}

const selectModule = (moduleId) => {
  selectedModule.value = moduleId
  if (searchQuery.value) {
    searchQuery.value = ''
    debouncedSearchQuery.value = ''
  }
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
}

// Hover 预览
const previewCommand = ref(null)
const previewPosition = ref({ x: 0, y: 0 })
let previewTimeout = null

// 键盘导航 - 使用缓存优化
const allFlatCommands = shallowRef([])
const flatCommandsCache = new LRUCache(20) // LRU 缓存，最多 20 条
const keyboardSelectedId = ref(null)

const updateFlatCommands = () => {
  const treeKey = JSON.stringify(tree.value.map(n => n.id))
  const cached = flatCommandsCache.get(treeKey)
  if (cached) {
    allFlatCommands.value = cached
    return
  }
  
  const flat = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.commands) {
        flat.push(...node.commands)
      }
      if (node.children) traverse(node.children)
    })
  }
  traverse(displayedTree.value)
  
  flatCommandsCache.set(treeKey, flat)
  allFlatCommands.value = flat
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

let resizeObserver = null

const getBasePath = () => {
  return import.meta.env.BASE_URL || '/'
}

const loadingProgress = ref(0)
const isLoading = ref(false)

const loadCommands = async () => {
  try {
    const basePath = getBasePath()
    const dataUrl = `${basePath}commands.json`
    
    isLoading.value = true
    
    dataManager.on('loading-progress', (data) => {
      loadingProgress.value = data.percent
    })
    
    dataManager.on('loading-complete', () => {
      isLoading.value = false
    })
    
    dataManager.on('loaded-from-cache', () => {
      isLoading.value = false
    })
    
    await dataManager.init(dataUrl)
    
    const allCommands = dataManager.getAllCommands()
    
    // 重置 ID 生成器
    _idCounter = 0
    
    commands.value = allCommands.map((item, index) => {
      const cmd = {
        ...item,
        // 优化：使用递增 ID 替代 crypto.randomUUID
        id: item.id || getNextId(),
        data: item.data ? { ...item.data } : undefined
      }
      return cmd
    })
    
    buildTree()
    extractModules()

    if (commands.value.length > 0) {
      expandAllFolders(tree.value)
    }
  } catch (error) {
    isLoading.value = false
  }
}

const expandAllFolders = (nodes) => {
  nodes.forEach(node => {
    expandedFolders.value.add(node.id)
    if (node.children && node.children.length > 0) {
      expandAllFolders(node.children)
    }
  })
  expandedFolders.value = new Set(expandedFolders.value)
}

const buildTree = () => {
  const treeMap = {}

  commands.value.forEach(item => {
    if (!item.data || !item.data.cmd) return

    const dirPath = item.dirPath || '/未分类/'
    const path = dirPath.replace(/^\/|\/$/g, '')
    if (!path) return

    const parts = path.split('/')
    let current = treeMap
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath += '/' + part

      if (!current[part]) {
        current[part] = {
          id: currentPath,
          name: part,
          commands: [],
          children: {}
        }
      }

      if (index === parts.length - 1) {
        current[part].commands.push(item)
      }

      current = current[part].children
    })
  })

  const convertToArray = (obj) => {
    return Object.values(obj).map(item => ({
      id: item.id,
      name: item.name,
      commands: item.commands,
      children: convertToArray(item.children)
    }))
  }

  tree.value = convertToArray(treeMap)
  
  // 优化：在 buildTree 时直接计算 totalCommands，避免重复遍历
  let count = 0
  const countCommands = (nodes) => {
    for (const node of nodes) {
      count += node.commands.length
      if (node.children?.length) countCommands(node.children)
    }
  }
  countCommands(tree.value)
  totalCommands.value = count
}

const displayedTree = computed(() => {
  // 提前返回：如果没有过滤条件，直接返回树
  if (!debouncedSearchQuery.value && !showFavoritesOnly.value) {
    if (selectedModule.value === 'all') {
      return tree.value
    }
    return tree.value.filter(node => {
      return node.id === '/' + selectedModule.value || node.name === selectedModule.value
    })
  }

  let baseTree = tree.value
  
  if (selectedModule.value !== 'all') {
    baseTree = tree.value.filter(node => {
      return node.id === '/' + selectedModule.value || node.name === selectedModule.value
    })
  }

  const queries = debouncedSearchQuery.value.toLowerCase().split(/\s+/).filter(q => q)
  const foldersToExpand = new Set()
  const favoritesSet = new Set(favoritesRaw.value.map(f => f.id))

  // 使用缓存的搜索正则
  const searchRegex = getSearchRegex(debouncedSearchQuery.value)

  const filterTree = (nodes) => {
    const result = []
    for (const node of nodes) {
      const filteredChildren = node.children?.length > 0 ? filterTree(node.children) : []
      
      let filteredCommands = node.commands.filter(cmd => {
        if (showFavoritesOnly.value && !favoritesSet.has(cmd.id)) {
          return false
        }
        
        if (searchRegex) {
          const searchText = [
            cmd.name || '',
            cmd.keyword || '',
            cmd.description || '',
            cmd.data?.cmd || '',
            cmd.data?.extensions?.map(e => e.name).join(' ') || ''
          ].join(' ').toLowerCase()
          return searchRegex.test(searchText)
        }
        
        return true
      })

      if (filteredCommands.length > 0 || filteredChildren.length > 0) {
        if (filteredCommands.length > 0) {
          foldersToExpand.add(node.id)
        }
        result.push({
          id: node.id,
          name: node.name,
          commands: filteredCommands,
          children: filteredChildren
        })
      }
    }
    return result
  }

  const filteredTree = filterTree(baseTree)
  
  if (foldersToExpand.size > 0) {
    foldersToExpand.forEach(id => expandedFolders.value.add(id))
  }

  return filteredTree
})

watch(displayedTree, updateFlatCommands, { deep: false })
updateFlatCommands()

const toggleFolder = (folderId) => {
  const newSet = new Set(expandedFolders.value)
  if (newSet.has(folderId)) {
    newSet.delete(folderId)
  } else {
    newSet.add(folderId)
  }
  expandedFolders.value = newSet
  saveLayoutState()
}

const selectCommand = (cmd) => {
  selectedCommand.value = cmd
  addToRecent(cmd)
}

// 提取命令中的占位符 %{...}%
const extractPlaceholders = (cmdText, paramsDef = {}) => {
  const regex = /%\{([^}]+)\}%/g
  const result = []
  let match
  while ((match = regex.exec(cmdText)) !== null) {
    const key = match[1]
    if (!result.find(p => p.key === key)) {
      result.push({
        key,
        ...paramsDef[key]
      })
    }
  }
  return result
}

// 替换命令中的占位符
const replacePlaceholders = (cmdText, values) => {
  return cmdText.replace(/%\{([^}]+)\}%/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match
  })
}

const pendingCopyIndex = ref(-1)
const pendingCommandText = ref('')

// 将 params 数组转换为对象格式
const normalizeParams = (params) => {
  if (!params) return {}
  if (!Array.isArray(params)) return params
  const paramsObj = {}
  params.forEach(p => {
    paramsObj[p.name || p.key] = {
      type: p.type || 'string',
      required: p.required !== undefined ? p.required : true,
      description: p.description || '',
      example: p.example || '',
      notes: p.notes || ''
    }
  })
  return paramsObj
}

const copyCommand = async (cmd = null, index = -1) => {
  const target = cmd || selectedCommand.value
  if (!target) return

  let textToCopy, paramsDef
  if (index === -1) {
    textToCopy = target.data?.cmd || ''
    paramsDef = normalizeParams(target.data?.params)
  } else {
    textToCopy = target.data?.extensions?.[index]?.cmd || ''
    paramsDef = normalizeParams(target.data?.extensions?.[index]?.params)
  }

  const placeholders = extractPlaceholders(textToCopy, paramsDef)
  if (placeholders.length > 0) {
    pendingCopyIndex.value = index
    pendingCommandText.value = textToCopy
    placeholderParams.value = placeholders
    // 使用 reactive 对象存储值
    const initialValues = {}
    placeholders.forEach(p => {
      initialValues[p.key] = ''
    })
    placeholderValues.value = initialValues
    showPlaceholderModal.value = true
    return
  }

  await doCopy(textToCopy, index)
}

const doCopy = async (textToCopy, index) => {
  try {
    await navigator.clipboard.writeText(textToCopy)
    isCopied.value = true
    copiedIndex.value = index
    showToast.value = true

    if (searchQuery.value) {
      addToSearchHistory(searchQuery.value)
    }

    setTimeout(() => {
      isCopied.value = false
      copiedIndex.value = -2
    }, 2000)

    setTimeout(() => {
      showToast.value = false
    }, 2500)
  } catch (error) {}
}

const confirmPlaceholderCopy = async (valuesFromModal = null) => {
  const target = selectedCommand.value
  if (!target) return

  // 使用传入的值（来自弹窗的 localValues）或 fallback 到 placeholderValues
  const valuesToUse = valuesFromModal || placeholderValues.value

  // 使用 pendingCommandText 中保存的原始命令文本
  const textToCopy = pendingCommandText.value

  const finalText = replacePlaceholders(textToCopy, valuesToUse)
  showPlaceholderModal.value = false

  await doCopy(finalText, pendingCopyIndex.value)
  pendingCopyIndex.value = -1
  pendingCommandText.value = ''
}

const fillExample = (key) => {
  const param = placeholderParams.value.find(p => p.key === key)
  if (param?.example) {
    // 创建新对象触发响应式更新
    placeholderValues.value = {
      ...placeholderValues.value,
      [key]: param.example
    }
  }
}

const fillAllExamples = () => {
  const newValues = { ...placeholderValues.value }
  placeholderParams.value.forEach(param => {
    if (param.example) {
      newValues[param.key] = param.example
    }
  })
  placeholderValues.value = newValues
}

// 命令面板搜索结果
const paletteResults = computed(() => {
  if (!paletteQuery.value) {
    return recentCommands.value.slice(0, 8)
  }
  if (dataManager.searchIndex) {
    return dataManager.search(paletteQuery.value, { limit: 10 }).slice(0, 10)
  }
  const queries = paletteQuery.value.toLowerCase().split(/\s+/).filter(q => q)
  return commands.value
    .filter(cmd => {
      if (!cmd.data || !cmd.data.cmd) return false
      const searchText = (cmd.name + ' ' + (cmd.keyword || '')).toLowerCase()
      return queries.every(q => searchText.includes(q))
    })
    .slice(0, 10)
})

const openPalette = () => {
  showPalette.value = true
  paletteQuery.value = ''
  paletteSelectedIndex.value = 0
}

const movePaletteSelection = (dir) => {
  const max = paletteResults.value.length - 1
  paletteSelectedIndex.value = Math.max(0, Math.min(max, paletteSelectedIndex.value + dir))
}

const selectPaletteItem = (cmd) => {
  showPalette.value = false
  selectCommand(cmd)
  setTimeout(() => {
    const el = document.querySelector('.command-item.active')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 100)
}

const executePaletteSelection = () => {
  const cmd = paletteResults.value[paletteSelectedIndex.value]
  if (cmd) {
    selectPaletteItem(cmd)
    copyCommand()
  }
}

// 悬浮复制按钮处理
const handleInlineCopy = (cmd) => {
  // 直接复制，不等待选中状态更新
  copyCommand(cmd)
}

const addToRecent = (cmd) => {
  const recent = recentCommands.value.filter(c => c.id !== cmd.id)
  recent.unshift(cmd)
  recentCommands.value = recent.slice(0, 20)
  scheduleSave('recentCommands')
}

const loadRecentCommands = () => {
  try {
    const saved = localStorage.getItem('recentCommands')
    if (saved) {
      recentCommands.value = JSON.parse(saved)
    }
  } catch (e) {}
}

const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('favoriteCommands')
    if (saved) {
      favoritesRaw.value = JSON.parse(saved)
    }
  } catch (e) {}
}

const loadLayoutState = () => {
  try {
    const saved = localStorage.getItem('layoutState')
    if (saved) {
      const state = JSON.parse(saved)
      sidebarCollapsed.value = state.sidebarCollapsed || false
      if (state.expandedFolders?.length) {
        state.expandedFolders.forEach(id => expandedFolders.value.add(id))
      }
    }
  } catch (e) {}
}

const saveLayoutState = () => {
  scheduleSave('layoutState')
}

const toggleFavorite = (cmd) => {
  const idx = favoritesRaw.value.findIndex(c => c.id === cmd.id)
  if (idx >= 0) {
    favoritesRaw.value.splice(idx, 1)
  } else {
    favoritesRaw.value.unshift(cmd)
  }
  scheduleSave('favorites')
}

const showPreview = (cmd, event) => {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(() => {
    previewCommand.value = cmd
    if (!event?.target) return
    const rect = event.target.getBoundingClientRect()
    previewPosition.value = {
      x: rect.right + 10,
      y: rect.top
    }
  }, 200)
}

const hidePreview = () => {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(() => {
    previewCommand.value = null
  }, 200)
}

const expandAll = () => {
  const allIds = new Set()
  const collectIds = (nodes) => {
    nodes.forEach(node => {
      allIds.add(node.id)
      if (node.children?.length) collectIds(node.children)
    })
  }
  collectIds(tree.value)
  expandedFolders.value = allIds
}

const collapseAll = () => {
  expandedFolders.value = new Set()
}

const navigateUp = () => {
  const flat = allFlatCommands.value
  if (flat.length === 0) return
  const currentIdx = flat.findIndex(c => c.id === keyboardSelectedId.value)
  if (currentIdx <= 0) {
    keyboardSelectedId.value = flat[0].id
  } else {
    keyboardSelectedId.value = flat[currentIdx - 1].id
  }
  scrollToKeyboardSelection()
}

const navigateDown = () => {
  const flat = allFlatCommands.value
  if (flat.length === 0) return
  const currentIdx = flat.findIndex(c => c.id === keyboardSelectedId.value)
  if (currentIdx >= flat.length - 1 || currentIdx < 0) {
    keyboardSelectedId.value = flat[flat.length - 1].id
  } else {
    keyboardSelectedId.value = flat[currentIdx + 1].id
  }
  scrollToKeyboardSelection()
}

const scrollToKeyboardSelection = () => {
  setTimeout(() => {
    const el = document.querySelector('.command-item.keyboard-selected')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 50)
}

const keyboardSelectAndCopy = () => {
  const cmd = allFlatCommands.value.find(c => c.id === keyboardSelectedId.value)
  if (cmd) {
    selectCommand(cmd)
    copyCommand(cmd)
  }
}

// 键盘快捷键
let gTimeout = null
let lastKeySequence = []
const KEY_SEQUENCE_TIMEOUT = 1000
let touchStartX = 0
let touchStartY = 0
const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
const handleTouchMove = (e) => {
  if (!touchStartX) return
  const deltaX = e.touches[0].clientX - touchStartX
  const deltaY = e.touches[0].clientY - touchStartY
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0 && sidebarCollapsed.value) {
      sidebarCollapsed.value = false
      saveLayoutState()
    } else if (deltaX < 0 && !sidebarCollapsed.value) {
      sidebarCollapsed.value = true
      saveLayoutState()
    }
    touchStartX = 0
  }
}

const handleKeydown = (e) => {
  if (showPalette.value) return

  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openPalette()
    return
  }

  if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused && selectedCommand.value) {
      e.preventDefault()
      copyCommand(selectedCommand.value)
      return
    }
  }

  if (e.key === 'g' || e.key === 'G') {
    if (gTimeout) clearTimeout(gTimeout)
    lastKeySequence.push('g')
    gTimeout = setTimeout(() => {
      lastKeySequence = []
      gTimeout = null
    }, KEY_SEQUENCE_TIMEOUT)
    return
  }

  if (lastKeySequence.includes('g') && (e.key === 'h' || e.key === 'H')) {
    e.preventDefault()
    overviewCollapsed.value = false
    selectedModule.value = 'all'
    lastKeySequence = []
    return
  }

  if (lastKeySequence.includes('g') && (e.key === 'f' || e.key === 'F')) {
    e.preventDefault()
    showFavoritesOnly.value = true
    if (favorites.value.length > 0) {
      selectedCommand.value = favorites.value[0]
    }
    lastKeySequence = []
    return
  }

  if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      showShortcutsHelp.value = !showShortcutsHelp.value
      return
    }
  }

  if (e.key === '\\' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      toggleOverview()
      return
    }
  }

  if (e.key === 'b' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      sidebarCollapsed.value = !sidebarCollapsed.value
      return
    }
  }

  if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey && !lastKeySequence.includes('g')) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      showFavoritesOnly.value = !showFavoritesOnly.value
      return
    }
  }

  if (e.key === 'e' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      expandAll()
      return
    }
  }

  if (e.key === 'a' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      collapseAll()
      return
    }
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    navigateUp()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    navigateDown()
    return
  }

  if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused && keyboardSelectedId.value) {
      e.preventDefault()
      keyboardSelectAndCopy()
      return
    }
  }

  if (e.key === 'Enter') {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused && keyboardSelectedId.value) {
      e.preventDefault()
      const cmd = allFlatCommands.value.find(c => c.id === keyboardSelectedId.value)
      if (cmd) selectCommand(cmd)
      return
    }
  }

  if (e.key === 'Escape') {
    keyboardSelectedId.value = null
    showShortcutsHelp.value = false
  }
}

onMounted(() => {
  loadCommands()
  loadRecentCommands()
  loadFavorites()
  loadLayoutState()
  loadSearchHistory()
  loadTheme()
  checkMobile()
  window.addEventListener('resize', checkMobile)
  resizeObserver = new ResizeObserver(() => {
    checkMobile()
  })
  resizeObserver.observe(document.documentElement)
  window.addEventListener('orientationchange', () => {
    setTimeout(checkMobile, 100)
  })
  document.addEventListener('keydown', handleKeydown)

  const commandTreeEl = document.querySelector('.command-tree')
  if (commandTreeEl) {
    let scrollThreshold = 5
    commandTreeEl.addEventListener('wheel', (e) => {
      if (e.deltaY > 0 && !overviewCollapsed.value && scrollThreshold > 0) {
        scrollThreshold--
        setTimeout(() => { scrollThreshold = 5 }, 100)
        if (scrollThreshold === 0) {
          overviewCollapsed.value = true
          saveLayoutState()
        }
      }
    }, { passive: true })
  }

  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })

  if ('serviceWorker' in navigator) {
    const basePath = getBasePath()
    navigator.serviceWorker.register(`${basePath}service-worker.js`).catch(() => {})
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('orientationchange', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (gTimeout) {
    clearTimeout(gTimeout)
    gTimeout = null
  }
})
</script>

<style>
/* Google Fonts - 思源黑体 + JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* CSS Variables - 默认深色主题 */
:root {
  --bg-primary: #0c0c0f;
  --bg-secondary: #141419;
  --bg-tertiary: #1a1a21;
  --bg-hover: #22222b;
  --bg-active: #28282f;

  --accent-primary: #f59e0b;
  --accent-secondary: #fbbf24;
  --accent-glow: rgba(245, 158, 11, 0.15);

  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  --border-color: #27272a;
  --border-hover: #3f3f46;

  --sidebar-width: 320px;
  --sidebar-collapsed-width: 56px;

  --font-ui: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px var(--accent-glow);
}

/* 亮色主题 */
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e5e5e5;
  --bg-hover: #e0e0e0;
  --bg-active: #d0d0d0;

  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;

  --border-color: #e0e0e0;
  --border-hover: #c0c0c0;
}

/* 主题过渡动画 */
:root, [data-theme="light"] {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>

<style scoped>
.command-app {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  font-family: var(--font-ui);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

.command-app::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 10000;
}

.content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
  position: relative;
}

.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* 搜索结果高亮 */
.highlight {
  background: rgba(245, 158, 11, 0.3);
  border-radius: 2px;
  padding: 0 2px;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .mobile-overlay {
    display: block;
  }

  .mobile-bottom-nav {
    display: flex;
  }

  .content {
    padding-bottom: 76px;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 85vw;
  }

  .mobile-sidebar-open .sidebar {
    transform: translateX(0);
    width: var(--sidebar-width) !important;
    min-width: var(--sidebar-width) !important;
  }

  .mobile-sidebar-open .sidebar.collapsed {
    width: var(--sidebar-width) !important;
    min-width: var(--sidebar-width) !important;
  }

  .command-detail {
    padding: 24px;
  }

  .detail-title {
    font-size: 24px;
  }
}
</style>
