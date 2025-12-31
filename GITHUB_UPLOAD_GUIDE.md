# GitHub代码上传指南

## 1. 安装Git

### Windows系统：
1. 访问 [Git官网](https://git-scm.com/download/win)
2. 下载适合您系统的版本（通常是64位版本）
3. 运行下载的安装程序，按照默认设置进行安装

### 验证安装：
打开命令提示符（CMD）或PowerShell，运行：
```bash
git --version
```

## 2. 配置Git（首次使用）

在命令提示符或PowerShell中运行：

```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱@example.com"
```

## 3. 在GitHub上创建新仓库

1. 访问 [GitHub](https://github.com)
2. 登录您的账户
3. 点击右上角的"+"按钮，选择"New repository"
4. 填写仓库信息：
   - Repository name: 仓库名称（建议使用项目名称，如"shopping-website"）
   - Description: 项目描述（可选）
   - 选择"Public"或"Private"
   - 勾选"Add a README file"（如果需要）
5. 点击"Create repository"

## 4. 将本地代码上传到GitHub

### 4.1 初始化Git仓库
在项目目录（D:\trae\shopping web）中打开命令提示符或PowerShell，运行：

```bash
git init
```

### 4.2 添加文件到Git
```bash
git add .
```

### 4.3 提交代码
```bash
git commit -m "Initial commit: 完整的购物网站项目"
```

### 4.4 添加远程仓库
将下面的`YOUR_USERNAME`和`YOUR_REPOSITORY_NAME`替换为您实际的GitHub用户名和仓库名：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

### 4.5 上传到GitHub
```bash
git branch -M main
git push -u origin main
```

## 5. 常用Git命令

### 查看仓库状态
```bash
git status
```

### 查看提交历史
```bash
git log --oneline
```

### 创建新分支
```bash
git branch branch-name
```

### 切换分支
```bash
git checkout branch-name
```

### 合并分支
```bash
git checkout main
git merge branch-name
```

### 更新本地仓库
```bash
git pull origin main
```

## 6. 重要注意事项

1. **敏感信息**: 确保不要上传包含敏感信息的文件（如数据库密码、API密钥等）
2. **文件大小**: GitHub对单个文件大小有限制（100MB），大文件请使用Git LFS
3. **README**: 建议在仓库根目录添加README.md文件，说明项目功能和使用方法
4. **许可证**: 考虑添加许可证文件（如MIT LICENSE）

## 7. 快速检查列表

- [ ] Git已安装并配置
- [ ] .gitignore文件已创建
- [ ] GitHub仓库已创建
- [ ] 代码已提交并推送到GitHub
- [ ] README文件已添加

## 8. 故障排除

### 如果遇到推送被拒绝：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 如果需要修改远程仓库地址：
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

## 9. 下一步

上传完成后，您可以：
- 在GitHub上查看您的代码
- 分享仓库链接给其他人
- 继续开发并定期推送更新
- 使用GitHub Pages部署静态网站（如果适用）