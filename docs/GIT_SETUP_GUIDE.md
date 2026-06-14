# 优购商城 - Git 仓库设置与推送指南

## ⚠️ 当前机器环境说明

| 项 | 状态 |
|:---:|:---:|
| Node.js | ✅ 已安装 (v24.16.0) |
| npm | ✅ 已安装 |
| **Git** | ❌ **未安装** |

由于当前开发机器未安装 Git 客户端，无法自动执行 `git init` 和 `git push` 命令。**请参考本章节手动完成 Git 仓库初始化与推送。**

---

## 第一步：安装 Git

### Windows 安装步骤

**方式 1：官网下载（推荐）**
1. 访问 <https://git-scm.com/download/win>
2. 下载最新的 Git for Windows（64-bit）
3. 运行安装程序，所有选项保持默认即可
4. 安装完成后，**重启终端或 PowerShell**
5. 验证安装：
   ```bash
   git --version
   ```
   应显示类似 `git version 2.45.0.windows.1`

**方式 2：使用 winget（最快）**
```powershell
winget install --id Git.Git -e --source winget
```

**方式 3：使用 Chocolatey**
```powershell
choco install git
```

### 验证安装

打开新的 PowerShell 或命令行窗口，执行：

```bash
git --version
```

---

## 第二步：配置 Git 用户信息

安装完成后，在项目目录中执行：

```bash
cd d:\编程\web

git config user.name "Your Name"
git config user.email "your.email@example.com"
```

**如需全局配置（所有项目）**：
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

查看配置：
```bash
git config --list
```

---

## 第三步：创建远程仓库

### 选项 A：GitHub（推荐，国际通用）

1. 访问 <https://github.com/new>
2. 填写信息：
   - **Repository name**: `yougou-mall`（或 `ecommerce-mall`）
   - **Description**: `优购商城 - 基于 Node.js + Express 的电商购物平台`
   - **Type**: `Public`（公开，免费）或 `Private`（私有）
   - **不勾选** "Initialize this repository with a README"（已有）
3. 点击 **Create repository**
4. 记录生成的仓库地址，如：
   ```
   https://github.com/your-username/yougou-mall.git
   ```

### 选项 B：Gitee（国内用户推荐，访问速度快）

1. 访问 <https://gitee.com/projects/new>
2. 填写信息：
   - **仓库名称**: `yougou-mall`
   - **介绍**: `优购商城电商平台 - Node.js + Express`
   - **是否开源**: 开源（公开）
   - **不勾选** 使用Readme文件初始化
3. 点击 **创建**
4. 记录仓库地址，如：
   ```
   https://gitee.com/your-username/yougou-mall.git
   ```

---

## 第四步：初始化本地仓库并提交

在项目目录 `d:\编程\web` 中依次执行以下命令：

### 4.1 初始化 Git 仓库

```bash
cd d:\编程\web
git init
```

应显示：
```
Initialized empty Git repository in D:/编程/web/.git/
```

### 4.2 检查 .gitignore

已为您创建 `.gitignore` 文件，内容包括：

```
node_modules/
server/data/*.json
*.log
.env
.vscode/
.idea/
.DS_Store
dist/
build/
```

### 4.3 添加所有文件到暂存区

```bash
git add .
```

查看文件列表（确认没有意外添加的文件）：
```bash
git status
```

预期的文件结构：

```
.gitignore
README.md
index.html
styles.css
app.js
package.json
package-lock.json
start.bat
start.ps1
run.bat
src/
  ├── api.js
  └── store.js
server/
  ├── index.js
  ├── middleware/
  │   └── auth.js
  ├── routes/
  │   ├── auth.js
  │   ├── products.js
  │   └── orders.js
  ├── utils/
  │   ├── db.js
  │   └── jwt.js
  └── data/
      └── .gitkeep
docs/
  ├── IMPLEMENTATION.md
  ├── schema.sql
  ├── API.md
  ├── TEST_REPORT.md
  └── AI_PROMPTS.md
```

### 4.4 创建首次提交

```bash
git commit -m "feat: 优购商城电商平台 v1.0.0 初始版本

- 用户认证系统（JWT Token + bcrypt 密码加密）
- 商品系统（分类、搜索、排序、详情）
- 购物车（本地存储、增删改查、总价计算）
- 订单系统（创建、查询、支付、取消、确认收货）
- 用户中心（个人信息、修改密码）
- 完整 API 接口（15个，RESTful 设计）
- 前后端分离架构（Express + 原生 HTML/CSS/JS）
- 工程化代码结构（路由、中间件、工具层分层）
- 数据库表结构 SQL（MySQL，8个核心表）
- 详细文档（实现思路、API文档、测试报告）"
```

应显示类似：
```
[main (root-commit) abc1234] feat: 优购商城电商平台 v1.0.0 初始版本
 30 files changed, 8500 insertions(+)
 ...
```

---

## 第五步：推送到远程仓库

### 如果使用 GitHub

```bash
# 1. 添加远程仓库（替换 your-username 为你的 GitHub 用户名）
git remote add origin https://github.com/your-username/yougou-mall.git

# 2. 重命名主分支为 main（如需要）
git branch -M main

# 3. 推送到远程
git push -u origin main
```

### 如果使用 Gitee

```bash
# 1. 添加远程仓库（替换 your-username 为你的 Gitee 用户名）
git remote add origin https://gitee.com/your-username/yougou-mall.git

# 2. 重命名主分支为 master（Gitee 默认用 master）
git branch -M master

# 3. 推送到远程
git push -u origin master
```

### 首次推送时的身份验证

**方式 1：使用 Personal Access Token（推荐）**

GitHub: Settings → Developer settings → Personal access tokens → Generate new token
Gitee: 设置 → 私人令牌 → 生成新令牌

使用 Token 作为密码：
```bash
# 推送到 GitHub
git push -u origin main
# Username: your-username
# Password: your-personal-access-token (ghp_xxxx...)

# 推送到 Gitee
git push -u origin master
# Username: your-username
# Password: your-personal-access-token
```

**方式 2：使用 SSH Key（更便捷）**

```bash
# 1. 生成 SSH Key
ssh-keygen -t ed25519 -C "your.email@example.com"
# 连续按回车使用默认设置

# 2. 查看公钥
cat ~/.ssh/id_ed25519.pub

# 3. 复制公钥内容，粘贴到 GitHub/Gitee 的 SSH Key 设置页面
# GitHub: Settings → SSH and GPG keys → New SSH key
# Gitee: 设置 → SSH 公钥

# 4. 测试连接
ssh -T git@github.com
# 或
ssh -T git@gitee.com

# 5. 使用 SSH 协议推送
git remote set-url origin git@github.com:your-username/yougou-mall.git
git push -u origin main
```

---

## 第六步：验证推送结果

### 查看远程仓库

打开浏览器访问：
- **GitHub**: `https://github.com/your-username/yougou-mall`
- **Gitee**: `https://gitee.com/your-username/yougou-mall`

确认：
- ✅ 文件列表与本地一致
- ✅ README.md 正常显示
- ✅ docs 目录下的文档都存在
- ✅ Commit 信息正确

### 常用 Git 操作

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline -10

# 查看远程仓库配置
git remote -v

# 克隆仓库（在其他机器上）
git clone https://github.com/your-username/yougou-mall.git

# 后续修改后提交
git add .
git commit -m "fix: 修复 xxx 问题"
git push

# 拉取远程更新
git pull
```

---

## 推荐的远程仓库地址

请从中选择一个或两个都配置：

| 平台 | 仓库地址格式 | 适合人群 |
|:---:|:---|:---:|
| **GitHub** | `https://github.com/your-username/yougou-mall` | 国际开发者、求职展示 |
| **Gitee** | `https://gitee.com/your-username/yougou-mall` | 国内用户、访问速度快 |

---

## 完整的项目元信息建议

### 仓库描述

**中文**:
```
优购商城 - 基于 Node.js + Express 的完整电商购物平台
功能：用户认证(JWT)、商品管理、购物车、订单系统、用户中心
全栈项目，前后端分离，包含完整 API 文档和数据库设计
```

**英文**:
```
YouGou Mall - A complete e-commerce platform built with Node.js and Express
Features: JWT auth, Product management, Shopping cart, Order system, User center
Full-stack project with RESTful API, MySQL schema, and comprehensive documentation
```

### 推荐的 Topics / 标签

`nodejs`, `express`, `ecommerce`, `javascript`, `rest-api`, `jwt`, `shopping-cart`, `order-management`, `full-stack`, `mysql`

### README.md 已包含的内容

- ✅ 项目介绍与功能特性
- ✅ 技术栈说明
- ✅ 快速开始指南
- ✅ API 接口清单
- ✅ 项目结构说明
- ✅ 测试说明

---

## 快速命令汇总

将以下命令复制到终端执行，**只需替换 your-username 和 your-email**：

```bash
# ============== 一次性配置 ==============
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# ============== 在项目目录中执行 ==============
cd d:\编程\web

# 初始化仓库
git init

# 添加文件
git add .

# 查看状态（确认文件列表）
git status

# 创建提交
git commit -m "feat: 优购商城电商平台 v1.0.0 初始版本"

# ============== GitHub 推送 ==============
# 创建仓库：https://github.com/new
git remote add origin https://github.com/your-username/yougou-mall.git
git branch -M main
git push -u origin main

# ============== Gitee 推送（可选）==============
# 创建仓库：https://gitee.com/projects/new
git remote add origin https://gitee.com/your-username/yougou-mall.git
git branch -M master
git push -u origin master
```

---

## 截图要求

在推送成功后，请对以下场景进行截图：

### 截图 1：终端推送成功

```
$ git push -u origin main
Enumerating objects: 85, done.
Counting objects: 100% (85/85), done.
Delta compression using up to 8 threads
Compressing objects: 100% (75/75), done.
Writing objects: 100% (85/85), 120.34 KiB | 15.04 MiB/s, done.
Total 85 (delta 15), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (15/15), done.
To https://github.com/your-username/yougou-mall.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 截图 2：GitHub/Gitee 仓库首页

显示：
- 仓库名、描述
- 文件列表
- README 预览
- 提交信息

### 截图 3：项目文件列表

点击 `server/`、`src/`、`docs/` 目录，展示文件结构

---

## 常见问题

**Q: 提示 "fatal: remote origin already exists"**
```bash
git remote remove origin
# 然后重新 add remote
```

**Q: Git 显示大量换行符警告 (LF/CRLF)**
```bash
git config --global core.autocrlf true
```

**Q: 推送时提示 "Permission denied"**

确认已正确配置 Personal Access Token 或 SSH Key，确保 Token 有 repo 权限

**Q: package-lock.json 很大要不要上传？**

**要上传**。它锁定了依赖版本，保证其他开发者安装相同版本。node_modules/ 已在 .gitignore 中排除。

---

**文档生成时间**: 2026-06-14
**Git 安装指南版本**: v1.0
**推荐 Git 版本**: >= 2.40.0
