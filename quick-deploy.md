# 快速部署指南

## 🚀 一键部署（需要先创建 GitHub 仓库）

### Windows (PowerShell)

```powershell
.\deploy-to-github.ps1 -Username "你的GitHub用户名" -RepoName "smart-qa-v1.3"
```

### Linux/Mac (Bash)

```bash
chmod +x deploy-to-github.sh
./deploy-to-github.sh 你的GitHub用户名 smart-qa-v1.3
```

## 📝 步骤说明

1. **先在 GitHub 上创建仓库**（必须手动完成）：
   - 访问 https://github.com/new
   - 仓库名：`smart-qa-v1.3`
   - 不要初始化 README
   - 点击创建

2. **运行部署脚本**：
   - Windows: 在 PowerShell 中运行上面的命令
   - Linux/Mac: 在终端中运行上面的命令

3. **如果提示认证**：
   - 使用 GitHub Personal Access Token 作为密码
   - 获取 Token: GitHub Settings → Developer settings → Personal access tokens → Generate new token
   - 权限选择：`repo`

## ⚡ 手动快速部署（如果脚本不工作）

```bash
# 1. 添加远程仓库（替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 2. 重命名分支为 main（如果需要）
git branch -M main

# 3. 推送代码
git push -u origin main
```
