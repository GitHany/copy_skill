<template>
  <Transition name="palette">
    <div v-if="show" class="command-palette" @click.self="$emit('close')">
      <div class="palette-container">
        <div class="palette-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref="inputRef"
            :value="query"
            type="text"
            placeholder="搜索命令..."
            class="palette-input"
            @input="$emit('update:query', $event.target.value)"
            @keydown.escape="$emit('close')"
            @keydown.down.prevent="$emit('move-selection', 1)"
            @keydown.up.prevent="$emit('move-selection', -1)"
            @keydown.enter.prevent="$emit('execute')"
          />
          <kbd class="palette-kbd">ESC</kbd>
        </div>
        <div class="palette-results">
          <div
            v-for="(cmd, idx) in results"
            :key="cmd.id"
            class="palette-item"
            :class="{ selected: idx === selectedIndex }"
            @click="$emit('select', cmd)"
            @mouseenter="$emit('hover', idx)"
          >
            <div class="palette-item-info">
              <span class="palette-item-name" v-html="highlightText(cmd.name, query)"></span>
              <span class="palette-item-path" v-html="highlightText(cmd.dirPath || '', query)"></span>
            </div>
            <span class="palette-item-action">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 10 4 15 9 20"/>
                <path d="M20 4v7a4 4 0 01-4 4H4"/>
              </svg>
            </span>
          </div>
          <div v-if="results.length === 0" class="palette-empty">
            未找到匹配的命令
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { highlightText } from '../utils.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  query: {
    type: String,
    default: ''
  },
  results: {
    type: Array,
    default: () => []
  },
  selectedIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'update:query', 'move-selection', 'execute', 'select', 'hover'])

const inputRef = ref(null)

watch(() => props.show, (val) => {
  if (val) {
    setTimeout(() => inputRef.value?.focus(), 50)
  }
})

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<style scoped>
.command-palette {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.palette-container {
  width: 90%;
  max-width: 560px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.palette-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.palette-header svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 16px;
  font-family: var(--font-ui);
  color: var(--text-primary);
  outline: none;
}

.palette-input::placeholder {
  color: var(--text-muted);
}

.palette-kbd {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.palette-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms ease-out;
}

.palette-item:hover,
.palette-item.selected {
  background: var(--bg-hover);
}

.palette-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.palette-item-name {
  font-size: 14px;
  color: var(--text-primary);
}

.palette-item-path {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-item-action {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 12px;
}

.palette-empty {
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}
</style>
