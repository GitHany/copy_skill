<template>
  <div class="folder-node">
    <!-- 主文件夹头部 -->
    <div
      class="folder-header"
      :class="{ active: expanded, 'has-commands': folder.commands.length > 0 }"
      @click="$emit('toggle', folder.id)"
    >
      <div class="folder-left">
        <span class="folder-arrow" :class="{ expanded }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
        <span class="folder-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path v-if="expanded" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            <path v-else d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </span>
        <span class="folder-name">{{ folder.name }}</span>
      </div>
      <span class="folder-count">{{ folder.commands.length }}</span>
    </div>

    <!-- 文件夹内容 -->
    <Transition name="folder-content">
      <div v-show="expanded" class="folder-commands">
        <!-- 命令列表 -->
        <div
          v-for="cmd in folder.commands"
          :key="cmd.id"
          class="command-item"
          :class="{ active: selectedId === cmd.id, 'keyboard-selected': keyboardSelectedId === cmd.id }"
          @click="$emit('select', cmd)"
          @mouseenter="(evt) => $emit('hover', cmd, evt)"
          @mouseleave="$emit('leave')"
        >
          <span class="command-indicator"></span>
          <div class="command-info">
            <span class="command-name" v-html="highlightText(cmd.name, searchQuery)"></span>
            <span v-if="cmd.description" class="command-desc" v-html="highlightText(cmd.description, searchQuery)"></span>
          </div>
          <button
            class="inline-copy-btn"
            title="复制命令"
            @click.stop="$emit('copy', cmd)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>

        <!-- 子文件夹递归 -->
        <template v-for="child in folder.children" :key="child.id">
          <FolderNode
            :folder="child"
            :expanded="expandedFolders.has(child.id)"
            :selected-id="selectedId"
            :keyboard-selected-id="keyboardSelectedId"
            :search-query="searchQuery"
            :expanded-folders="expandedFolders"
            @toggle="$emit('toggle', $event)"
          />
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { highlightText } from '../utils.js'
import FolderNode from './FolderNode.vue'

defineProps({
  folder: {
    type: Object,
    required: true
  },
  expanded: {
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
  },
  expandedFolders: {
    type: Object,
    default: () => new Set()
  }
})

defineEmits(['toggle', 'select', 'hover', 'leave', 'copy'])
</script>

<style scoped>
.folder-node {
  margin-bottom: 4px;
}

.folder-header {
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 120ms ease-out;
  user-select: none;
}

.folder-header:hover {
  background: var(--bg-hover);
}

.folder-header.active {
  background: var(--bg-active);
}

.folder-left {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.folder-arrow {
  color: var(--text-muted);
  transition: transform 0.2s;
  display: flex;
}

.folder-arrow.expanded {
  transform: rotate(90deg);
}

.folder-icon {
  color: var(--accent-primary);
  display: flex;
}

.folder-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.folder-header:hover .folder-name,
.folder-header.active .folder-name {
  color: var(--text-primary);
}

.folder-count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 24px;
  text-align: center;
}

.folder-commands {
  padding-left: 20px;
}

.command-item {
  padding: 8px 16px 8px 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 100ms ease-out;
  position: relative;
  /* 移除 content-visibility，它可能导致渲染问题 */
}

.command-item:hover {
  background: var(--bg-hover);
}

.command-item.active {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
}

.command-item.keyboard-selected {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.command-indicator {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border: 1px solid var(--text-muted);
  border-radius: 50%;
  transition: border-color 120ms ease-out, background-color 120ms ease-out, box-shadow 120ms ease-out;
}

.command-item:hover .command-indicator {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-glow);
}

.command-item.active .command-indicator {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-glow);
}

.command-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.command-name {
  flex: none;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s;
}

.command-desc {
  flex: 1;
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.command-item:hover .command-name,
.command-item.active .command-name {
  color: var(--text-primary);
}

/* 悬浮复制按钮 */
.inline-copy-btn {
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

.command-item:hover .inline-copy-btn {
  opacity: 1;
  transform: translateY(-50%) scale(1);
  pointer-events: auto;
}

.inline-copy-btn:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #0c0c0f;
}

.inline-copy-btn:active {
  transform: translateY(-50%) scale(0.9);
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
