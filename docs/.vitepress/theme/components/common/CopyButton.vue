<template>
  <button class="copy-btn" :class="{ copied: copied }" @click="$emit('click')">
    <Transition name="copy-icon" mode="out-in">
      <svg v-if="!copied" key="copy" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
      <svg v-else key="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </Transition>
    <span>{{ copied ? '已复制' : '复制' }}</span>
  </button>
</template>

<script setup>
defineProps({
  copied: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-ui);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
}

.copy-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.copy-btn:active {
  transform: scale(0.96);
}

.copy-btn.copied {
  background: var(--accent-primary);
  color: #0c0c0f;
  border-color: var(--accent-primary);
}

.copy-icon-enter-active,
.copy-icon-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.copy-icon-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.copy-icon-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
