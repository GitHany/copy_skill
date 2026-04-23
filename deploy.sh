#!/bin/bash
# Copy Skill - 一键部署脚本

set -e

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Copy Skill 部署脚本${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js 未安装${NC}"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# 安装依赖
echo -e "\n${YELLOW}→ 安装依赖...${NC}"
if ! npm install; then
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi

# 构建
echo -e "\n${YELLOW}→ 构建生产版本...${NC}"
if ! npm run build; then
    echo -e "${RED}✗ 构建失败${NC}"
    exit 1
fi

# 检查构建输出
if [ ! -d "docs/.vitepress/dist" ]; then
    echo -e "${RED}✗ 构建失败，输出目录不存在${NC}"
    exit 1
fi

# 显示构建产物大小
echo -e "\n${BLUE}构建产物大小:${NC}"
du -sh docs/.vitepress/dist 2>/dev/null || dir_size=$(du -sh docs/.vitepress/dist 2>/dev/null)
echo -e "${GREEN}✓ 构建成功${NC}"

# 部署选项
echo -e "\n${BLUE}部署方式:${NC}"
echo -e "  ${GREEN}1${NC}. GitHub Pages (需要 gh-pages 包)"
echo -e "  ${GREEN}2${NC}. GitHub Actions (推送到 main 分支)"
echo -e "  ${GREEN}3${NC}. 本地预览"
echo -e "  ${GREEN}4${NC}. 仅构建"

read -p "请选择 [1-4]: " choice

case $choice in
    1)
        # 检查 gh-pages
        if ! command -v gh-pages &> /dev/null; then
            echo -e "\n${YELLOW}→ 安装 gh-pages...${NC}"
            npm install -g gh-pages
        fi

        echo -e "\n${YELLOW}→ 部署到 GitHub Pages...${NC}"
        gh-pages -d docs/.vitepress/dist
        echo -e "${GREEN}✓ 部署完成!${NC}"
        ;;
    2)
        echo -e "\n${YELLOW}→ 推送代码到 GitHub...${NC}"
        git add -A
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo -e "${GREEN}✓ 代码已推送，GitHub Actions 将自动部署${NC}"
        ;;
    3)
        echo -e "\n${YELLOW}→ 启动预览服务器...${NC}"
        echo -e "访问 http://localhost:4173"
        npm run preview
        ;;
    4)
        echo -e "\n${GREEN}✓ 构建完成，文件位于 docs/.vitepress/dist/${NC}"
        ;;
    *)
        echo -e "${RED}✗ 无效选择${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
