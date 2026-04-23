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
      <button class="nav-btn" @click="toggleFavoritesMobile" :class="{ active: showFavoritesOnly }">
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
      <!-- 加载进度条 -->
      <div v-if="isLoading" class="loading-progress-bar">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ loadingProgress }}%</div>
      </div>
      
      <!-- 拖拽调整宽度手柄 -->
      <div 
        v-show="!sidebarCollapsed"
        class="sidebar-resize-handle" 
        @mousedown="startResize"
        @touchstart.prevent="startResize"
        :class="{ 'resizing': isResizing }"
      ></div>
      
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
        <button class="collapse-btn" @click="handleCollapseClick" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
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
            @blur="handleBlur"
            @keydown.enter="handleSearchEnter"
          />
          <button
            v-if="searchQuery"
            class="search-clear"
            @click="clearSearch"
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
        </div>
      </div>

      <!-- 收藏分组 -->
      <div class="favorites-section" v-if="favoritesRaw.length > 0 && !sidebarCollapsed">
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
              <span class="command-name" v-html="highlightText(cmd.name, searchQuery)"></span>
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
                v-for="cmd in folder.commands"
                :key="cmd.id"
                class="command-item"
                :class="{ active: selectedCommand?.id === cmd.id, 'keyboard-selected': keyboardSelectedId === cmd.id }"
                @click="selectCommand(cmd)"
                @mouseenter="showPreview(cmd, $event)"
                @mouseleave="hidePreview"
              >
                <span class="command-indicator"></span>
                <div class="command-info">
                  <span class="command-name" v-html="highlightText(cmd.name, searchQuery)"></span>
                  <span v-if="cmd.description" class="command-desc" v-html="highlightText(cmd.description, searchQuery)"></span>
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
                    v-for="cmd in child.commands"
                    :key="cmd.id"
                    class="command-item"
                    :class="{ active: selectedCommand?.id === cmd.id }"
                    @click="selectCommand(cmd)"
                  >
                    <span class="command-indicator"></span>
                    <span class="command-name" v-html="highlightText(cmd.name, searchQuery)"></span>
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

      <div v-if="selectedCommand" :key="selectedCommand.id" class="command-detail">
        <!-- 头部 -->
        <div class="detail-header">
          <div class="detail-breadcrumb">
            <span class="breadcrumb-item">{{ (selectedCommand.dirPath || '/未分类/').replace(/^\/|\/$/g, '').split('/')[0] }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span class="breadcrumb-item active">{{ selectedCommand.name }}</span>
          </div>
          <div class="detail-title-row">
            <h2 class="detail-title">{{ selectedCommand.name }}</h2>
            <button
              class="favorite-btn"
              :class="{ favorited: isSelectedCommandFavorited }"
              @click="toggleFavorite(selectedCommand)"
              :title="isSelectedCommandFavorited ? '取消收藏' : '添加收藏'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="isSelectedCommandFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
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
            <pre class="command-code">{{ selectedCommand.data?.cmd || '' }}</pre>
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
              <pre class="command-code">{{ ext.cmd || '' }}</pre>
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
              v-for="kw in (selectedCommand.keyword || '').split(' ')"
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
                <span class="palette-item-name" v-html="highlightText(cmd.name, paletteQuery)"></span>
                <span class="palette-item-path" v-html="highlightText(cmd.dirPath || '', paletteQuery)"></span>
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
          <pre class="preview-code">{{ previewCommand.data?.cmd || '' }}</pre>
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
              <div class="header-actions">
                <button 
                  v-if="hasAnyExample" 
                  class="btn-fill-all" 
                  @click="fillAllExamples"
                  title="一键填充所有示例值"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  一键填充
                </button>
                <button class="modal-close" @click="showPlaceholderModal = false">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="modal-body">
              <div v-for="param in placeholderParams" :key="param.key" class="placeholder-item">
                <!-- 标签行：参数名 + 描述 + 必填标记 -->
                <div class="placeholder-label">
                  <label>{{ param.key }}</label>
                  <span v-if="param.description" class="param-label-desc">({{ param.description }})</span>
                  <span v-if="param.required" class="required-mark">*</span>
                </div>

                <!-- 根据类型渲染不同控件 -->
                <!-- string -> input text -->
                <div v-if="param.type === 'string' || !param.type" class="input-wrapper">
                  <input
                    v-model="placeholderValues[param.key]"
                    type="text"
                    :placeholder="param.example || '请输入 ' + param.key"
                    @keydown.enter="confirmPlaceholderCopy"
                  />
                  <button
                    v-if="param.example"
                    class="btn-example"
                    @click="fillExample(param.key)"
                    title="填入示例"
                  >填入示例</button>
                </div>

                <!-- number -> input number -->
                <div v-else-if="param.type === 'number'" class="input-wrapper">
                  <input
                    v-model.number="placeholderValues[param.key]"
                    type="number"
                    :placeholder="param.example || '请输入数值'"
                    @keydown.enter="confirmPlaceholderCopy"
                  />
                  <button
                    v-if="param.example"
                    class="btn-example"
                    @click="fillExample(param.key)"
                    title="填入示例"
                  >填入示例</button>
                </div>

                <!-- boolean -> switch -->
                <div v-else-if="param.type === 'boolean'" class="switch-wrapper">
                  <label class="switch">
                    <input v-model="placeholderValues[param.key]" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                  <span class="switch-label">{{ placeholderValues[param.key] ? '是' : '否' }}</span>
                </div>

                <!-- array -> textarea -->
                <div v-else-if="param.type === 'array'" class="input-wrapper">
                  <textarea
                    v-model="placeholderValues[param.key]"
                    rows="3"
                    :placeholder="param.example || '请输入值，逗号分隔'"
                  ></textarea>
                  <button
                    v-if="param.example"
                    class="btn-example"
                    @click="fillExample(param.key)"
                    title="填入示例"
                  >填入示例</button>
                </div>

                <!-- description 说明 -->
                
                <!-- notes 警示提示 -->
                <div v-if="param.notes" class="param-notes">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{{ param.notes }}</span>
                </div>
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
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { dataManager } from './CommandDataManager.js'

// ==================== 状态定义 ====================
// 核心数据 - 使用 shallowRef 优化大数据量性能
const commands = shallowRef([]) // 所有命令列表
const tree = shallowRef([]) // 树形结构的命令
const expandedFolders = ref(new Set()) // 展开的文件夹ID集合
const selectedCommand = ref(null) // 当前选中的命令

// UI 状态
const searchQuery = ref('') // 搜索关键词
const isCopied = ref(false) // 复制成功状态
const copiedIndex = ref(-1) // -1 = 主命令，其他 = extensions 索引
const showToast = ref(false) // Toast 显示状态
const sidebarCollapsed = ref(false) // 侧边栏折叠状态
const mobileSidebarOpen = ref(false) // 移动端侧边栏打开状态
const isMobile = ref(false) // 是否移动端
const sidebarWidth = ref(320) // 侧边栏宽度
const isResizing = ref(false) // 是否正在调整侧边栏宽度

// ==================== 主题管理 ====================
// 主题模式: 'dark' | 'light'
const themeMode = ref('dark')

// 加载主题设置
const loadTheme = () => {
  try {
    const saved = localStorage.getItem('themeMode')
    if (saved) themeMode.value = saved
    applyTheme()
  } catch (e) {
    console.error('加载主题失败:', e)
  }
}

// 保存主题设置
const saveTheme = () => {
  try {
    localStorage.setItem('themeMode', themeMode.value)
  } catch (e) {
    console.error('保存主题失败:', e)
  }
}

// 应用主题到 DOM
const applyTheme = () => {
  try {
    document.documentElement.setAttribute('data-theme', themeMode.value)
  } catch (e) {
    console.error('应用主题失败:', e)
  }
}

// 切换主题
const toggleTheme = () => {
  const modes = ['dark', 'light']
  const currentIndex = modes.indexOf(themeMode.value)
  themeMode.value = modes[(currentIndex + 1) % modes.length]
  applyTheme()
  saveTheme()
}

// ==================== 搜索历史管理 ====================
const searchHistory = ref([])
const showSearchHistory = ref(false)

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('searchHistory')
    if (saved) searchHistory.value = JSON.parse(saved)
  } catch (e) {
    console.error('加载搜索历史失败:', e)
  }
}

// 保存搜索历史（防抖批量写入）
const saveSearchHistory = () => {
  scheduleSave('searchHistory')
}

// 添加搜索记录
const addToSearchHistory = (query) => {
  if (!query || !query.trim()) return
  const trimmed = query.trim()
  // 移除重复项并添加到开头
  searchHistory.value = [trimmed, ...searchHistory.value.filter(h => h !== trimmed)].slice(0, 10)
  saveSearchHistory()
}

// 清除搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  scheduleSave('searchHistory')
}

// 搜索输入框 ref
const searchInput = ref(null)
let blurTimer = null

const handleBlur = () => {
  if (blurTimer) clearTimeout(blurTimer)
  blurTimer = setTimeout(() => {
    showSearchHistory.value = false
  }, 200)
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
}

// 搜索回车处理
const handleSearchEnter = () => {
  if (searchQuery.value.trim()) {
    addToSearchHistory(searchQuery.value)
  }
  showSearchHistory.value = false
}

// ========== localStorage 批量写入优化 ==========
const pendingWrites = new Set()
let saveTimer = null

const scheduleSave = (key) => {
  pendingWrites.add(key)
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (pendingWrites.has('favorites')) {
      try { localStorage.setItem('favoriteCommands', JSON.stringify(favoritesRaw.value)) } catch (e) {}
      pendingWrites.delete('favorites')
    }
    if (pendingWrites.has('searchHistory')) {
      try { localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value)) } catch (e) {}
      pendingWrites.delete('searchHistory')
    }
    if (pendingWrites.has('recentCommands')) {
      try { localStorage.setItem('recentCommands', JSON.stringify(recentCommands.value)) } catch (e) {}
      pendingWrites.delete('recentCommands')
    }
    if (pendingWrites.has('layoutState')) {
      try { localStorage.setItem('layoutState', JSON.stringify({ sidebarCollapsed: sidebarCollapsed.value, sidebarWidth: sidebarWidth.value, overviewCollapsed: overviewCollapsed.value, expandedFolders: Array.from(expandedFolders.value) })) } catch (e) {}
      pendingWrites.delete('layoutState')
    }
  }, 300)
}

// 搜索防抖
let searchDebounceTimer = null
const debouncedSearchQuery = ref('')

watch(searchQuery, (newQuery) => {
  showSearchHistory.value = false
  
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newQuery
  }, 150)
})

// 占位符输入
const showPlaceholderModal = ref(false)
const placeholderValues = ref({})
// 占位符参数完整元数据 (type/required/description/example/notes)
const placeholderParams = ref([])

// ==================== 命令面板 ====================
const showPalette = ref(false)
const paletteQuery = ref('')
const paletteSelectedIndex = ref(0)
const paletteInput = ref(null)
const recentCommands = ref([])

// ==================== 快捷键帮助面板 ====================
const showShortcutsHelp = ref(false)

// ==================== 收藏数据 ====================
// 使用 Map 优化查找性能 O(1)
const favorites = computed(() => {
  const commandIds = new Set(commands.value.map(c => c.id))
  return favoritesRaw.value.filter(f => commandIds.has(f.id))
})

const isSelectedCommandFavorited = computed(() => {
  if (!selectedCommand.value) return false
  return favorites.value.some(c => c.id === selectedCommand.value.id)
})

const favoritesRaw = ref([])
const showFavorites = ref(true)
const showFavoritesOnly = ref(false)

// ==================== 模块标签 ====================
const modules = ref([])
const selectedModule = ref('all')
const totalCommands = computed(() => commands.value.filter(cmd => cmd.data && cmd.data.cmd).length)
const overviewCollapsed = ref(false)

const toggleOverview = () => {
  overviewCollapsed.value = !overviewCollapsed.value
}

const handleCollapseClick = () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = false
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
    saveLayoutState()
  }
}

const startResize = (e) => {
  if (isMobile.value && !mobileSidebarOpen.value) return
  isResizing.value = true
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
  
  const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
  
  const handleMove = (moveEvent) => {
    const currentX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX
    const newWidth = currentX
    const minWidth = 200
    const maxWidth = isMobile.value ? Math.min(500, window.innerWidth * 0.85) : Math.min(500, window.innerWidth - 100)
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`)
    }
  }
  
  const handleMouseMove = (moveEvent) => handleMove(moveEvent)
  const handleTouchMove = (moveEvent) => handleMove(moveEvent)
  
  const handleEnd = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleEnd)
    saveLayoutState()
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleEnd)
}

const toggleFavoritesMobile = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
  if (showFavoritesOnly.value && favorites.value.length > 0) {
    selectedCommand.value = favorites.value[0]
  } else if (!showFavoritesOnly.value && commands.value.length > 0) {
    selectedCommand.value = null
  }
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
    const dirPath = cmd.dirPath || '/未分类/'
    const path = dirPath.replace(/^\/|\/$/g, '')
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
    debouncedSearchQuery.value = ''
  }
  // 取消可能正在等待的防抖计时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
}

// Hover 预览
const previewCommand = ref(null)
const previewPosition = ref({ x: 0, y: 0 })
let previewTimeout = null

// 键盘导航 - 使用缓存优化
const allFlatCommands = shallowRef([])
const flatCommandsCache = new Map()
const keyboardSelectedId = ref(null)

const updateFlatCommands = () => {
  const treeKey = JSON.stringify(tree.value.map(n => n.id))
  if (flatCommandsCache.has(treeKey)) {
    allFlatCommands.value = flatCommandsCache.get(treeKey)
    return
  }
  
  const flat = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.commands) {
        flat.push(...node.commands)
      }
      if (node.children) traverse(node.children)
    })
  }
  traverse(displayedTree.value)
  
  // 限制缓存大小
  if (flatCommandsCache.size > 10) {
    const firstKey = flatCommandsCache.keys().next().value
    flatCommandsCache.delete(firstKey)
  }
  flatCommandsCache.set(treeKey, flat)
  allFlatCommands.value = flat
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

// ResizeObserver 引用
let resizeObserver = null

// 获取当前部署的基础路径
const getBasePath = () => {
  return import.meta.env.BASE_URL || '/'
}

const loadingProgress = ref(0)
const isLoading = ref(false)

const loadCommands = async () => {
  try {
    const basePath = getBasePath()
    const dataUrl = `${basePath}commands.json`
    
    isLoading.value = true
    
    // 监听加载进度
    dataManager.on('loading-progress', (data) => {
      loadingProgress.value = data.percent
    })
    
    dataManager.on('loading-complete', (data) => {
      console.log(`加载完成: ${data.count} 条命令`)
      isLoading.value = false
    })
    
    dataManager.on('loaded-from-cache', (data) => {
      console.log(`从缓存加载: ${data.count} 条命令`)
      isLoading.value = false
    })
    
    // 初始化数据管理器
    await dataManager.init(dataUrl)
    
    // 获取所有命令
    const allCommands = dataManager.getAllCommands()
    
    // 深拷贝避免直接修改原始数据，确保 Vue 响应式正常工作
    commands.value = allCommands.map((item, index) => {
      const cmd = {
        ...item,
        id: item.id || (crypto.randomUUID ? crypto.randomUUID() : `cmd-${Date.now()}-${index}`),
        data: item.data ? { ...item.data } : undefined
      }
      return cmd
    })
    
    buildTree()
    extractModules()

    if (commands.value.length > 0) {
      expandAllFolders(tree.value)
    }
  } catch (error) {
    console.error('加载命令数据失败:', error)
    isLoading.value = false
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

    const dirPath = item.dirPath || '/未分类/'
    const path = dirPath.replace(/^\/|\/$/g, '')
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
  // 提前返回：如果没有过滤条件，直接返回树
  if (!debouncedSearchQuery.value && !showFavoritesOnly.value) {
    if (selectedModule.value === 'all') {
      return tree.value
    }
    return tree.value.filter(node => {
      return node.id === '/' + selectedModule.value || node.name === selectedModule.value
    })
  }

  let baseTree = tree.value
  
  if (selectedModule.value !== 'all') {
    baseTree = tree.value.filter(node => {
      return node.id === '/' + selectedModule.value || node.name === selectedModule.value
    })
  }

  const queries = debouncedSearchQuery.value.toLowerCase().split(/\s+/).filter(q => q)
  const foldersToExpand = new Set()
  const favoritesSet = new Set(favoritesRaw.value.map(f => f.id))

  // 构建搜索正则
  const searchRegex = queries.length > 0 ? new RegExp(queries.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi') : null

  const filterTree = (nodes) => {
    const result = []
    for (const node of nodes) {
      // 递归过滤子节点
      const filteredChildren = node.children?.length > 0 ? filterTree(node.children) : []
      
      // 过滤当前节点下的命令
      let filteredCommands = node.commands.filter(cmd => {
        // 收藏过滤
        if (showFavoritesOnly.value && !favoritesSet.has(cmd.id)) {
          return false
        }
        
        // 搜索过滤
        if (searchRegex) {
          const searchText = [
            cmd.name || '',
            cmd.keyword || '',
            cmd.description || '',
            cmd.data?.cmd || '',
            cmd.data?.extensions?.map(e => e.name).join(' ') || ''
          ].join(' ').toLowerCase()
          return searchRegex.test(searchText)
        }
        
        return true
      })

      // 如果有匹配的子节点或命令，添加到结果
      if (filteredCommands.length > 0 || filteredChildren.length > 0) {
        // 展开包含匹配命令的文件夹
        if (filteredCommands.length > 0) {
          foldersToExpand.add(node.id)
        }
        result.push({
          id: node.id,
          name: node.name,
          commands: filteredCommands,
          children: filteredChildren
        })
      }
    }
    return result
  }

  const filteredTree = filterTree(baseTree)
  
  // 展开匹配的文件夹
  if (foldersToExpand.size > 0) {
    foldersToExpand.forEach(id => expandedFolders.value.add(id))
  }

  return filteredTree
})

// 在 displayedTree 变化时更新缓存
watch(displayedTree, updateFlatCommands, { deep: false })

// 初始化时执行
updateFlatCommands()

// 搜索时自动展开匹配的文件夹（已移至 displayedTree computed 内部，避免重复触发）
watch(searchQuery, () => {
  // 功能已整合到 displayedTree computed 中
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

// 搜索结果高亮（带缓存优化）
const highlightCache = new Map()
let highlightCacheCount = 0
const escapeHtml = (str) => {
  if (!str) return str
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const highlightText = (text, query) => {
  if (!text) return text
  // 如果没有搜索词，直接返回转义后的文本，避免 v-html 开销
  if (!query) return escapeHtml(text)

  const cacheKey = `${text}|${query}`
  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey)
  }
  const queries = query.toLowerCase().split(/\s+/).filter(q => q)
  if (queries.length === 0) return escapeHtml(text)
  // 先转义原文本中的 HTML 特殊字符
  const escapedText = escapeHtml(text)
  const regex = new RegExp(`(${queries.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const result = escapedText.replace(regex, '<mark class="highlight">$1</mark>')
  // 限制缓存大小
  if (highlightCache.size > 500) {
    if (highlightCacheCount >= 100) {
      highlightCache.clear()
      highlightCacheCount = 0
    }
    highlightCacheCount++
  }
  highlightCache.set(cacheKey, result)
  return result
}

// 提取命令中的占位符 %{...}%
const extractPlaceholders = (cmdText, paramsDef = {}) => {
  const regex = /%\{([^}]+)\}%/g
  const result = []
  let match
  while ((match = regex.exec(cmdText)) !== null) {
    const key = match[1]
    if (!result.find(p => p.key === key)) {
      result.push({
        key,
        ...paramsDef[key]
      })
    }
  }
  return result
}

// 替换命令中的占位符
const replacePlaceholders = (cmdText, values) => {
  return cmdText.replace(/%\{([^}]+)\}%/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match
  })
}

const pendingCopyIndex = ref(-1)

// 将 params 数组转换为对象格式
const normalizeParams = (params) => {
  if (!params) return {}
  // 如果已经是对象格式，直接返回
  if (!Array.isArray(params)) return params
  // 如果是数组格式，转换为对象
  const paramsObj = {}
  params.forEach(p => {
    paramsObj[p.name || p.key] = {
      type: p.type || 'string',
      required: p.required !== undefined ? p.required : true,
      description: p.description || '',
      example: p.example || '',
      notes: p.notes || ''
    }
  })
  return paramsObj
}

const copyCommand = async (cmd = null, index = -1) => {
  const target = cmd || selectedCommand.value
  if (!target) return

  let textToCopy, paramsDef
  if (index === -1) {
    textToCopy = target.data?.cmd || ''
    paramsDef = normalizeParams(target.data?.params)
  } else {
    textToCopy = target.data?.extensions?.[index]?.cmd || ''
    paramsDef = normalizeParams(target.data?.extensions?.[index]?.params)
  }

  const placeholders = extractPlaceholders(textToCopy, paramsDef)
  if (placeholders.length > 0) {
    pendingCopyIndex.value = index
    placeholderParams.value = placeholders
    placeholderValues.value = {}
    placeholders.forEach(p => {
      placeholderValues.value[p.key] = ''
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
  if (pendingCopyIndex.value === -1) {
    textToCopy = target.data?.cmd || ''
  } else {
    textToCopy = target.data?.extensions?.[pendingCopyIndex.value]?.cmd || ''
  }

  const finalText = replacePlaceholders(textToCopy, placeholderValues.value)
  showPlaceholderModal.value = false

  await doCopy(finalText, pendingCopyIndex.value)
  pendingCopyIndex.value = -1
}

// 填入单个示例值
const fillExample = (key) => {
  const param = placeholderParams.value.find(p => p.key === key)
  if (param?.example) {
    placeholderValues.value[key] = param.example
  }
}

// 计算属性：是否存在至少一个示例值
const hasAnyExample = computed(() => {
  return placeholderParams.value.some(p => p.example)
})

// 一键填充所有示例值
const fillAllExamples = () => {
  placeholderParams.value.forEach(param => {
    if (param.example) {
      placeholderValues.value[param.key] = param.example
    }
  })
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
  // 使用倒排索引加速搜索
  if (dataManager.searchIndex) {
    return dataManager.search(paletteQuery.value, { limit: 10 }).slice(0, 10)
  }
  // Fallback到传统搜索
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
  scheduleSave('recentCommands')
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
      favoritesRaw.value = JSON.parse(saved)
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
      if (state.sidebarWidth) {
        sidebarWidth.value = state.sidebarWidth
        document.documentElement.style.setProperty('--sidebar-width', `${state.sidebarWidth}px`)
      }
      if (state.expandedFolders?.length) {
        state.expandedFolders.forEach(id => expandedFolders.value.add(id))
      }
    }
  } catch (e) {}
}

// 保存布局状态（批量写入）
const saveLayoutState = () => {
  scheduleSave('layoutState')
}

// ==================== 收藏管理 ====================
const toggleFavorite = (cmd) => {
  const idx = favoritesRaw.value.findIndex(c => c.id === cmd.id)
  if (idx >= 0) {
    favoritesRaw.value.splice(idx, 1)
  } else {
    favoritesRaw.value.unshift(cmd)
  }
  scheduleSave('favorites')
}

// 显示预览 (统一延迟为 200ms)
const showPreview = (cmd, event) => {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(() => {
    previewCommand.value = cmd
    const rect = event.target.getBoundingClientRect()
    previewPosition.value = {
      x: rect.right + 10,
      y: rect.top
    }
  }, 200)
}

// 隐藏预览 (统一延迟为 200ms，与 showPreview 一致)
const hidePreview = () => {
  clearTimeout(previewTimeout)
  previewTimeout = setTimeout(() => {
    previewCommand.value = null
  }, 200)
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
let gTimeout = null // G键序列 timeout 引用
let lastKeySequence = []
const KEY_SEQUENCE_TIMEOUT = 1000 // G键序列超时时间

const handleKeydown = (e) => {
  // 命令面板打开时只处理面板快捷键
  if (showPalette.value) return

  // ⌘K / Ctrl+K 打开命令面板
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openPalette()
    return
  }

  // Ctrl+C 复制选中命令（仅在有选中命令且不在输入框中时）
  if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
    const activeEl = document.activeElement
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
    if (!isInputFocused && selectedCommand.value) {
      e.preventDefault()
      copyCommand(selectedCommand.value)
      return
    }
  }

  // G键序列检测（G+H, G+F等）
  if (e.key === 'g' || e.key === 'G') {
    if (gTimeout) clearTimeout(gTimeout)
    lastKeySequence.push('g')
    gTimeout = setTimeout(() => {
      lastKeySequence = []
      gTimeout = null
    }, KEY_SEQUENCE_TIMEOUT)
    return
  }

  // G+H 跳转到首页/概览
  if (lastKeySequence.includes('g') && (e.key === 'h' || e.key === 'H')) {
    e.preventDefault()
    overviewCollapsed.value = false
    selectedModule.value = 'all'
    lastKeySequence = []
    return
  }

  // G+F 跳转到收藏夹
  if (lastKeySequence.includes('g') && (e.key === 'f' || e.key === 'F')) {
    e.preventDefault()
    showFavoritesOnly.value = true
    if (favorites.value.length > 0) {
      selectedCommand.value = favorites.value[0]
    }
    lastKeySequence = []
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

  // F 切换收藏过滤（仅当不在G序列中时）
  if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey && !lastKeySequence.includes('g')) {
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
  // 添加 ResizeObserver 监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    checkMobile()
  })
  resizeObserver.observe(document.documentElement)
  // 添加 orientationchange 监听（处理移动端旋转）
  window.addEventListener('orientationchange', () => {
    setTimeout(checkMobile, 100)
  })
  document.addEventListener('keydown', handleKeydown)

  // 命令树滚动时自动折叠模块概览
  const commandTreeEl = document.querySelector('.command-tree')
  if (commandTreeEl) {
    let scrollThreshold = 5
    commandTreeEl.addEventListener('wheel', (e) => {
      if (e.deltaY > 0 && !overviewCollapsed.value && scrollThreshold > 0) {
        scrollThreshold--
        setTimeout(() => { scrollThreshold = 5 }, 100)
        if (scrollThreshold === 0) {
          overviewCollapsed.value = true
          saveLayoutState()
        }
      }
    }, { passive: true })
  }

  // 移动端滑动手势支持
  let touchStartX = 0
  let touchStartY = 0
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
  const handleTouchMove = (e) => {
    if (!touchStartX) return
    const deltaX = e.touches[0].clientX - touchStartX
    const deltaY = e.touches[0].clientY - touchStartY
    // 水平滑动 > 50px 且幅度大于垂直滑动时触发
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && sidebarCollapsed.value) {
        // 向右滑 - 展开侧边栏
        sidebarCollapsed.value = false
        saveLayoutState()
      } else if (deltaX < 0 && !sidebarCollapsed.value) {
        // 向左滑 - 折叠侧边栏
        sidebarCollapsed.value = true
        saveLayoutState()
      }
      touchStartX = 0 // 重置防止重复触发
    }
  }
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })

  // 注册 Service Worker（PWA 离线支持）
  if ('serviceWorker' in navigator) {
    const basePath = getBasePath()
    navigator.serviceWorker.register(`${basePath}service-worker.js`).catch(() => {})
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('orientationchange', checkMobile)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  // 移除 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style>
/* Google Fonts - 思源黑体 + JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* CSS Variables - 默认深色主题 */
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

  --font-ui: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px var(--accent-glow);
}

/* 亮色主题 - 需要作为独立选择器，不能嵌套在 :root 里 */
:root[data-theme="light"] {
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

/* 主题过渡动画 */
:root, [data-theme="light"] {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
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

.sidebar-resize-handle {
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  z-index: 10;
  background: transparent;
  transition: background-color 150ms ease-out;
}

.sidebar-resize-handle:hover,
.sidebar-resize-handle.resizing {
  background: linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%);
  opacity: 0.5;
}

.sidebar-resize-handle.resizing {
  opacity: 1;
}

.sidebar-resize-handle::after {
  content: '';
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 40px;
  background: var(--border-color);
  border-radius: 1px;
  opacity: 0;
  transition: opacity 150ms ease-out, background-color 150ms ease-out;
}

.sidebar-resize-handle:hover::after {
  opacity: 1;
  background: var(--accent-primary);
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
  scrollbar-width: thin;
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

/* 大数据量渲染优化 */
.tree-folder {
  contain: layout style paint;
}

.folder-commands {
  contain: layout style;
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

/* 加载进度条 */
.loading-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-secondary);
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
}

.progress-track {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-align: center;
}

/* 搜索结果高亮 */
.highlight {
  background: rgba(245, 158, 11, 0.3);
  border-radius: 2px;
  padding: 0 2px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-fill-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent-primary);
  border: none;
  border-radius: 6px;
  color: #0c0c0f;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-fill-all:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.btn-fill-all:active {
  transform: scale(0.95);
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

/* ===== 增强版 placeholder-item ===== */
.placeholder-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s;
}

.placeholder-item:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

/* ===== 标签行 ===== */
.placeholder-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.placeholder-label label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.required-mark {
  color: #ef4444;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.param-label-desc {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 4px;
}

/* ===== 输入框 + 按钮横向布局 ===== */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-wrapper input,
.input-wrapper textarea {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.input-wrapper textarea {
  resize: vertical;
  min-height: 60px;
}

/* ===== 填入示例按钮 ===== */
.btn-example {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-example:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #0c0c0f;
}

/* ===== Switch 开关 ===== */
.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  transition: 0.3s;
}

.switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
  background: #0c0c0f;
}

.switch-label {
  font-size: 13px;
  color: var(--text-secondary);
}

/* ===== 描述文字 ===== */
.param-description {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ===== 警示提示 ===== */
.param-notes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  padding: 8px 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent-primary);
  line-height: 1.4;
}

.param-notes svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.param-notes span {
  color: var(--text-secondary);
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
    max-width: 85vw;
  }

  .mobile-sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-resize-handle {
    display: block;
    right: 0;
    width: 12px;
    background: linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.1) 100%);
  }

  .sidebar-resize-handle::after {
    opacity: 0.5;
    right: 5px;
  }

  .sidebar-resize-handle:hover::after {
    opacity: 1;
  }

  .command-detail {
    padding: 24px;
  }

  .detail-title {
    font-size: 24px;
  }
}
</style>
