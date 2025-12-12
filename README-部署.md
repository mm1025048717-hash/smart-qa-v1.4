# 🚀 GitHub 部署 - 完整指南

## ✅ 已完成的准备工作

- ✓ Git 仓库已初始化
- ✓ 所有代码已提交
- ✓ 分支已重命名为 `main`
- ✓ `.gitignore` 已配置
- ✓ 部署脚本已创建

## 🎯 快速部署（3步完成）

### 方法 1: 使用一键部署脚本（推荐）

1. **在 PowerShell 中运行**：
   ```powershell
   .\一键部署.ps1
   ```
   
2. **按提示输入**：
   - GitHub 用户名
   - 仓库名（或直接回车使用默认值）

3. **在 GitHub 上创建仓库**（如果还没有）：
   - 访问：https://github.com/new
   - 仓库名：`smart-qa-v1.3`
   - 不要勾选 "Initialize with README"
   - 点击 "Create repository"

### 方法 2: 手动命令（最可靠）

**步骤 1: 在 GitHub 上创建仓库**
- 访问：https://github.com/new
- 填写信息后创建（不要初始化 README）

**步骤 2: 连接并推送**
```powershell
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
$username = "YOUR_USERNAME"
$repoName = "smart-qa-v1.3"

# 添加远程仓库
git remote add origin "https://github.com/$username/$repoName.git"

# 推送代码
git push -u origin main
```

**步骤 3: 如果提示认证**
- 使用 GitHub Personal Access Token 作为密码
- 获取 Token: https://github.com/settings/tokens
- 权限选择：`repo`

### 方法 3: 使用参数化脚本

```powershell
.\deploy-to-github.ps1 -Username "你的用户名" -RepoName "smart-qa-v1.3"
```

## 📋 当前状态

- **Git 用户**: mm1025048717-hash <mm1025048717@gmail.com>
- **当前分支**: main
- **提交记录**: 3 个提交
  - Initial commit: Smart QA Interface v1.3
  - Add automated deployment scripts
  - Add one-click deployment script

## 🔧 故障排除

### 问题 1: 推送时提示认证失败

**解决方案**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo`
4. 生成后复制 token
5. 推送时使用 token 作为密码

### 问题 2: 仓库已存在

**解决方案**：
```powershell
# 更新远程仓库地址
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 然后推送
git push -u origin main
```

### 问题 3: 分支名称冲突

**解决方案**：
```powershell
# 如果远程是 master，本地是 main
git push -u origin main:master

# 或者强制推送（谨慎使用）
git push -u origin main --force
```

## 📝 后续更新

每次修改代码后：
```powershell
git add .
git commit -m "描述你的修改"
git push
```

## 🎉 部署成功后

访问你的仓库：
```
https://github.com/YOUR_USERNAME/smart-qa-v1.3
```

## 💡 提示

- 如果使用 SSH，先配置 SSH key
- 如果使用 HTTPS，建议使用 Personal Access Token
- 首次推送可能需要几分钟，取决于网络速度
