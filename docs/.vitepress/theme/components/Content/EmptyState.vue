<template>
  <div class="no-selection">
    <div class="empty-state">
      <div class="empty-graphic">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 9h6M9 13h6M9 17h4"/>
        </svg>
      </div>
      <h3>选择一个命令开始</h3>
      <p>从左侧列表选择命令查看详情和复制</p>
    </div>
  </div>
</template>

<style scoped>
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100vh;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

.empty-graphic {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  opacity: 0.3;
}

.empty-graphic svg {
  stroke: var(--accent-primary);
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
