<template>
  <Teleport to="body">
    <Transition name="preview">
      <div
        v-if="command"
        class="command-preview"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
      >
        <div class="preview-header">
          <span class="preview-name">{{ command.name }}</span>
        </div>
        <pre class="preview-code">{{ command.data?.cmd || '' }}</pre>
        <div class="preview-actions">
          <button class="preview-copy" @click="$emit('copy', command)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            复制
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  command: {
    type: Object,
    default: null
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

defineEmits(['copy'])
</script>

<style scoped>
.command-preview {
  position: fixed;
  z-index: 10000;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  pointer-events: auto;
}

.preview-header {
  margin-bottom: 12px;
}

.preview-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-code {
  margin: 0;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

.preview-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.preview-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.preview-copy:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #0c0c0f;
}

.preview-enter-active,
.preview-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
</style>
