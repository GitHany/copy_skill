#!/usr/bin/env node
/**
 * Copy Skill - JSON 导入脚本
 * 用法: npm run import -- your-commands.json
 *        npm run import:example
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
  cyan: '\x1b[36m'
}

const log = {
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`)
}

// 验证 JSON 数据结构
function validateData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('数据必须是对象')
  }
  if (!Array.isArray(data.data)) {
    throw new Error('数据结构必须包含 data 数组')
  }

  const validItems = data.data.filter(item => item.data && item.data.cmd)
  if (validItems.length === 0) {
    log.warn('警告: 没有找到有效命令')
  }

  return true
}

// 从数据生成侧边栏配置
function generateSidebar(data) {
  const folders = {}

  data.data.forEach(item => {
    if (!item.data || !item.data.cmd) return

    const dirPath = item.dirPath || '/'
    const cleanPath = dirPath.replace(/^\/|\/$/g, '')
    const parts = cleanPath.split('/')

    let current = folders
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath += '/' + part

      if (!current[part]) {
        current[part] = {
          name: part,
          path: currentPath,
          items: [],
          children: {}
        }
      }

      if (index === parts.length - 1) {
        current[part].items.push({
          name: item.name,
          keyword: item.keyword
        })
      }

      current = current[part].children
    })
  })

  return folders
}

// 打印树形结构
function printTree(folders, indent = 0) {
  const prefix = '  '.repeat(indent)

  Object.values(folders).forEach(folder => {
    console.log(`${prefix}[F] ${folder.name}/ (${folder.items.length} 条命令)`)

    if (Object.keys(folder.children).length > 0) {
      printTree(folder.children, indent + 1)
    }
  })
}

// 主函数
async function main() {
  const args = process.argv.slice(2)

  const options = {
    input: null,
    example: args.includes('--example'),
    dryRun: args.includes('--dry-run')
  }

  if (options.example) {
    options.input = path.join(rootDir, 'docs/public/commands.json')
    if (!fs.existsSync(options.input)) {
      log.error('示例文件不存在，请先创建 docs/public/commands.json')
      process.exit(1)
    }
  } else {
    const jsonArg = args.find(arg => arg.endsWith('.json') && !arg.startsWith('--'))
    if (jsonArg) {
      options.input = path.resolve(process.cwd(), jsonArg)
    }
  }

  if (!options.input) {
    console.log(`
${colors.cyan}Copy Skill - JSON 导入脚本${colors.reset}

用法:
  ${colors.green}npm run import -- <file.json>${colors.reset}   导入指定的 JSON 文件
  ${colors.green}npm run import:example${colors.reset}          使用 docs/public/commands.json

示例:
  ${colors.green}npm run import -- ./my-commands.json${colors.reset}
  ${colors.green}npm run import -- /path/to/hexhub-export.json${colors.reset}

参数:
  --dry-run    模拟运行，不实际写入文件
`)
    process.exit(1)
  }

  if (!fs.existsSync(options.input)) {
    log.error(`文件不存在: ${options.input}`)
    process.exit(1)
  }

  log.info(`读取文件: ${options.input}`)

  let rawData
  try {
    rawData = JSON.parse(fs.readFileSync(options.input, 'utf-8'))
  } catch (err) {
    log.error(`JSON 解析失败: ${err.message}`)
    process.exit(1)
  }

  try {
    validateData(rawData)
  } catch (err) {
    log.error(`数据验证失败: ${err.message}`)
    process.exit(1)
  }

  // 统计
  const totalItems = rawData.data.length
  const commands = rawData.data.filter(item => item.data && item.data.cmd)
  const folderItems = rawData.data.filter(item => !item.data || !item.data.cmd)

  console.log(`\n${colors.cyan}数据统计:${colors.reset}`)
  console.log(`  总条目: ${totalItems}`)
  console.log(`  命令数: ${commands.length}`)
  console.log(`  文件夹: ${folderItems.length}`)

  // 生成侧边栏结构
  const sidebar = generateSidebar(rawData)

  console.log(`\n${colors.cyan}目录结构:${colors.reset}`)
  printTree(sidebar)

  const outputPath = path.join(rootDir, 'docs/public/commands.json')
  console.log(`\n${colors.cyan}输出路径:${colors.reset} ${outputPath}`)

  if (options.dryRun) {
    log.warn('Dry run 模式 - 未写入文件')
    process.exit(0)
  }

  // 备份原文件
  if (fs.existsSync(outputPath)) {
    const backupPath = path.join(rootDir, `docs/public/commands.backup.${Date.now()}.json`)
    fs.copyFileSync(outputPath, backupPath)
    log.success(`已备份原文件: docs/public/commands.backup.${Date.now()}.json`)
  }

  // 写入文件
  fs.writeFileSync(outputPath, JSON.stringify(rawData, null, 2), 'utf-8')
  log.success('命令数据已更新!')

  console.log(`\n${colors.green}导入完成!${colors.reset}`)
  console.log(`  运行 ${colors.cyan}npm run dev${colors.reset} 查看效果`)
  console.log(`  运行 ${colors.cyan}npm run build${colors.reset} 构建生产版本`)
}

process.on('uncaughtException', (err) => {
  log.error(`未处理的错误: ${err.message}`)
  process.exit(1)
})

main()
