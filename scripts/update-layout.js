#!/usr/bin/env node
/**
 * Copy Skill - 布局配置脚本
 * 用法: node scripts/update-layout.js --add-folder "新文件夹"
 *        node scripts/update-layout.js --list
 *        node scripts/update-layout.js --config ./layout-config.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`)
}

// 布局配置文件路径
const LAYOUT_CONFIG_PATH = path.join(rootDir, 'docs/.vitepress/layout.config.json')

// 默认布局配置
const defaultConfig = {
  siteTitle: 'Copy Skill',
  logo: '/logo.svg',
  accentColor: '#f59e0b',
  sidebar: {
    collapsedByDefault: false,
    autoExpandCurrent: true
  },
  commands: {
    maxRecent: 20,
    showLineNumbers: false,
    copyFeedback: 'toast' // 'toast' | 'inline'
  },
  features: {
    favorites: true,
    recentUsed: true,
    keyboardNav: true,
    hoverPreview: true,
    commandPalette: true
  }
}

// 加载布局配置
function loadConfig() {
  if (fs.existsSync(LAYOUT_CONFIG_PATH)) {
    try {
      const saved = JSON.parse(fs.readFileSync(LAYOUT_CONFIG_PATH, 'utf-8'))
      return { ...defaultConfig, ...saved }
    } catch (err) {
      log.warn(`配置文件损坏，将使用默认配置: ${err.message}`)
    }
  }
  return { ...defaultConfig }
}

// 保存布局配置
function saveConfig(config) {
  fs.writeFileSync(LAYOUT_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  log.success('布局配置已保存')
}

// 显示当前配置
function showConfig() {
  const config = loadConfig()

  console.log(`\n${colors.cyan}当前布局配置:${colors.reset}\n`)

  console.log(`${colors.magenta}站点信息:${colors.reset}`)
  console.log(`  标题: ${config.siteTitle}`)
  console.log(`  Logo: ${config.logo}`)
  console.log(`  强调色: ${config.accentColor}`)

  console.log(`\n${colors.magenta}侧边栏:${colors.reset}`)
  console.log(`  默认折叠: ${config.sidebar.collapsedByDefault ? '是' : '否'}`)
  console.log(`  自动展开当前: ${config.sidebar.autoExpandCurrent ? '是' : '否'}`)

  console.log(`\n${colors.magenta}功能开关:${colors.reset}`)
  Object.entries(config.features).forEach(([key, value]) => {
    const labels = {
      favorites: '收藏夹',
      recentUsed: '最近使用',
      keyboardNav: '键盘导航',
      hoverPreview: 'Hover 预览',
      commandPalette: '命令面板'
    }
    console.log(`  ${labels[key] || key}: ${value ? '✓' : '✗'}`)
  })

  console.log(`\n${colors.magenta}命令设置:${colors.reset}`)
  console.log(`  最大最近记录: ${config.commands.maxRecent}`)
  console.log(`  复制反馈: ${config.commands.copyFeedback}`)

  return config
}

// 更新配置项
function updateConfig(key, value) {
  const config = loadConfig()
  const keys = key.split('.')
  const lastKey = keys.pop()

  let current = config
  for (const k of keys) {
    if (!(k in current)) {
      current[k] = {}
    }
    current = current[k]
  }

  // 解析值
  let parsedValue = value
  if (value === 'true') parsedValue = true
  else if (value === 'false') parsedValue = false
  else if (!isNaN(value) && value !== '' && /^[0-9]+(\.[0-9]+)?$/.test(value)) parsedValue = Number(value)

  current[lastKey] = parsedValue
  saveConfig(config)
  log.success(`已更新 ${key} = ${parsedValue}`)
}

// 从文件加载配置
function loadConfigFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log.error(`文件不存在: ${filePath}`)
    process.exit(1)
  }

  try {
    const imported = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const config = { ...loadConfig(), ...imported }
    saveConfig(config)
    log.success(`已从文件加载配置: ${filePath}`)
    showConfig()
  } catch (err) {
    log.error(`加载失败: ${err.message}`)
    process.exit(1)
  }
}

// 重置为默认配置
function resetConfig() {
  if (fs.existsSync(LAYOUT_CONFIG_PATH)) {
    const backupPath = LAYOUT_CONFIG_PATH + '.backup'
    fs.copyFileSync(LAYOUT_CONFIG_PATH, backupPath)
    log.info(`已备份到: ${backupPath}`)
  }
  saveConfig(defaultConfig)
  log.success('已重置为默认配置')
  showConfig()
}

// 导出当前配置
function exportConfig(outputPath) {
  const config = loadConfig()
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf-8')
  log.success(`配置已导出: ${outputPath}`)
}

// 生成示例配置文件
function generateExample() {
  const examplePath = path.join(rootDir, 'layout.config.example.json')
  fs.writeFileSync(examplePath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
  log.success(`示例配置已生成: ${examplePath}`)
}

// 验证配置文件
function validateConfig() {
  const config = loadConfig()
  console.log(`\n${colors.cyan}配置验证:${colors.reset}\n`)

  const checks = [
    { name: '站点标题', pass: !!config.siteTitle },
    { name: '强调色格式', pass: /^#[0-9A-Fa-f]{6}$/.test(config.accentColor) },
    { name: '功能开关完整', pass: ['favorites', 'recentUsed', 'keyboardNav', 'hoverPreview', 'commandPalette'].every(k => k in config.features) },
    { name: '数值合理', pass: config.commands.maxRecent >= 1 && config.commands.maxRecent <= 100 }
  ]

  let allPassed = true
  checks.forEach(({ name, pass }) => {
    console.log(`  ${pass ? colors.green + '✓' : colors.red + '✗'} ${name}`)
    if (!pass) allPassed = false
  })

  if (allPassed) {
    log.success('所有检查通过')
  } else {
    log.warn('部分检查未通过，建议运行 --reset')
  }

  return allPassed
}

// 主函数
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showConfig()
    console.log(`\n${colors.cyan}可用命令:${colors.reset}
  ${colors.green}--show${colors.reset}                     显示当前配置
  ${colors.green}--set <key> <value>${colors.reset}       更新配置项
  ${colors.green}--import <file>${colors.reset}            从文件导入配置
  ${colors.green}--export <file>${colors.reset}            导出配置到文件
  ${colors.green}--example${colors.reset}                  生成示例配置文件
  ${colors.green}--validate${colors.reset}                  验证配置完整性
  ${colors.green}--reset${colors.reset}                    重置为默认配置

${colors.cyan}示例:${colors.reset}
  ${colors.yellow}node scripts/update-layout.js --set siteTitle "我的命令库"${colors.reset}
  ${colors.yellow}node scripts/update-layout.js --set accentColor "#10b981"${colors.reset}
  ${colors.yellow}node scripts/update-layout.js --set features.keyboardNav false${colors.reset}
  ${colors.yellow}node scripts/update-layout.js --import ./my-layout.json${colors.reset}
`)
    return
  }

  const command = args[0]

  switch (command) {
    case '--show':
      showConfig()
      break

    case '--set':
      if (args.length < 3) {
        log.error('用法: --set <key> <value>')
        process.exit(1)
      }
      updateConfig(args[1], args.slice(2).join(' '))
      break

    case '--import':
      if (!args[1]) {
        log.error('用法: --import <file>')
        process.exit(1)
      }
      loadConfigFromFile(path.resolve(process.cwd(), args[1]))
      break

    case '--export': {
      const exportPath = args[1] || 'layout.config.json'
      exportConfig(path.resolve(process.cwd(), exportPath))
      break
    }

    case '--example':
      generateExample()
      break

    case '--validate':
      validateConfig()
      break

    case '--reset':
      resetConfig()
      break

    default:
      log.error(`未知命令: ${command}`)
      process.exit(1)
  }
}

process.on('uncaughtException', (err) => {
  log.error(`未处理的错误: ${err.message}`)
  process.exit(1)
})

main()
