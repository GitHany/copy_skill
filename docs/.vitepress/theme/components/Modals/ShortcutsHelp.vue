<template>
  <Transition name="fade">
    <div v-if="show" class="shortcuts-help">
      <div class="shortcuts-header">
        <h3>⌨️ 键盘快捷键</h3>
        <button class="shortcuts-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="shortcuts-grid">
        <div class="shortcut-section">
          <h4>🧭 导航</h4>
          <div class="shortcut-item"><kbd>↑</kbd><kbd>↓</kbd> 上下导航</div>
          <div class="shortcut-item"><kbd>Enter</kbd> 选择命令</div>
          <div class="shortcut-item"><kbd>Esc</kbd> 清除选择</div>
        </div>
        <div class="shortcut-section">
          <h4>⚡ 操作</h4>
          <div class="shortcut-item"><kbd>C</kbd> 复制命令</div>
          <div class="shortcut-item"><kbd>⌘K</kbd> 打开命令面板</div>
          <div class="shortcut-item"><kbd>?</kbd> 显示帮助</div>
        </div>
        <div class="shortcut-section">
          <h4>🎛️ 界面</h4>
          <div class="shortcut-item"><kbd>B</kbd> 切换侧边栏</div>
          <div class="shortcut-item"><kbd>\</kbd> 折叠模块概览</div>
          <div class="shortcut-item"><kbd>F</kbd> 切换收藏过滤</div>
        </div>
        <div class="shortcut-section">
          <h4>📂 文件夹</h4>
          <div class="shortcut-item"><kbd>E</kbd> 展开全部</div>
          <div class="shortcut-item"><kbd>A</kbd> 折叠全部</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>

<style scoped>
.shortcuts-help {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-lg);
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.shortcuts-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.shortcuts-close {
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
  transition: all 150ms ease-out;
}

.shortcuts-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.shortcuts-close:active {
  transform: scale(0.95);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.shortcut-section h4 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-primary);
}

.shortcut-item kbd {
  padding: 3px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 28px;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
