<template>
  <div v-show="!collapsed" ref="containerRef" class="flat-tree" @scroll="handleScroll">
    <!-- 虚拟滚动容器 -->
    <div class="virtual-spacer" :style="{ height: totalHeight + 'px' }">
      <div
        class="virtual-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <template v-for="item in visibleItems" :key="item.id">
          <!-- 文件夹 -->
          <div
            v-if="item.type === 'folder'"
            class="flat-folder"
            :class="{ expanded: item.isExpanded }"
            :style="{ paddingLeft: (item.depth * 16 + 20) + 'px' }"
            @click="$emit('toggle-folder', item.id)"
          >
            <span class="flat-folder-arrow" :class="{ expanded: item.isExpanded }">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
            <span class="flat-folder-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </span>
            <span class="flat-folder-name">{{ item.name }}</span>
            <span class="flat-folder-count">{{ item.commandCount }}</span>
          </div>

          <!-- 命令 -->
          <div
            v-else
            class="flat-command"
            :class="{ active: selectedId === item.id, 'keyboard-selected': keyboardSelectedId === item.id }"
            :style="{ paddingLeft: (item.depth * 16 + 52) + 'px' }"
            @click="$emit('select-command', item.cmd)"
            @mouseenter="(evt) => $emit('hover-command', item.cmd, evt)"
            @mouseleave="$emit('leave-command')"
          >
            <span class="flat-command-indicator"></span>
            <span class="flat-command-name" v-html="item.displayName"></span>
            <button
              class="flat-copy-btn"
              title="复制命令"
              @click.stop="$emit('copy-command', item.cmd)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="items.length === 0" class="flat-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
      </svg>
      <p>未找到匹配的命令</p>
    </div>

    <!-- 收起时的快捷导航 -->
    <div v-show="collapsed" class="flat-collapsed-nav">
      <button
        v-for="folder in topFolders.slice(0, 5)"
        :key="folder.id"
        class="nav-mini-item"
        :title="folder.name"
        @click="$emit('expand-sidebar')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { escapeHtml, highlightText } from '../utils.js'

const props = defineProps({
  tree: {
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
  selectedId: {
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
  }
})

defineEmits(['toggle-folder', 'select-command', 'hover-command', 'leave-command', 'expand-sidebar', 'copy-command'])

const FOLDER_HEIGHT = 40
const COMMAND_HEIGHT = 44
const BUFFER_COUNT = 10

const containerRef = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(400)

const topFolders = computed(() => {
  return props.tree.map(node => ({
    id: node.id,
    name: node.name,
    commandCount: node.commands.length
  }))
})

// 构建扁平化列表
const items = computed(() => {
  const result = []
  
  const traverse = (nodes, depth = 0) => {
    for (const node of nodes) {
      const isExpanded = props.expandedFolders.has(node.id)
      result.push({
        type: 'folder',
        id: node.id,
        name: node.name,
        depth,
        height: FOLDER_HEIGHT,
        isExpanded,
        commandCount: node.commands.length
      })
      
      if (isExpanded) {
        for (const cmd of node.commands) {
          result.push({
            type: 'command',
            id: cmd.id,
            cmd,
            depth: depth + 1,
            height: COMMAND_HEIGHT,
            displayName: highlightText(cmd.name, props.searchQuery)
          })
        }
        
        if (node.children?.length) {
          traverse(node.children, depth + 1)
        }
      }
    }
  }
  
  traverse(props.tree)
  return result
})

// 计算总高度
const totalHeight = computed(() => {
  let sum = 0
  for (const item of items.value) {
    sum += item.height
  }
  return sum
})

// 计算可见项
const visibleItems = computed(() => {
  const viewTop = scrollTop.value
  const viewBottom = viewTop + containerHeight.value
  
  let accumulatedHeight = 0
  let startIndex = 0
  let endIndex = items.value.length
  
  // 找到起始索引
  for (let i = 0; i < items.value.length; i++) {
    const itemBottom = accumulatedHeight + items.value[i].height
    if (itemBottom >= viewTop) {
      startIndex = Math.max(0, i - BUFFER_COUNT)
      break
    }
    accumulatedHeight = itemBottom
  }
  
  // 找到结束索引
  accumulatedHeight = 0
  for (let i = 0; i < items.value.length; i++) {
    accumulatedHeight += items.value[i].height
    if (accumulatedHeight >= viewBottom) {
      endIndex = Math.min(items.value.length, i + BUFFER_COUNT + 1)
      break
    }
  }
  
  return items.value.slice(startIndex, endIndex)
})

// 计算偏移量
const offsetY = computed(() => {
  let sum = 0
  const startIndex = items.value.findIndex(item => {
    let h = 0
    for (const it of items.value) {
      if (it === item) break
      h += it.height
    }
    const itemBottom = h + item.height
    return itemBottom >= scrollTop.value
  })
  
  if (startIndex <= 0) return 0
  
  for (let i = 0; i < startIndex && i < items.value.length; i++) {
    sum += items.value[i].height
  }
  return sum - (startIndex > 0 ? items.value[startIndex - 1]?.height || 0 : 0)
})

const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

let resizeObserver = null

onMounted(() => {
  updateContainerHeight()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateContainerHeight)
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.expandedFolders, () => {
  scrollTop.value = 0
}, { deep: true })
</script>

<style scoped>
.flat-tree {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.flat-tree::-webkit-scrollbar {
  width: 6px;
  scrollbar-width: thin;
}

.flat-tree::-webkit-scrollbar-track {
  background: transparent;
}

.flat-tree::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.flat-tree::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.virtual-spacer {
  position: relative;
}

.virtual-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.flat-folder {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 120ms ease-out;
  user-select: none;
}

.flat-folder:hover {
  background: var(--bg-hover);
}

.flat-folder-arrow {
  color: var(--text-muted);
  transition: transform 0.2s;
  display: flex;
}

.flat-folder-arrow.expanded {
  transform: rotate(90deg);
}

.flat-folder-icon {
  color: var(--accent-primary);
  display: flex;
}

.flat-folder-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flat-folder:hover .flat-folder-name {
  color: var(--text-primary);
}

.flat-folder-count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 12px;
}

.flat-command {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background-color 100ms ease-out;
  position: relative;
}

.flat-command:hover {
  background: var(--bg-hover);
}

.flat-command.active {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
}

.flat-command.keyboard-selected {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.flat-command-indicator {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border: 1px solid var(--text-muted);
  border-radius: 50%;
  transition: border-color 120ms ease-out, background-color 120ms ease-out, box-shadow 120ms ease-out;
}

.flat-command:hover .flat-command-indicator {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-glow);
}

.flat-command.active .flat-command-indicator {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-glow);
}

.flat-command-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s;
}

.flat-command:hover .flat-command-name,
.flat-command.active .flat-command-name {
  color: var(--text-primary);
}

/* 悬浮复制按钮 */
.flat-copy-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) scale(0.8);
  width: 28px;
  height: 28px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 150ms ease-out, transform 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
  pointer-events: none;
}

.flat-command:hover .flat-copy-btn {
  opacity: 1;
  transform: translateY(-50%) scale(1);
  pointer-events: auto;
}

.flat-copy-btn:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #0c0c0f;
}

.flat-copy-btn:active {
  transform: translateY(-50%) scale(0.9);
}

.flat-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.flat-empty svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.flat-empty p {
  font-size: 14px;
}

.flat-collapsed-nav {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.nav-mini-item {
  width: 36px;
  height: 36px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
}

.nav-mini-item:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.nav-mini-item:active {
  transform: scale(0.94);
}
</style>
