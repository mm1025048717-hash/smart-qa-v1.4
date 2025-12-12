# 全自动 GitHub 部署脚本
# 自动检测并使用 GitHub CLI 或手动方式

param(
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "smart-qa-v1.3",
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "智能数据问答界面 - 动态分析叙事系统",
    
    [Parameter(Mandatory=$false)]
    [switch]$Private = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 全自动 GitHub 部署开始..." -ForegroundColor Green
Write-Host ""

# 检查 Git 配置
$gitUser = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitUser -or -not $gitEmail) {
    Write-Host "⚠ Git 用户信息未配置" -ForegroundColor Yellow
    $gitUser = Read-Host "请输入你的名字"
    $gitEmail = Read-Host "请输入你的邮箱"
    git config --global user.name $gitUser
    git config --global user.email $gitEmail
    Write-Host "✓ Git 用户信息已配置" -ForegroundColor Green
} else {
    Write-Host "✓ Git 用户: $gitUser <$gitEmail>" -ForegroundColor Green
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "📝 检测到未提交的更改，正在提交..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto commit before deployment: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "✓ 更改已提交" -ForegroundColor Green
}

# 检查当前分支
$currentBranch = git branch --show-current
if ($currentBranch -ne $Branch) {
    Write-Host "🌿 重命名分支: $currentBranch -> $Branch" -ForegroundColor Cyan
    git branch -M $Branch
    $currentBranch = $Branch
}

# 尝试使用 GitHub CLI
$useGH = $false
try {
    $ghVersion = gh --version 2>$null
    if ($ghVersion) {
        Write-Host "✓ 检测到 GitHub CLI" -ForegroundColor Green
        
        # 检查是否已登录
        $ghAuth = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ GitHub CLI 已登录" -ForegroundColor Green
            $useGH = $true
        } else {
            Write-Host "⚠ GitHub CLI 未登录" -ForegroundColor Yellow
            Write-Host "正在尝试登录..." -ForegroundColor Cyan
            gh auth login
            if ($LASTEXITCODE -eq 0) {
                $useGH = $true
            }
        }
    }
} catch {
    Write-Host "ℹ 未安装 GitHub CLI，将使用手动方式" -ForegroundColor Gray
}

if ($useGH) {
    Write-Host ""
    Write-Host "📦 使用 GitHub CLI 创建仓库..." -ForegroundColor Cyan
    
    $visibility = if ($Private) { "private" } else { "public" }
    
    try {
        # 创建仓库
        gh repo create $RepoName --description $Description --$visibility --source=. --remote=origin --push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 部署成功！" -ForegroundColor Green
            Write-Host ""
            $username = (gh api user | ConvertFrom-Json).login
            Write-Host "🔗 仓库地址: https://github.com/$username/$RepoName" -ForegroundColor Cyan
            Write-Host ""
            exit 0
        }
    } catch {
        Write-Host "⚠ GitHub CLI 创建失败，切换到手动方式" -ForegroundColor Yellow
        $useGH = $false
    }
}

# 手动方式
Write-Host ""
Write-Host "📋 手动部署步骤:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 在浏览器中打开: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. 填写以下信息:" -ForegroundColor Yellow
Write-Host "   - Repository name: $RepoName" -ForegroundColor White
Write-Host "   - Description: $Description" -ForegroundColor White
Write-Host "   - Visibility: $(if ($Private) { 'Private' } else { 'Public' })" -ForegroundColor White
Write-Host "   - 不要勾选 'Initialize with README'" -ForegroundColor White
Write-Host "3. 点击 'Create repository'" -ForegroundColor Yellow
Write-Host ""

$username = Read-Host "请输入你的 GitHub 用户名"

if (-not $username) {
    Write-Host "❌ 用户名不能为空" -ForegroundColor Red
    exit 1
}

$remoteUrl = "https://github.com/$username/$RepoName.git"

# 检查是否已存在远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠ 已存在远程仓库: $existingRemote" -ForegroundColor Yellow
    $update = Read-Host "是否更新? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin $remoteUrl
    } else {
        $remoteUrl = $existingRemote
    }
} else {
    git remote add origin $remoteUrl
}

Write-Host ""
Write-Host "📤 正在推送代码..." -ForegroundColor Cyan

try {
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 仓库地址: https://github.com/$username/$RepoName" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ 推送失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "请确保:" -ForegroundColor Yellow
    Write-Host "1. 已在 GitHub 上创建仓库" -ForegroundColor Gray
    Write-Host "2. 使用正确的认证方式（Token 或 SSH）" -ForegroundColor Gray
    Write-Host ""
    Write-Host "手动推送命令:" -ForegroundColor Cyan
    Write-Host "  git push -u origin $currentBranch" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "🎉 完成！" -ForegroundColor Green
