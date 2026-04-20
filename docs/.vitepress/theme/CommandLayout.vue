<template>
  <div class="command-app" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile-sidebar-open': mobileSidebarOpen }">
    <!-- 移动端菜单按钮 -->
    <button class="mobile-menu-btn" @click="mobileSidebarOpen = true" v-show="!mobileSidebarOpen && isMobile">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <!-- 移动端遮罩层 -->
    <div class="mobile-overlay" v-show="mobileSidebarOpen" @click="mobileSidebarOpen = false"></div>

    <!-- 移动端底部导航栏 -->
    <nav class="mobile-bottom-nav" v-if="isMobile">
      <button class="nav-btn" @click="overviewCollapsed = !overviewCollapsed" :class="{ active: !overviewCollapsed }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>概览</span>
      </button>
      <button class="nav-btn" @click="showFavoritesOnly = !showFavoritesOnly" :class="{ active: showFavoritesOnly }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>收藏</span>
      </button>
      <button class="nav-btn" @click="searchInput?.focus()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>搜索</span>
      </button>
      <button class="nav-btn" @click="mobileSidebarOpen = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>菜单</span>
      </button>
    </nav>

    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- Logo 区域 -->
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 17l6-6-6-6M12 19h8"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">Copy Skill</span>
            <span class="logo-subtitle">{{ commands.length }} 条命令</span>
          </div>
        </div>
        <button class="collapse-btn" @click="isMobile ? (mobileSidebarOpen = false) : (sidebarCollapsed = !sidebarCollapsed)" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!isMobile && !sidebarCollapsed" d="M15 18l-6-6 6-6"/>
            <path v-else d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- 搜索 & 工具栏 -->
      <div class="search-area" v-show="!sidebarCollapsed">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索命令或关键词..."
            class="search-input"
            @focus="showSearchHistory = true"
            @blur="setTimeout(() => showSearchHistory = false, 200)"
            @keydown.enter="handleSearchEnter"
          />
          <button
            v-if="searchQuery"
            class="search-clear"
            @click="searchQuery = ''"
            title="清除搜索"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <kbd class="search-kbd" v-else>⌘K</kbd>

          <!-- 搜索历史下拉 -->
          <Transition name="dropdown">
            <div v-if="showSearchHistory && searchHistory.length > 0 && !searchQuery" class="search-history">
              <div class="search-history-header">
                <span>搜索历史</span>
                <button class="search-history-clear" @click="clearSearchHistory">清除</button>
              </div>
              <div class="search-history-list">
                <button
                  v-for="(item, index) in searchHistory"
                  :key="index"
                  class="search-history-item"
                  @click="searchQuery = item; showSearchHistory = false"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{{ item }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <div class="tree-toolbar">
          <button class="toolbar-btn" @click="expandAll" title="展开全部">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click="collapseAll" title="折叠全部">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <button
            class="toolbar-btn"
            :class="{ active: showFavoritesOnly }"
            @click="showFavoritesOnly = !showFavoritesOnly"
            title="只看收藏"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" :fill="showFavoritesOnly ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click="toggleTheme" :title="'主题: ' + themeMode">
            <svg v-if="themeMode === 'dark'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
            <svg v-else-if="themeMode === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click="exportData" title="导出配置">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref="importFileInput" 
            @change="handleImport" 
            style="display:none"
          />
          <button class="toolbar-btn" @click="importFileInput?.click()" title="导入配置">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 收藏分组 -->
      <div class="favorites-section" v-if="favorites.length > 0 && !sidebarCollapsed" v-show="!showFavoritesOnly || true">
        <div class="favorites-header" @click="showFavorites = !showFavorites">
          <span class="folder-arrow" :class="{ expanded: showFavorites }">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span class="folder-name">收藏 ({{ favorites.length }})</span>
        </div>
        <Transition name="folder-content">
          <div v-show="showFavorites" class="favorites-commands">
            <div
              v-for="cmd in favorites"
              :key="cmd.id"
              class="command-item favorite-item"
              :class="{ active: selectedCommand?.id === cmd.id }"
              @click="selectCommand(cmd)"
            >
              <span class="command-indicator"></span>
              <span class="command-name">{{ cmd.name }}</span>
              <button class="unfavorite-btn" @click.stop="toggleFavorite(cmd)" title="取消收藏">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 导航树 -->
      <div class="command-tree" v-show="!sidebarCollapsed">
        <div v-if="displayedTree.length === 0" class="tree-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
          </svg>
          <p>未找到匹配的命令</p>
        </div>

        <div v-for="folder in displayedTree" :key="folder.id" class="tree-folder">
          <div
            class="folder-header"
            @click="toggleFolder(folder.id)"
            :class="{ active: expandedFolders.has(folder.id), 'has-commands': folder.commands.length > 0 }"
          >
            <div class="folder-left">
              <span class="folder-arrow" :class="{ expanded: expandedFolders.has(folder.id) }">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </span>
              <span class="folder-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path v-if="expandedFolders.has(folder.id)" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  <path v-else d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
              </span>
              <span class="folder-name">{{ folder.name }}</span>
            </div>
            <span class="folder-count">{{ folder.commands.length }}</span>
          </div>

          <Transition name="folder-content">
            <div v-show="expandedFolders.has(folder.id)" class="folder-commands">
              <div
                v-for="(cmd, idx) in folder.commands"
                :key="cmd.id"
                class="command-item"
                :class="{ active: selectedCommand?.id === cmd.id, 'keyboard-selected': keyboardSelectedId === cmd.id }"
                :style="{ '--delay': `${idx * 30}ms` }"
                @click="selectCommand(cmd)"
                @mouseenter="showPreview(cmd, $event)"
                @mouseleave="hidePreview"
              >
                <span class="command-indicator"></span>
                <div class="command-info">
                  <span class="command-name">{{ cmd.name }}</span>
                  <span v-if="cmd.description" class="command-desc">{{ cmd.description }}</span>
                </div>
              </div>

              <!-- 递归渲染子文件夹 -->
              <template v-for="child in folder.children" :key="child.id">
                <div
                  class="folder-header child-folder"
                  @click="toggleFolder(child.id)"
                  :class="{ active: expandedFolders.has(child.id) }"
                >
                  <div class="folder-left">
                    <span class="folder-arrow" :class="{ expanded: expandedFolders.has(child.id) }">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </span>
                    <span class="folder-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                      </svg>
                    </span>
                    <span class="folder-name">{{ child.name }}</span>
                  </div>
                  <span class="folder-count">{{ child.commands.length }}</span>
                </div>
                <div v-show="expandedFolders.has(child.id)" class="folder-commands child-commands">
                  <div
                    v-for="(cmd, idx) in child.commands"
                    :key="cmd.id"
                    class="command-item"
                    :class="{ active: selectedCommand?.id === cmd.id }"
                    @click="selectCommand(cmd)"
                  >
                    <span class="command-indicator"></span>
                    <span class="command-name">{{ cmd.name }}</span>
                    <!-- 命令描述 Tooltip -->
                    <div v-if="cmd.description" class="command-tooltip">
                      <div class="tooltip-content">{{ cmd.description }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 收起时的快捷导航 -->
      <div class="sidebar-collapsed-nav" v-show="sidebarCollapsed">
        <button
          v-for="folder in displayedTree.slice(0, 5)"
          :key="folder.id"
          class="nav-mini-item"
          @click="sidebarCollapsed = false"
          :title="folder.name"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="content">
      <!-- 快捷键帮助面板 -->
      <Transition name="fade">
        <div v-if="showShortcutsHelp" class="shortcuts-help">
          <div class="shortcuts-header">
            <h3>⌨️ 键盘快捷键</h3>
            <button class="shortcuts-close" @click="showShortcutsHelp = false">
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

      <!-- 顶部模块概览 -->
      <div class="module-overview-header" v-if="modules.length > 1">
        <div class="overview-title-area" @click="toggleOverview">
          <div class="overview-left">
            <h3 class="overview-main-title">📚 模块概览</h3>
            <span class="overview-subtitle">{{ totalCommands }} 个命令 · {{ filteredModules.length }} 个模块</span>
          </div>
          <button class="overview-toggle" :class="{ collapsed: overviewCollapsed }" title="折叠/展开模块概览">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>

        <!-- 分类标签导航（模块 > 6 个时显示） -->
        <div class="category-tabs" v-show="!overviewCollapsed" v-if="modules.length > 7">
          <div class="tabs-scroll">
            <button
              v-for="cat in categoryTabs"
              :key="cat.id"
              class="category-tab"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectCategory(cat.id)"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- 模块卡片网格 -->
        <div class="overview-cards" v-show="!overviewCollapsed">
          <div
            v-for="mod in filteredModules"
            :key="mod.id"
            class="overview-card"
            :class="{ active: selectedModule === mod.id }"
            @click="selectModule(mod.id)"
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

      <div v-if="selectedCommand" class="command-detail">
        <!-- 头部 -->
        <div class="detail-header">
          <div class="detail-breadcrumb">
            <span class="breadcrumb-item">{{ selectedCommand.dirPath.replace(/^\/|\/$/g, '').split('/')[0] }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span class="breadcrumb-item active">{{ selectedCommand.name }}</span>
          </div>
          <div class="detail-title-row">
            <h2 class="detail-title">{{ selectedCommand.name }}</h2>
            <button
              class="favorite-btn"
              :class="{ favorited: favorites.some(c => c.id === selectedCommand?.id) }"
              @click="toggleFavorite(selectedCommand)"
              :title="favorites.some(c => c.id === selectedCommand?.id) ? '取消收藏' : '添加收藏'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="favorites.some(c => c.id === selectedCommand?.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 描述 -->
        <div class="detail-section" v-if="selectedCommand.description">
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
          <div class="description-text">{{ selectedCommand.description }}</div>
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
          <div class="command-block main-cmd" :class="{ 'copied': isCopied && copiedIndex === -1 }">
            <div class="command-glow"></div>
            <div class="cmd-label">基础</div>
            <pre class="command-code">{{ selectedCommand.data.cmd }}</pre>
            <button @click="copyCommand(null, -1)" class="copy-btn" :class="{ copied: isCopied && copiedIndex === -1 }">
              <Transition name="copy-icon" mode="out-in">
                <svg v-if="!(isCopied && copiedIndex === -1)" key="copy" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                <svg v-else key="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </Transition>
              <span>{{ (isCopied && copiedIndex === -1) ? '已复制' : '复制' }}</span>
            </button>
          </div>

          <!-- 扩展用法 -->
          <div v-if="selectedCommand.data.extensions?.length" class="extensions-section">
            <div class="extensions-label">扩展用法</div>
            <div
              v-for="(ext, idx) in selectedCommand.data.extensions"
              :key="idx"
              class="command-block extension-cmd"
              :class="{ 'copied': isCopied && copiedIndex === idx }"
            >
              <div class="command-glow"></div>
              <div class="cmd-label">{{ ext.name }}</div>
              <pre class="command-code">{{ ext.cmd }}</pre>
              <button @click="copyCommand(null, idx)" class="copy-btn" :class="{ copied: isCopied && copiedIndex === idx }">
                <Transition name="copy-icon" mode="out-in">
                  <svg v-if="!(isCopied && copiedIndex === idx)" key="copy" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  <svg v-else key="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </Transition>
                <span>{{ (isCopied && copiedIndex === idx) ? '已复制' : '复制' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 关键词 -->
        <div class="detail-section" v-if="selectedCommand.keyword">
          <div class="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            关键词
          </div>
          <div class="keywords">
            <span
              v-for="kw in selectedCommand.keyword.split(' ')"
              :key="kw"
              class="keyword-tag"
              :class="{ active: searchQuery === kw }"
              @click="searchQuery = searchQuery === kw ? '' : kw"
            >{{ kw }}</span>
          </div>
        </div>

        <!-- 路径 -->
        <div class="detail-section" v-if="selectedCommand.dirPath">
          <div class="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            路径
          </div>
          <div class="path-text">{{ selectedCommand.dirPath }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="no-selection">
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
    </main>

    <!-- 命令面板 ⌘K -->
    <Transition name="palette">
      <div v-if="showPalette" class="command-palette" @click.self="showPalette = false">
        <div class="palette-container">
          <div class="palette-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref="paletteInput"
              v-model="paletteQuery"
              type="text"
              placeholder="搜索命令..."
              class="palette-input"
              @keydown.escape="showPalette = false"
              @keydown.down.prevent="movePaletteSelection(1)"
              @keydown.up.prevent="movePaletteSelection(-1)"
              @keydown.enter.prevent="executePaletteSelection"
            />
            <kbd class="palette-kbd">ESC</kbd>
          </div>
          <div class="palette-results">
            <div
              v-for="(cmd, idx) in paletteResults"
              :key="cmd.id"
              class="palette-item"
              :class="{ selected: idx === paletteSelectedIndex }"
              @click="selectPaletteItem(cmd)"
              @mouseenter="paletteSelectedIndex = idx"
            >
              <div class="palette-item-info">
                <span class="palette-item-name">{{ cmd.name }}</span>
                <span class="palette-item-path">{{ cmd.dirPath }}</span>
              </div>
              <span class="palette-item-action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 10 4 15 9 20"/>
                  <path d="M20 4v7a4 4 0 01-4 4H4"/>
                </svg>
              </span>
            </div>
            <div v-if="paletteResults.length === 0" class="palette-empty">
              未找到匹配的命令
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Hover 预览 -->
    <Teleport to="body">
      <Transition name="preview">
        <div
          v-if="previewCommand"
          class="command-preview"
          :style="{ left: previewPosition.x + 'px', top: previewPosition.y + 'px' }"
        >
          <div class="preview-header">
            <span class="preview-name">{{ previewCommand.name }}</span>
          </div>
          <pre class="preview-code">{{ previewCommand.data.cmd }}</pre>
          <div class="preview-actions">
            <button class="preview-copy" @click="copyCommand(previewCommand); previewCommand = null">
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

    <!-- 复制成功 toast -->
    <Transition name="toast">
      <div v-if="showToast" class="copy-toast">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>命令已复制到剪贴板</span>
      </div>
    </Transition>

    <!-- 占位符输入弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPlaceholderModal" class="placeholder-modal-overlay" @click.self="showPlaceholderModal = false">
          <div class="placeholder-modal">
            <div class="modal-header">
              <h3>请输入参数</h3>
              <button class="modal-close" @click="showPlaceholderModal = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div v-for="(value, key) in placeholderValues" :key="key" class="placeholder-item">
                <label>{{ key }}</label>
                <input
                  v-model="placeholderValues[key]"
                  type="text"
                  :placeholder="'请输入 ' + key"
                  @keydown.enter="confirmPlaceholderCopy"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="showPlaceholderModal = false">取消</button>
              <button class="btn-confirm" @click="confirmPlaceholderCopy">复制</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const commands = ref([])
const tree = ref([])
const expandedFolders = ref(new Set())
const selectedCommand = ref(null)
const searchQuery = ref('')
const isCopied = ref(false)
const copiedIndex = ref(-1) // -1 = 主命令，其他 = extensions 索引
const showToast = ref(false)
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const isMobile = ref(false)

// 搜索历史
// 主题管理
const themeMode = ref('dark') // 'dark' | 'light' | 'auto'

const loadTheme = () => {
  try {
    const saved = localStorage.getItem('themeMode')
    if (saved) {
      themeMode.value = saved
    }
    applyTheme()
  } catch (e) {
    console.error('Failed to load theme:', e)
  }
}

const saveTheme = () => {
  try {
    localStorage.setItem('themeMode', themeMode.value)
  } catch (e) {
    console.error('Failed to save theme:', e)
  }
}

const applyTheme = () => {
  try {
    const root = document.documentElement
    let theme = themeMode.value
    if (theme === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    root.setAttribute('data-theme', theme)
    console.log('主题已切换为:', theme)
  } catch (e) {
    console.error('主题切换失败:', e)
  }
}

const toggleTheme = () => {
  const modes = ['dark', 'light', 'auto']
  const currentIndex = modes.indexOf(themeMode.value)
  themeMode.value = modes[(currentIndex + 1) % modes.length]
  applyTheme()
  saveTheme()
}

const searchHistory = ref([])
const showSearchHistory = ref(false)

const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load search history:', e)
  }
}

const saveSearchHistory = () => {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  } catch (e) {
    console.error('Failed to save search history:', e)
  }
}

const addToSearchHistory = (query) => {
  if (!query || query.trim().length === 0) return
  const trimmed = query.trim()
  // 移除已存在的相同项
  searchHistory.value = searchHistory.value.filter(h => h !== trimmed)
  // 添加到开头
  searchHistory.value.unshift(trimmed)
  // 只保留最近 10 条
  searchHistory.value = searchHistory.value.slice(0, 10)
  saveSearchHistory()
}

const clearSearchHistory = () => {
  searchHistory.value = []
  saveSearchHistory()
}

// 搜索防抖
let searchDebounceTimer = null

// 搜索时添加历史
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 0) {
    showSearchHistory.value = false
    
    // 清除之前的定时器
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    // 300ms 后执行搜索（已由 computed 自动处理）
  }
})

// 占位符输入
const showPlaceholderModal = ref(false)
const placeholderValues = ref({})

// 命令面板
const showPalette = ref(false)
const paletteQuery = ref('')
const paletteSelectedIndex = ref(0)
const paletteInput = ref(null)
const recentCommands = ref([])

// 快捷键帮助面板
const showShortcutsHelp = ref(false)

// 收藏夹
const favorites = ref([])
const showFavorites = ref(true)
const showFavoritesOnly = ref(false)

// 模块标签
const modules = ref([])
const selectedModule = ref('all')
const totalCommands = computed(() => commands.value.filter(cmd => cmd.data && cmd.data.cmd).length)

// 模块概览折叠状态
const overviewCollapsed = ref(false)

const toggleOverview = () => {
  overviewCollapsed.value = !overviewCollapsed.value
}

// 分类标签系统
const selectedCategory = ref('all')
const categoryTabs = ref([])
const filteredModules = computed(() => {
  const moduleList = modules.value.filter(m => m.id !== 'all')
  
  if (selectedCategory.value === 'all') {
    return moduleList
  }
  
  const category = categoryTabs.value.find(c => c.id === selectedCategory.value)
  if (!category) return moduleList
  
  return moduleList.filter(mod => {
    const firstChar = mod.name.charAt(0).toUpperCase()
    return category.ranges.some(range => {
      if (range.length === 1) {
        return firstChar === range[0]
      }
      return firstChar >= range[0] && firstChar <= range[1]
    })
  })
})

const generateCategoryTabs = () => {
  const moduleList = modules.value.filter(m => m.id !== 'all')
  
  // 按首字母分组
  const groups = {
    'A-E': { ranges: [['A'], ['B'], ['C'], ['D'], ['E']], modules: [] },
    'F-J': { ranges: [['F'], ['G'], ['H'], ['I'], ['J']], modules: [] },
    'K-O': { ranges: [['K'], ['L'], ['M'], ['N'], ['O']], modules: [] },
    'P-T': { ranges: [['P'], ['Q'], ['R'], ['S'], ['T']], modules: [] },
    'U-Z': { ranges: [['U'], ['V'], ['W'], ['X'], ['Y'], ['Z']], modules: [] }
  }
  
  // 统计每个分类的模块数
  moduleList.forEach(mod => {
    const firstChar = mod.name.charAt(0).toUpperCase()
    for (const [key, group] of Object.entries(groups)) {
      const inGroup = group.ranges.some(range => {
        if (range.length === 1) return firstChar === range[0]
        return firstChar >= range[0] && firstChar <= range[1]
      })
      if (inGroup) {
        group.modules.push(mod)
        break
      }
    }
  })
  
  // 只显示有模块的分类
  categoryTabs.value = [
    { id: 'all', label: `全部 (${moduleList.length})` },
    ...Object.entries(groups)
      .filter(([_, group]) => group.modules.length > 0)
      .map(([key, group]) => ({
        id: key,
        label: `${key} (${group.modules.length})`,
        ranges: group.ranges
      }))
  ]
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  // 如果当前选中的模块不在新分类中，则重置为全部
  if (categoryId !== 'all') {
    const category = categoryTabs.value.find(c => c.id === categoryId)
    if (category) {
      const inCategory = filteredModules.value.some(m => m.id === selectedModule.value)
      if (!inCategory) {
        selectedModule.value = 'all'
      }
    }
  }
}

const MODULE_ICONS = {
  'Claude Skills': '🤖',
  'Linux 命令': '🐧',
  'Git 命令': '🔀',
  '提示词': '💡',
  'GSD 工作流': '🔄',
  'default': '📁'
}

const extractModules = () => {
  const moduleMap = {}
  commands.value.forEach(cmd => {
    if (!cmd.data || !cmd.data.cmd) return
    const path = cmd.dirPath.replace(/^\/|\/$/g, '')
    if (!path) return
    const parts = path.split('/')
    const topModule = parts[0]
    if (!moduleMap[topModule]) {
      moduleMap[topModule] = { id: topModule, name: topModule, count: 0, icon: MODULE_ICONS[topModule] || MODULE_ICONS['default'] }
    }
    moduleMap[topModule].count++
  })
  modules.value = [
    { id: 'all', name: '全部', count: commands.value.filter(c => c.data && c.data.cmd).length, icon: '📋' },
    ...Object.values(moduleMap)
  ]
  generateCategoryTabs()
}

const selectModule = (moduleId) => {
  selectedModule.value = moduleId
  // 切换模块时清除搜索
  if (searchQuery.value) {
    searchQuery.value = ''
  }
}

// Hover 预览
const previewCommand = ref(null)
const previewPosition = ref({ x: 0, y: 0 })
let previewTimeout = null

// 键盘导航
const keyboardSelectedId = ref(null)
const allFlatCommands = computed(() => {
  const flat = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.commands) {
        node.commands.forEach(cmd => flat.push(cmd))
      }
      if (node.children) traverse(node.children)
    })
  }
  traverse(displayedTree.value)
  return flat
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

// 获取当前部署的基础路径
const getBasePath = () => {
  return import.meta.env.BASE_URL || '/'
}

const loadCommands = async () => {
  try {
    const basePath = getBasePath()
    const response = await fetch(`${basePath}commands.json`)
    const data = await response.json()
    commands.value = (data.data || []).map((item, index) => {
      // Generate unique ID if missing
      if (!item.id) {
        item.id = crypto.randomUUID ? crypto.randomUUID() : `cmd-${Date.now()}-${index}`
      }
      return item
    })
    buildTree()
    extractModules()

    if (commands.value.length > 0) {
      expandAllFolders(tree.value)
    }
  } catch (error) {
    console.error('加载命令数据失败:', error)
  }
}

const expandAllFolders = (nodes) => {
  nodes.forEach(node => {
    expandedFolders.value.add(node.id)
    if (node.children && node.children.length > 0) {
      expandAllFolders(node.children)
    }
  })
  expandedFolders.value = new Set(expandedFolders.value)
}

const buildTree = () => {
  const treeMap = {}

  commands.value.forEach(item => {
    // Skip folders (items without cmd)
    if (!item.data || !item.data.cmd) return

    const path = item.dirPath.replace(/^\/|\/$/g, '')
    if (!path) return

    const parts = path.split('/')
    let current = treeMap
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath += '/' + part

      if (!current[part]) {
        current[part] = {
          id: currentPath,
          name: part,
          commands: [],
          children: {}
        }
      }

      if (index === parts.length - 1) {
        current[part].commands.push(item)
      }

      current = current[part].children
    })
  })

  const convertToArray = (obj) => {
    return Object.values(obj).map(item => ({
      id: item.id,
      name: item.name,
      commands: item.commands,
      children: convertToArray(item.children)
    }))
  }

  tree.value = convertToArray(treeMap)
}

const displayedTree = computed(() => {
  // 第一步：模块过滤
  let baseTree = tree.value
  if (selectedModule.value !== 'all') {
    baseTree = tree.value.filter(node => {
      // 顶层模块名匹配
      return node.id === '/' + selectedModule.value || node.name === selectedModule.value
    })
  }

  if (!searchQuery.value) {
    return baseTree
  }

  // 支持模糊搜索：关键词可以用空格分隔多个词
  const queries = searchQuery.value.toLowerCase().split(/\s+/).filter(q => q)
  if (queries.length === 0) return baseTree

  // 收集所有需要展开的文件夹 ID
  const foldersToExpand = new Set()

  const filterTree = (nodes) => {
    const result = []
    for (const node of nodes) {
      // 过滤命令
      const filteredCommands = node.commands.filter(cmd => {
        const searchText = (cmd.name + ' ' + (cmd.keyword || '')).toLowerCase()
        return queries.every(q => searchText.includes(q))
      })

      // 递归过滤子节点
      const filteredChildren = filterTree(node.children || [])

      if (filteredCommands.length > 0 || filteredChildren.length > 0) {
        // 有匹配结果，记录需要展开的文件夹
        foldersToExpand.add(node.id)
        if (filteredCommands.length > 0) {
          // 收集命令的父文件夹路径
          filteredCommands.forEach(cmd => {
            const pathParts = cmd.dirPath.replace(/^\/|\/$/g, '').split('/')
            let currentPath = ''
            pathParts.forEach(part => {
              currentPath += '/' + part
              foldersToExpand.add(currentPath)
            })
          })
        }
        result.push({
          ...node,
          commands: filteredCommands,
          children: filteredChildren
        })
      }
    }
    return result
  }

  const filteredTree = filterTree(baseTree)

  // 搜索时自动展开所有匹配的文件夹
  if (foldersToExpand.size > 0) {
    expandedFolders.value = new Set([...expandedFolders.value, ...foldersToExpand])
  }

  return filteredTree
})

const toggleFolder = (folderId) => {
  const newSet = new Set(expandedFolders.value)
  if (newSet.has(folderId)) {
    newSet.delete(folderId)
  } else {
    newSet.add(folderId)
  }
  expandedFolders.value = newSet
  saveLayoutState()
}

const selectCommand = (cmd) => {
  selectedCommand.value = cmd
  addToRecent(cmd)
}

// 提取命令中的占位符 %{...}%
const extractPlaceholders = (cmdText) => {
  const regex = /%\{([^}]+)\}%/g
  const placeholders = []
  let match
  while ((match = regex.exec(cmdText)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1])
    }
  }
  return placeholders
}

// 替换命令中的占位符
const replacePlaceholders = (cmdText, values) => {
  return cmdText.replace(/%\{([^}]+)\}%/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match
  })
}

const copyCommand = async (cmd = null, index = -1) => {
  const target = cmd || selectedCommand.value
  if (!target) return

  let textToCopy
  if (index === -1) {
    // 复制主命令
    textToCopy = target.data.cmd
  } else {
    // 复制扩展命令
    textToCopy = target.data.extensions[index].cmd
  }

  // 检测是否有占位符
  const placeholders = extractPlaceholders(textToCopy)
  if (placeholders.length > 0) {
    // 打开弹窗让用户输入
    placeholderValues.value = {}
    placeholders.forEach(p => {
      placeholderValues.value[p] = ''
    })
    showPlaceholderModal.value = true
    return
  }

  await doCopy(textToCopy, index)
}

const doCopy = async (textToCopy, index) => {
  try {
    await navigator.clipboard.writeText(textToCopy)
    isCopied.value = true
    copiedIndex.value = index
    showToast.value = true

    // 添加到搜索历史
    if (searchQuery.value) {
      addToSearchHistory(searchQuery.value)
    }

    setTimeout(() => {
      isCopied.value = false
      copiedIndex.value = -1
    }, 2000)

    setTimeout(() => {
      showToast.value = false
    }, 2500)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const confirmPlaceholderCopy = async () => {
  const target = selectedCommand.value
  if (!target) return

  let textToCopy
  if (copiedIndex.value === -1) {
    textToCopy = target.data.cmd
  } else {
    textToCopy = target.data.extensions[copiedIndex.value].cmd
  }

  // 替换占位符
  const finalText = replacePlaceholders(textToCopy, placeholderValues.value)
  showPlaceholderModal.value = false

  await doCopy(finalText, copiedIndex.value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未知'

  const match = dateStr.match(/Date\((.+)\)/)
  if (match) {
    const timestamp = parseInt(match[1])
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return dateStr
}

// 命令面板搜索结果
const paletteResults = computed(() => {
  if (!paletteQuery.value) {
    // 无搜索时显示最近使用
    return recentCommands.value.slice(0, 8)
  }
  // 支持多词模糊搜索
  const queries = paletteQuery.value.toLowerCase().split(/\s+/).filter(q => q)
  return commands.value
    .filter(cmd => {
      if (!cmd.data || !cmd.data.cmd) return false
      const searchText = (cmd.name + ' ' + (cmd.keyword || '')).toLowerCase()
      return queries.every(q => searchText.includes(q))
    })
    .slice(0, 10)
})

// 打开命令面板
const openPalette = () => {
  showPalette.value = true
  paletteQuery.value = ''
  paletteSelectedIndex.value = 0
  setTimeout(() => paletteInput.value?.focus(), 50)
}

// 移动面板选择
const movePaletteSelection = (dir) => {
  const max = paletteResults.value.length - 1
  paletteSelectedIndex.value = Math.max(0, Math.min(max, paletteSelectedIndex.value + dir))
}

// 选择面板项
const selectPaletteItem = (cmd) => {
  showPalette.value = false
  selectCommand(cmd)
  // 滚动到可视区域
  setTimeout(() => {
    const el = document.querySelector('.command-item.active')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 100)
}

// 执行面板选择（复制并关闭）
const executePaletteSelection = () => {
  const cmd = paletteResults.value[paletteSelectedIndex.value]
  if (cmd) {
    selectPaletteItem(cmd)
    copyCommand()
  }
}

// 添加到最近使用
const addToRecent = (cmd) => {
  const recent = recentCommands.value.filter(c => c.id !== cmd.id)
  recent.unshift(cmd)
  recentCommands.value = recent.slice(0, 20) // 最多保存20条
  try {
    localStorage.setItem('recentCommands', JSON.stringify(recentCommands.value))
  } catch (e) {}
}

// 加载最近使用
const loadRecentCommands = () => {
  try {
    const saved = localStorage.getItem('recentCommands')
    if (saved) {
      recentCommands.value = JSON.parse(saved)
    }
  } catch (e) {}
}

// 加载收藏
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('favoriteCommands')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  } catch (e) {}
}

// 加载布局状态（侧边栏折叠、文件夹展开）
const loadLayoutState = () => {
  try {
    const saved = localStorage.getItem('layoutState')
    if (saved) {
      const state = JSON.parse(saved)
      sidebarCollapsed.value = state.sidebarCollapsed || false
      if (state.expandedFolders?.length) {
        state.expandedFolders.forEach(id => expandedFolders.value.add(id))
      }
    }
  } catch (e) {}
}

// 保存布局状态
const saveLayoutState = () => {
  try {
    localStorage.setItem('layoutState', JSON.stringify({
      sidebarCollapsed: sidebarCollapsed.value,
      expandedFolders: Array.from(expandedFolders.value)
    }))
  } catch (e) {}
}

// 切换收藏
const handleSearchEnter = () => {
  if (searchQuery.value.trim()) {
    addToSearchHistory(searchQuery.value)
  }
  showSearchHistory.value = false
}

// 数据导入导出
const exportData = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    favorites: favorites.value,
    searchHistory: searchHistory.value,
    layoutState: {
      sidebarCollapsed: sidebarCollapsed.value,
      overviewCollapsed: overviewCollapsed.value,
      selectedModule: selectedModule.value,
      selectedCategory: selectedCategory.value
    },
    themeMode: themeMode.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `copy-skill-backup-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importFileInput = ref(null)

const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      if (!data.version) {
        alert('无效的备份文件')
        return
      }
      
      if (data.favorites) {
        favorites.value = data.favorites
        saveFavorites()
      }
      if (data.searchHistory) {
        searchHistory.value = data.searchHistory
        saveSearchHistory()
      }
      if (data.layoutState) {
        if (data.layoutState.sidebarCollapsed !== undefined) {
          sidebarCollapsed.value = data.layoutState.sidebarCollapsed
        }
        if (data.layoutState.overviewCollapsed !== undefined) {
          overviewCollapsed.value = data.layoutState.overviewCollapsed
        }
        if (data.layoutState.selectedModule) {
          selectedModule.value = data.layoutState.selectedModule
        }
        if (data.layoutState.selectedCategory) {
          selectedCategory.value = data.layoutState.selectedCategory
        }
      }
      if (data.themeMode) {
        themeMode.value = data.themeMode
        applyTheme()
        saveTheme()
      }
      
      saveLayoutState()
      alert('导入成功！')
    } catch (err) {
      alert('导入失败：' + err.message)
    }
    
    event.target.value = ''
  }
  reader.readAsText(file)
}

const toggleFavorite = (cmd) => {
  const idx = favorites.value.findIndex(c => c.id === cmd.id)
  if (idx >= 0) {
    favorites.value.splice(idx, 1)
  } else {
    favorites.value.unshift(cmd)
  }
  try {
    localStorage.setItem('favoriteCommands', JSON.stringify(favorites.value))
  } catch (e) {}
}

// 显示预览
const showPreview = (cmd, event) => {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(() => {
    previewCommand.value = cmd
    const rect = event.target.getBoundingClientRect()
    previewPosition.value = {
      x: rect.right + 10,
      y: rect.top
    }
  }, 300)
}

// 隐藏预览
const hidePreview = () => {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(() => {
    previewCommand.value = null
  }, 150)
}

// 展开全部
const expandAll = () => {
  const allIds = new Set()
  const collectIds = (nodes) => {
    nodes.forEach(node => {
      allIds.add(node.id)
      if (node.children?.length) collectIds(node.children)
    })
  }
  collectIds(tree.value)
  expandedFolders.value = allIds
}

// 折叠全部
const collapseAll = () => {
  expandedFolders.value = new Set()
}

// 键盘导航：向上
const navigateUp = () => {
  const flat = allFlatCommands.value
  if (flat.length === 0) return
  const currentIdx = flat.findIndex(c => c.id === keyboardSelectedId.value)
  if (currentIdx <= 0) {
    keyboardSelectedId.value = flat[0].id
  } else {
    keyboardSelectedId.value = flat[currentIdx - 1].id
  }
  scrollToKeyboardSelection()
}

// 键盘导航：向下
const navigateDown = () => {
  const flat = allFlatCommands.value
  if (flat.length === 0) return
  const currentIdx = flat.findIndex(c => c.id === keyboardSelectedId.value)
  if (currentIdx >= flat.length - 1 || currentIdx < 0) {
    keyboardSelectedId.value = flat[flat.length - 1].id
  } else {
    keyboardSelectedId.value = flat[currentIdx + 1].id
  }
  scrollToKeyboardSelection()
}

// 滚动到键盘选中项
const scrollToKeyboardSelection = () => {
  setTimeout(() => {
    const el = document.querySelector('.command-item.keyboard-selected')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, 50)
}

// 键盘选择并复制
const keyboardSelectAndCopy = () => {
  const cmd = allFlatCommands.value.find(c => c.id === keyboardSelectedId.value)
  if (cmd) {
    selectCommand(cmd)
    copyCommand(cmd)
  }
}

// 键盘快捷键
const handleKeydown = (e) => {
  // 命令面板打开时只处理面板快捷键
  if (showPalette.value) return

  // ⌘K / Ctrl+K 打开命令面板
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openPalette()
    return
  }

  // ? 显示快捷键帮助
  if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      showShortcutsHelp.value = !showShortcutsHelp.value
      return
    }
  }

  // \ 折叠/展开模块概览
  if (e.key === '\\' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      toggleOverview()
      return
    }
  }

  // B 切换侧边栏
  if (e.key === 'b' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      sidebarCollapsed.value = !sidebarCollapsed.value
      return
    }
  }

  // F 切换收藏过滤
  if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      showFavoritesOnly.value = !showFavoritesOnly.value
      return
    }
  }

  // E 展开全部文件夹
  if (e.key === 'e' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      expandAll()
      return
    }
  }

  // A 折叠全部文件夹
  if (e.key === 'a' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused) {
      e.preventDefault()
      collapseAll()
      return
    }
  }

  // 方向键导航
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    navigateUp()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    navigateDown()
    return
  }

  // C 键复制（当有选中项时）
  if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused && keyboardSelectedId.value) {
      e.preventDefault()
      keyboardSelectAndCopy()
      return
    }
  }

  // Enter 键选择
  if (e.key === 'Enter') {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused && keyboardSelectedId.value) {
      e.preventDefault()
      const cmd = allFlatCommands.value.find(c => c.id === keyboardSelectedId.value)
      if (cmd) selectCommand(cmd)
      return
    }
  }

  // Escape 清除选择
  if (e.key === 'Escape') {
    keyboardSelectedId.value = null
    showShortcutsHelp.value = false
  }
}

onMounted(() => {
  loadCommands()
  loadRecentCommands()
  loadFavorites()
  loadLayoutState()
  loadSearchHistory()
  loadTheme()
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', handleKeydown)

  // 注册 Service Worker（PWA 离线支持）
  if ('serviceWorker' in navigator) {
    const basePath = getBasePath()
    navigator.serviceWorker.register(`${basePath}service-worker.js`).catch(() => {})
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Google Fonts - 思源黑体 + JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* CSS Variables */
:root {
  --bg-primary: #0c0c0f;
  --bg-secondary: #141419;
  --bg-tertiary: #1a1a21;
  --bg-hover: #22222b;
  --bg-active: #28282f;

  --accent-primary: #f59e0b;
  --accent-secondary: #fbbf24;
  --accent-glow: rgba(245, 158, 11, 0.15);

  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  --border-color: #27272a;
  --border-hover: #3f3f46;

  --sidebar-width: 320px;
  --sidebar-collapsed-width: 56px;

/* ==================== 亮色主题 ==================== */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e5e5e5;
  --bg-hover: #e0e0e0;
  --bg-active: #d0d0d0;

  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;

  --border-color: #e0e0e0;
  --border-hover: #c0c0c0;
}

  --font-ui: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px var(--accent-glow);
}
</style>

<style scoped>
.command-app {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  font-family: var(--font-ui);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

/* 噪点纹理 */
.command-app::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 10000;
}

/* 快捷键帮助面板 */
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

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 顶部模块概览区域 */
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

/* 折叠按钮 */
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

/* 分类标签 */
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

/* 紧凑型模块卡片网格 */
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

/* 模块卡片 Tooltip */
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

.overview-card-arrow {
  opacity: 0.6;
  margin-left: 8px;
  flex-shrink: 0;
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.overview-card:hover .overview-card-arrow {
  opacity: 1;
  transform: translateX(2px);
}

/* ==================== 侧边栏 ==================== */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 180ms ease-out, min-width 180ms ease-out;
  position: relative;
  z-index: 1;
}

.sidebar-collapsed .sidebar {
  width: var(--sidebar-collapsed-width);
  min-width: var(--sidebar-collapsed-width);
}

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

/* 搜索 */
.search-area {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 38px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-ui);
  color: var(--text-primary);
  outline: none;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.search-kbd {
  position: absolute;
  right: 10px;
  padding: 2px 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

/* 搜索清除按钮 */
.search-clear {
position: absolute;
right: 10px;
width: 20px;
height: 20px;
background: var(--bg-tertiary);
border: 1px solid var(--border-color);
border-radius: 4px;
color: var(--text-muted);
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
transition: all 150ms ease-out;
}

.search-clear:hover {
background: var(--bg-hover);
color: var(--text-primary);
border-color: var(--border-hover);
}

.search-clear:active {
transform: scale(0.9);
}

/* 搜索历史下拉 */
.search-history {
position: absolute;
top: 100%;
left: 0;
right: 0;
background: var(--bg-secondary);
border: 1px solid var(--border-color);
border-radius: 8px;
margin-top: 8px;
padding: 12px;
box-shadow: var(--shadow-lg);
z-index: 100;
max-height: 300px;
overflow-y: auto;
}

.search-history-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 8px;
padding-bottom: 8px;
border-bottom: 1px solid var(--border-color);
font-size: 12px;
color: var(--text-secondary);
}

.search-history-clear {
background: none;
border: none;
color: var(--accent-primary);
cursor: pointer;
font-size: 12px;
padding: 2px 6px;
border-radius: 4px;
transition: background-color 150ms ease-out;
}

.search-history-clear:hover {
background: var(--accent-glow);
}

.search-history-list {
display: flex;
flex-direction: column;
gap: 2px;
}

.search-history-item {
display: flex;
align-items: center;
gap: 8px;
padding: 8px 10px;
background: none;
border: none;
border-radius: 6px;
cursor: pointer;
color: var(--text-primary);
font-size: 13px;
text-align: left;
transition: background-color 150ms ease-out;
}

.search-history-item:hover {
background: var(--bg-hover);
}

.search-history-item:active {
transform: scale(0.98);
}

.search-history-item svg {
color: var(--text-muted);
flex-shrink: 0;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
opacity: 0;
transform: translateY(-8px);
}

/* 工具栏 */
.tree-toolbar {
  display: flex;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.toolbar-btn {
  flex: 1;
  padding: 6px 8px;
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

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.toolbar-btn:active {
  transform: scale(0.94);
}

.toolbar-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* 收藏分组 */
.favorites-section {
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}

.favorites-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  cursor: pointer;
  user-select: none;
}

.favorites-header svg {
  color: var(--accent-primary);
}

.favorites-header .folder-name {
  color: var(--accent-primary);
  font-weight: 500;
}

.favorites-commands {
  padding-bottom: 8px;
}

.favorite-item {
  position: relative;
}

.unfavorite-btn {
  position: absolute;
  right: 8px;
  opacity: 0;
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: opacity 0.15s;
}

.favorite-item:hover .unfavorite-btn {
  opacity: 1;
}

/* 命令树 */
.command-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.command-tree::-webkit-scrollbar {
  width: 6px;
}

.command-tree::-webkit-scrollbar-track {
  background: transparent;
}

.command-tree::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.command-tree::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.tree-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.tree-empty svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.tree-empty p {
  font-size: 14px;
}

.tree-folder {
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

.folder-header.child-folder {
  padding-left: 44px;
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

.child-commands {
  padding-left: 24px;
}

.command-item {
  padding: 8px 16px 8px 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 100ms ease-out;
  position: relative;
  /* 性能优化：跳过屏幕外内容的渲染 */
  content-visibility: auto;
  contain-intrinsic-size: 0 44px;
}

/* 搜索时有动画，普通浏览时禁用 */
.command-item {
  animation: none;
  opacity: 1;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.command-item:hover {
  background: var(--bg-hover);
}

/* 命令描述 Tooltip */
.command-tooltip {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 8px;
  z-index: 1000;
  min-width: 200px;
  max-width: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
  white-space: normal;
}

.command-tooltip .tooltip-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
}

.command-item:hover .command-tooltip {
  display: block !important;
}

.command-item.active {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
}

.command-item.keyboard-selected {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.command-item.keyboard-selected::before {
  content: '';
  position: absolute;
  left: 20px;
  width: 3px;
  height: 16px;
  background: var(--accent-primary);
  border-radius: 2px;
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

.command-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.command-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.command-info .command-name {
  flex: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.command-info .command-desc {
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

.command-item:hover .command-desc,
.command-item.active .command-desc {
  color: var(--text-secondary);
}

.command-action {
  opacity: 0;
  color: var(--text-muted);
  transition: opacity 120ms ease-out;
  display: flex;
}

.command-item:hover .command-action {
  opacity: 1;
}

.command-action:hover {
  color: var(--accent-primary);
}

/* 收起状态的快捷导航 */
.sidebar-collapsed-nav {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.nav-mini-item {
  width: 36px;
  height: 36px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
}

.nav-mini-item:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.nav-mini-item:active {
  transform: scale(0.94);
}

/* 文件夹动画 */
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

.folder-content-enter-to,
.folder-content-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

/* ==================== 主内容区 ==================== */
.content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
  position: relative;
}

.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* 命令详情 */
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

/* 详情区块 */
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

/* 描述文本 */
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

/* 命令块 */
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

/* 扩展命令区域 */
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

/* 关键词 */
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

/* 路径文本 */
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

/* 空状态 */
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

/* Toast */
.copy-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 24px;
  background: var(--accent-primary);
  color: #0c0c0f;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  z-index: 10001;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* ==================== 占位符弹窗 ==================== */
.placeholder-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-modal {
  width: 90%;
  max-width: 480px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.placeholder-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.placeholder-item label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.placeholder-item input {
  padding: 10px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.placeholder-item input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-confirm {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: #0c0c0f;
}

.btn-confirm:hover {
  background: var(--accent-hover);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-active .placeholder-modal,
.modal-leave-active .placeholder-modal {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .placeholder-modal,
.modal-leave-to .placeholder-modal {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* ==================== Hover 预览 ==================== */
.command-preview {
  position: fixed;
  z-index: 1001;
  width: 320px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  pointer-events: auto;
}

.preview-header {
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.preview-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-code {
  margin: 0;
  padding: 12px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-actions {
  padding: 8px 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.preview-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent-primary);
  color: #0c0c0f;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-copy:hover {
  filter: brightness(1.1);
}

.preview-enter-active,
.preview-leave-active {
  transition: all 0.15s ease;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
  transform: translateX(5px);
}

/* ==================== 命令面板 ==================== */
.command-palette {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.palette-container {
  width: 90%;
  max-width: 580px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(245, 158, 11, 0.1);
  overflow: hidden;
  animation: paletteIn 0.2s ease-out;
}

@keyframes paletteIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.palette-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.palette-header svg {
  color: var(--accent-primary);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  background: transparent;
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
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.palette-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.palette-results::-webkit-scrollbar {
  width: 6px;
}

.palette-results::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.palette-item:hover,
.palette-item.selected {
  background: var(--bg-hover);
}

.palette-item.selected {
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
}

.palette-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.palette-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;
}

.palette-item:hover .palette-item-action,
.palette-item.selected .palette-item-action {
  opacity: 1;
  color: var(--accent-primary);
}

.palette-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.palette-enter-active,
.palette-leave-active {
  transition: all 0.2s ease;
}

.palette-enter-active .palette-container,
.palette-leave-active .palette-container {
  transition: all 0.2s ease;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette-container,
.palette-leave-to .palette-container {
  opacity: 0;
  transform: scale(0.96) translateY(-10px);
}

/* ==================== 移动端菜单按钮 ==================== */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 101;
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: var(--shadow-md);
}

.mobile-menu-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
  backdrop-filter: blur(4px);
}

/* ==================== 移动端底部导航 ==================== */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  z-index: 98;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}

.mobile-bottom-nav .nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 150ms ease-out;
  -webkit-tap-highlight-color: transparent;
}

.mobile-bottom-nav .nav-btn:active {
  transform: scale(0.95);
  background: var(--bg-hover);
}

.mobile-bottom-nav .nav-btn.active {
  color: var(--accent-primary);
}

.mobile-bottom-nav .nav-btn svg {
  flex-shrink: 0;
}

.mobile-bottom-nav .nav-btn span {
  font-size: 11px;
  font-family: var(--font-ui);
  white-space: nowrap;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .mobile-overlay {
    display: block;
  }

  .mobile-bottom-nav {
    display: flex;
  }

  .content {
    padding-bottom: 76px;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mobile-sidebar-open .sidebar {
    transform: translateX(0);
  }

  .command-detail {
    padding: 24px;
  }

  .detail-title {
    font-size: 24px;
  }
}
</style>
