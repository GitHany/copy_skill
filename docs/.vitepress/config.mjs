import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Copy Skill',
  description: '命令参考文档工具 - 左侧导航 + 右侧详情面板 + 一键复制',

  base: '/copy_skill/',

  head: [
    // PWA Meta
    ['link', { rel: 'manifest', href: '/copy_skill/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#f59e0b' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['link', { rel: 'apple-touch-icon', href: '/copy_skill/pwa-512x512.svg' }],
    // SEO
    ['meta', { name: 'description', content: '命令参考文档工具，支持一键复制、搜索、收藏' }],
    ['meta', { property: 'og:title', content: 'Copy Skill - 命令参考文档' }],
    ['meta', { property: 'og:description', content: '高效的命令管理工具，支持一键复制和快速搜索' }],
    ['meta', { property: 'og:type', content: 'website' }],
    // Favicon - use default VitePress favicon
  ],

  themeConfig: {
    logo: '/copy_skill/logo.svg',
    siteTitle: 'Copy Skill',

    nav: [
      { text: '首页', link: '/copy_skill/' },
      { text: '命令列表', link: '/copy_skill/commands' }
    ],

    sidebar: {
      '/copy_skill/commands': [
        {
          text: '命令列表',
          items: []
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  },

  markdown: {
    lineNumbers: false
  },

  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'esbuild'
    }
  }
})
