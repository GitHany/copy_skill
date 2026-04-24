<template>
  <div v-if="modules.length > 1" class="module-overview-header">
    <div class="overview-title-area" @click="$emit('toggle-overview')">
      <div class="overview-left">
        <h3 class="overview-main-title">📚 模块概览</h3>
        <span class="overview-subtitle">{{ totalCommands }} 个命令 · {{ filteredModules.length }} 个模块</span>
      </div>
      <button class="overview-toggle" :class="{ collapsed: collapsed }" title="折叠/展开模块概览">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </div>

    <!-- 分类标签导航（模块 > 6 个时显示） -->
    <div v-show="!collapsed && modules.length > 7" class="category-tabs">
      <div class="tabs-scroll">
        <button
          v-for="cat in categoryTabs"
          :key="cat.id"
          class="category-tab"
          :class="{ active: selectedCategory === cat.id }"
          @click="$emit('select-category', cat.id)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- 模块卡片网格 -->
    <div v-show="!collapsed" class="overview-cards">
      <div
        v-for="mod in filteredModules"
        :key="mod.id"
        class="overview-card"
        :class="{ active: selectedModule === mod.id }"
        @click="$emit('select-module', mod.id)"
      >
        <div class="overview-card-icon">{{ mod.icon }}</div>
        <div class="overview-card-info">
          <h4 class="overview-card-title">{{ mod.name }}</h4>
          <p class="overview-card-count">{{ mod.count }} 个命令</p>
        </div>
        <!-- 模块描述 Tooltip -->
        <div class="card-tooltip">
          <div class="tooltip-title">{{ mod.name }}</div>
          <div class="tooltip-desc">包含 {{ mod.count }} 个命令</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modules: {
    type: Array,
    default: () => []
  },
  categoryTabs: {
    type: Array,
    default: () => []
  },
  filteredModules: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: 'all'
  },
  selectedModule: {
    type: String,
    default: 'all'
  },
  totalCommands: {
    type: Number,
    default: 0
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-overview', 'select-category', 'select-module'])
</script>

<style scoped>
.module-overview-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.overview-title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
  padding: 8px 12px;
  margin: -8px -12px 16px -12px;
  border-radius: 8px;
  transition: background-color 150ms ease-out;
}

.overview-title-area:hover {
  background: var(--bg-hover);
}

.overview-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.overview-main-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
}

.overview-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  white-space: nowrap;
}

.overview-toggle {
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
  transition: all 150ms ease-out;
}

.overview-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.overview-toggle:active {
  transform: scale(0.95);
}

.overview-toggle svg {
  transition: transform 200ms ease-out;
}

.overview-toggle.collapsed svg {
  transform: rotate(180deg);
}

.category-tabs {
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.category-tabs .tabs-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-tabs .tabs-scroll::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex-shrink: 0;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-ui);
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all 150ms ease-out;
}

.category-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.category-tab:active {
  transform: scale(0.95);
}

.category-tab.active {
  background: var(--accent-primary);
  color: #0c0c0f;
  border-color: var(--accent-primary);
  font-weight: 600;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms ease-out;
  position: relative;
}

.overview-card:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.overview-card .card-tooltip {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 8px;
  z-index: 1000;
  min-width: 200px;
  max-width: 300px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
}

.overview-card .tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.overview-card .tooltip-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.overview-card:hover .card-tooltip {
  display: block;
}

.overview-card:active {
  transform: scale(0.97) translateY(-1px);
}

.overview-card.active {
  background: var(--accent-primary);
  color: #0c0c0f;
  border-color: var(--accent-primary);
  box-shadow: 0 0 16px var(--accent-glow);
}

.overview-card-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.overview-card-info {
  flex: 1;
  min-width: 0;
}

.overview-card-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 3px 0;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overview-card-count {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  font-family: var(--font-mono);
}

.overview-card.active .overview-card-count {
  color: rgba(12, 12, 15, 0.8);
}
</style>
