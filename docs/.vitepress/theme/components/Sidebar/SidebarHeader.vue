<template>
  <div class="sidebar-header">
    <div class="logo-area">
      <div class="logo-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 17l6-6-6-6M12 19h8"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-title">Copy Skill</span>
        <span class="logo-subtitle">{{ commandCount }} 条命令</span>
      </div>
    </div>
    <button class="collapse-btn" :title="collapsed ? '展开侧边栏' : '收起侧边栏'" @click="$emit('collapse')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path v-if="!isMobile && !collapsed" d="M15 18l-6-6 6-6"/>
        <path v-else d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  commandCount: {
    type: Number,
    default: 0
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['collapse'])
</script>

<style scoped>
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.logo-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0c0c0f;
  box-shadow: var(--shadow-glow);
}

.logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.logo-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.collapse-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
}

.collapse-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.collapse-btn:active {
  transform: scale(0.94);
}
</style>
