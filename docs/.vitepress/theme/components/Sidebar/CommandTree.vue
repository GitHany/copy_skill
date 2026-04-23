<template>
  <div v-show="!collapsed" class="command-tree">
    <div v-if="displayedTree.length === 0" class="tree-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
      </svg>
      <p>未找到匹配的命令</p>
    </div>

    <FolderNode
      v-for="folder in displayedTree"
      :key="folder.id"
      :folder="folder"
      :expanded="expandedFolders.has(folder.id)"
      :selected-id="selectedCommandId"
      :keyboard-selected-id="keyboardSelectedId"
      :search-query="searchQuery"
      :expanded-folders="expandedFolders"
      @toggle="$emit('toggle-folder', $event)"
      @select="$emit('select-command', $event)"
      @hover="(cmd, evt) => $emit('hover-command', cmd, evt)"
      @leave="$emit('leave-command')"
    />

    <!-- 收起时的快捷导航 -->
    <div v-show="collapsed" class="sidebar-collapsed-nav">
      <button
        v-for="folder in displayedTree.slice(0, 5)"
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
import FolderNode from './FolderNode.vue'

defineProps({
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
  }
})

defineEmits(['toggle-folder', 'select-command', 'hover-command', 'leave-command', 'expand-sidebar'])
</script>

<style scoped>
.command-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.command-tree::-webkit-scrollbar {
  width: 6px;
  scrollbar-width: thin;
}

.command-tree::-webkit-scrollbar-track {
  background: transparent;
}

.command-tree::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.command-tree::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.tree-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.tree-empty svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.tree-empty p {
  font-size: 14px;
}

.sidebar-collapsed-nav {
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
