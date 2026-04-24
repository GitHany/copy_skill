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

/* 移除动画以避免点击卡顿 */
.preview-enter-active,
.preview-leave-active {
  transition: none;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}
</style>
