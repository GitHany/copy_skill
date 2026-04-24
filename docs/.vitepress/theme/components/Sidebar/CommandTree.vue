<template>
  <FlatTree
    v-show="!collapsed"
    :tree="displayedTree"
    :expanded-folders="expandedFolders"
    :collapsed="collapsed"
    :selected-id="selectedCommandId"
    :keyboard-selected-id="keyboardSelectedId"
    :search-query="searchQuery"
    @toggle-folder="$emit('toggle-folder', $event)"
    @select-command="$emit('select-command', $event)"
    @hover-command="(cmd, evt) => $emit('hover-command', cmd, evt)"
    @leave-command="$emit('leave-command')"
    @expand-sidebar="$emit('expand-sidebar')"
    @copy-command="$emit('copy-command', $event)"
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
</template>

<script setup>
import FlatTree from './FlatTree.vue'

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

defineEmits(['toggle-folder', 'select-command', 'hover-command', 'leave-command', 'expand-sidebar', 'copy-command'])
</script>

<style scoped>
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
