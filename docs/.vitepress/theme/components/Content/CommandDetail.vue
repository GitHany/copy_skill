<template>
  <div :key="command.id" class="command-detail">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="detail-breadcrumb">
        <span class="breadcrumb-item">{{ getBreadcrumb(command) }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <span class="breadcrumb-item active">{{ command.name }}</span>
      </div>
      <div class="detail-title-row">
        <h2 class="detail-title">{{ command.name }}</h2>
        <button
          class="favorite-btn"
          :class="{ favorited: isFavorited }"
          :title="isFavorited ? '取消收藏' : '添加收藏'"
          @click="$emit('toggle-favorite', command)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 描述 -->
    <div v-if="command.description" class="detail-section">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        描述
      </div>
      <div class="description-text">{{ command.description }}</div>
    </div>

    <!-- 命令内容 - 基础命令 + 扩展用法 -->
    <div class="detail-section command-section">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        命令内容
      </div>

      <!-- 基础命令 -->
      <div class="command-block main-cmd" :class="{ 'copied': copiedIndex === -1 }">
        <div class="command-glow"></div>
        <div class="cmd-label">基础</div>
        <pre class="command-code">{{ command.data?.cmd || '' }}</pre>
        <CopyButton :copied="copiedIndex === -1" @click="$emit('copy', command, -1)" />
      </div>

      <!-- 扩展用法 -->
      <div v-if="command.data?.extensions?.length" class="extensions-section">
        <div class="extensions-label">扩展用法</div>
        <div
          v-for="(ext, idx) in command.data.extensions"
          :key="idx"
          class="command-block extension-cmd"
          :class="{ 'copied': copiedIndex === idx }"
        >
          <div class="command-glow"></div>
          <div class="cmd-label">{{ ext.name }}</div>
          <pre class="command-code">{{ ext.cmd || '' }}</pre>
          <CopyButton :copied="copiedIndex === idx" @click="$emit('copy', command, idx)" />
        </div>
      </div>
    </div>

    <!-- 关键词 -->
    <div v-if="command.keyword" class="detail-section">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        关键词
      </div>
      <div class="keywords">
        <span
          v-for="kw in keywordList"
          :key="kw"
          class="keyword-tag"
          :class="{ active: activeKeyword === kw }"
          @click="$emit('keyword-click', kw)"
        >{{ kw }}</span>
      </div>
    </div>

    <!-- 路径 -->
    <div v-if="command.dirPath" class="detail-section">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
        </svg>
        路径
      </div>
      <div class="path-text">{{ command.dirPath }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CopyButton from '../common/CopyButton.vue'

const props = defineProps({
  command: {
    type: Object,
    required: true
  },
  isFavorited: {
    type: Boolean,
    default: false
  },
  copiedIndex: {
    type: Number,
    default: -2
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['toggle-favorite', 'copy', 'keyword-click'])

const keywordList = computed(() => {
  return (props.command.keyword || '').split(' ').filter(k => k)
})

const activeKeyword = computed(() => props.searchQuery)

const getBreadcrumb = (cmd) => {
  const path = (cmd.dirPath || '/未分类/').replace(/^\/|\/$/g, '').split('/')
  return path[0] || '未分类'
}
</script>

<style scoped>
.command-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 48px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  margin-bottom: 32px;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-title {
  flex: 1;
}

.favorite-btn {
  padding: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-muted);
  cursor: pointer;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.favorite-btn:active {
  transform: scale(0.94);
}

.favorite-btn.favorited {
  color: var(--accent-primary);
  background: var(--accent-glow);
  border-color: var(--accent-primary);
}

.detail-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.breadcrumb-item {
  color: var(--text-muted);
  transition: color 0.15s;
}

.breadcrumb-item:hover {
  color: var(--text-secondary);
  cursor: pointer;
}

.breadcrumb-item.active {
  color: var(--accent-primary);
}

.breadcrumb-item svg {
  color: var(--text-muted);
}

.detail-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-section {
  margin-bottom: 28px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.section-label svg {
  color: var(--accent-primary);
}

.description-text {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.command-section .command-block {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.command-section .command-block:hover {
  border-color: var(--border-hover);
}

.command-section .command-block.copied {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow);
}

.command-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.command-section .command-block:hover .command-glow,
.command-section .command-block.copied .command-glow {
  opacity: 1;
}

.command-code {
  margin: 0;
  padding: 20px 24px;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.command-code::before {
  content: '';
  display: block;
  height: 1px;
  background: linear-gradient(90deg, var(--accent-primary), transparent);
  margin: -20px -24px 20px;
  padding: 0 24px;
  opacity: 0.3;
}

.extensions-section {
  margin-top: 16px;
}

.extensions-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
  padding-left: 4px;
}

.extension-cmd {
  margin-bottom: 10px;
}

.extension-cmd:last-child {
  margin-bottom: 0;
}

.cmd-label {
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-primary);
  background: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.main-cmd .command-code {
  padding-top: 52px;
}

.extension-cmd .command-code {
  padding-top: 52px;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
}

.keyword-tag:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.keyword-tag:active {
  transform: scale(0.96);
}

.keyword-tag.active {
  background: var(--accent-primary);
  color: #0c0c0f;
  border-color: var(--accent-primary);
}

.path-text {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  word-break: break-all;
}
</style>
