#!/bin/bash
# GitHub 自动部署脚本 (Linux/Mac)
# 使用方法: ./deploy-to-github.sh YOUR_USERNAME YOUR_REPO_NAME

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 参数检查
if [ $# -lt 2 ]; then
    echo -e "${RED}用法: $0 <用户名> <仓库名> [分支名] [--ssh]${NC}"
    echo "示例: $0 username smart-qa-v1.3 main"
    exit 1
fi

USERNAME=$1
REPO_NAME=$2
BRANCH=${3:-main}
USE_SSH=false

if [[ "$*" == *"--ssh"* ]]; then
    USE_SSH=true
fi

echo -e "${GREEN}🚀 开始 GitHub 自动部署...${NC}"
echo ""

# 检查 Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Git 已安装: $(git --version)${NC}"

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    echo -e "${RED}✗ 当前目录不是 Git 仓库${NC}"
    exit 1
fi

# 检查未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠ 检测到未提交的更改，正在添加...${NC}"
    git add .
    read -p "请输入提交信息（直接回车使用默认信息）: " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$commit_message"
    echo -e "${GREEN}✓ 更改已提交${NC}"
fi

# 设置远程仓库 URL
if [ "$USE_SSH" = true ]; then
    REMOTE_URL="git@github.com:$USERNAME/$REPO_NAME.git"
else
    REMOTE_URL="https://github.com/$USERNAME/$REPO_NAME.git"
fi

echo ""
echo -e "${CYAN}📦 配置远程仓库...${NC}"
echo "   仓库地址: $REMOTE_URL"

# 检查是否已存在远程仓库
EXISTING_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$EXISTING_REMOTE" ]; then
    echo -e "${YELLOW}⚠ 已存在远程仓库: $EXISTING_REMOTE${NC}"
    read -p "是否更新为新的仓库地址? (y/n): " update
    if [ "$update" = "y" ] || [ "$update" = "Y" ]; then
        git remote set-url origin "$REMOTE_URL"
        echo -e "${GREEN}✓ 远程仓库地址已更新${NC}"
    else
        echo -e "${CYAN}→ 使用现有远程仓库${NC}"
        REMOTE_URL=$EXISTING_REMOTE
    fi
else
    git remote add origin "$REMOTE_URL"
    echo -e "${GREEN}✓ 远程仓库已添加${NC}"
fi

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo -e "${CYAN}🌿 当前分支: $CURRENT_BRANCH${NC}"

# 如果分支名称不匹配，重命名分支
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo -e "${YELLOW}⚠ 分支名称不匹配，重命名为: $BRANCH${NC}"
    git branch -M "$BRANCH"
    CURRENT_BRANCH=$BRANCH
fi

# 尝试推送
echo ""
echo -e "${CYAN}📤 正在推送到 GitHub...${NC}"
echo "   分支: $CURRENT_BRANCH"
echo "   仓库: $REMOTE_URL"
echo ""

if git push -u origin "$CURRENT_BRANCH"; then
    echo ""
    echo -e "${GREEN}✅ 部署成功！${NC}"
    echo ""
    echo -e "${CYAN}🔗 仓库地址: https://github.com/$USERNAME/$REPO_NAME${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo ""
    echo -e "${YELLOW}可能的原因:${NC}"
    echo "1. 仓库不存在 - 请先在 GitHub 上创建仓库: https://github.com/new"
    echo "2. 认证失败 - 请使用 Personal Access Token 或配置 SSH key"
    echo "3. 权限不足 - 确保你有该仓库的写入权限"
    echo ""
    echo -e "${CYAN}手动创建仓库后，运行以下命令:${NC}"
    echo "  git push -u origin $CURRENT_BRANCH"
    echo ""
    exit 1
fi

echo -e "${GREEN}🎉 完成！${NC}"
