# Copy Skill - 命令参考文档工具

一个高效的命令管理工具，提供左侧导航（文件夹树）+ 右侧详情面板，支持一键复制、智能搜索、参数提示等功能。

## 功能特性

### 核心功能
- **左侧导航树** - 自动根据 `dirPath` 生成层级文件夹结构
- **右侧详情面板** - 显示命令描述、实际命令内容、关键词
- **一键复制** - 点击即复制到剪贴板，支持快捷键

### 智能功能
- **搜索** - 支持按名称、关键词搜索，多关键词用空格分隔
- **参数提示** - 命令含 `%{参数}%` 时自动弹出输入框
- **收藏夹** - 收藏常用命令便于快速访问
- **最近使用** - 自动记录最近使用的命令

### 键盘快捷键
| 快捷键 | 功能 |
|--------|------|
| `C` | 复制当前选中命令 |
| `↑` `↓` | 上/下选择命令 |
| `Enter` | 确认/复制 |
| `Esc` | 取消 |
| `⌘K` / `Ctrl+K` | 打开命令面板 |

### 其他
- **PWA 支持** - 可安装到桌面，支持离线访问
- **布局记忆** - 自动保存侧边栏折叠状态
- **响应式** - 支持桌面端和移动端

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev
# 访问 http://localhost:5173/

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 数据配置

### 文件位置

所有配置都在 `docs/public/commands.json`，无需数据库。

### 目录结构

`dirPath` 字段定义文件夹层级：
```json
{
  "dirPath": "/Linux 命令/",
  "name": "ls 查看文件"
}
```

### JSON 字段说明

```json
{
  "data": [
    // 文件夹
    {
      "dirPath": "/文件夹路径/",
      "name": "文件夹名称",
      "keyword": "搜索关键词"
    },
    // 命令
    {
      "dirPath": "/文件夹路径/",
      "name": "ls -la",
      "keyword": "ls 查看 列表",
      "description": "详细查看文件列表",
      "data": {
        "cmd": "ls -la"
      }
    }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `dirPath` | 是 | 路径，必须以 `/` 开头和结尾 |
| `name` | 是 | 显示名称 |
| `keyword` | 否 | 搜索关键词 |
| `description` | 否 | 命令描述 |
| `data.cmd` | 是 | 实际命令内容 |

### 参数命令

命令含 `%{参数名}%` 时，复制前会弹出输入框：

```json
{
  "name": "git reset",
  "data": {
    "cmd": "git reset --hard %{修订号}%"
  }
}
```

### 修改数据

1. 直接编辑 `docs/public/commands.json`
2. 刷新页面即可看到更新（开发模式下）

## 部署

### GitHub Pages

1. Fork 本仓库
2. 推送代码到 `main` 分支
3. GitHub Actions 自动构建部署
4. 访问 `https://yourusername.github.io/repo-name/`

### 手动部署

```bash
npm run build
# 上传 docs/.vitepress/dist/ 到服务器
```

## 项目结构

```
copy_skill/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mjs              # VitePress 配置
│   │   ├── theme/
│   │   │   ├── index.ts           # 主题入口
│   │   │   ├── CommandLayout.vue  # 主布局组件
│   │   │   └── style.css          # 样式
│   │   └── public/                # 静态资源
│   │       ├── commands.json      # 命令数据
│   │       └── service-worker.js  # PWA 服务worker
│   ├── index.md
│   └── commands.md
├── package.json
└── README.md
```

## 自定义

### 修改标题

编辑 `docs/.vitepress/config.mjs`:

```javascript
export default defineConfig({
  title: '你的标题',
  description: '站点描述'
})
```

### 修改主题色

编辑 `docs/.vitepress/theme/style.css` 中的 CSS 变量。

## 技术栈

- **框架**: VitePress
- **UI**: Vue 3 + Composition API
- **样式**: CSS3 + CSS Variables
- **部署**: GitHub Pages
- **PWA**: Service Worker

## License

MIT
