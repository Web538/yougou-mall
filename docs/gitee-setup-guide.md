# 远程仓库提交指南

## 环境说明

由于当前运行环境无法直接访问 Git 命令行工具，请按照以下步骤手动将项目提交到远程仓库。

## 方案一：使用 Gitee（推荐）

### 1. 注册/登录 Gitee
访问 https://gitee.com/ 注册账号或登录

### 2. 创建仓库
1. 点击右上角 "+" 号 -> "新建仓库"
2. 仓库名称：`yougou-mall`
3. 仓库介绍：优购商城 - 基于 Node.js + Express 的电商购物平台
4. 选择 "公开" 或 "私有"
5. 勾选 "使用 README 文件初始化仓库"（可选）
6. 点击 "创建"

### 3. 本地初始化 Git 仓库

在项目根目录打开命令行，执行：

```bash
# 进入项目目录
cd d:\编程\web

# 初始化 Git 仓库
git init

# 添加所有文件到暂存区
git add .

# 提交到本地仓库
git commit -m "feat: 完善电商购物平台，添加用户登录和订单查询功能

- 实现 JWT Token 用户认证机制
- 实现订单列表查询（支持状态筛选和分页）
- 优化前后端代码工程化规范
- 添加登录验证原理说明文档
- 添加订单查询功能说明文档"

# 添加远程仓库（将下面的 URL 替换为你的 Gitee 仓库地址）
git remote add origin https://gitee.com/你的用户名/yougou-mall.git

# 推送到远程仓库
git push -u origin master
# 或如果是 main 分支
git push -u origin main
```

### 4. 提交截图

推送成功后，在浏览器中打开 Gitee 仓库页面，截图保存。

## 方案二：使用 GitHub

### 1. 注册/登录 GitHub
访问 https://github.com/ 注册账号或登录

### 2. 创建仓库
1. 点击右上角 "+" 号 -> "New repository"
2. Repository name：`yougou-mall`
3. Description：优购商城 - 基于 Node.js + Express 的电商购物平台
4. 选择 "Public" 或 "Private"
5. 点击 "Create repository"

### 3. 推送代码

```bash
# 进入项目目录
cd d:\编程\web

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 完善电商购物平台，添加用户登录和订单查询功能"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/yougou-mall.git

# 推送到远程仓库
git branch -M main
git push -u origin main
```

## 项目文件清单

提交到远程仓库的文件包括：

```
yougou-mall/
├── docs/                               # 文档目录
│   ├── login-auth-principle.md        # 登录验证原理说明
│   ├── order-query-process.md         # 订单查询功能说明
│   ├── ai-prompts.md                  # AI 提问内容汇总
│   └── gitee-setup-guide.md           # 本指南
├── server/                             # 后端服务
│   ├── data/                          # 数据存储
│   │   ├── users.json
│   │   └── orders.json
│   ├── middleware/                    # 中间件
│   │   └── auth.js                    # 认证中间件
│   ├── routes/                        # 路由模块
│   │   ├── auth.js                    # 认证路由
│   │   ├── products.js                # 商品路由
│   │   └── orders.js                  # 订单路由
│   ├── utils/                         # 工具模块
│   │   ├── db.js                      # 数据库操作
│   │   └── jwt.js                     # JWT 工具
│   └── index.js                       # 后端入口
├── src/                                # 前端模块
│   ├── api.js                         # API 服务层
│   └── store.js                       # 状态管理
├── index.html                          # 主页面
├── styles.css                          # 样式文件
├── app.js                              # 核心业务逻辑
├── package.json                        # 项目配置
└── README.md                           # 项目说明
```

## 注意事项

1. **node_modules 目录**：不需要提交到远程仓库，已在 .gitignore 中排除
2. **data 目录**：包含用户和订单数据，开发环境数据可以提交，生产环境建议排除
3. **提交信息**：使用规范的提交信息格式，如 `feat:`, `fix:`, `docs:` 等前缀

## 截图要求

提交成功后，请截取以下页面：

1. **仓库首页**：显示仓库名称、描述、文件列表
2. **提交记录**：显示 commit 历史
3. **代码文件**：显示关键代码文件（如 server/routes/auth.js）

将截图保存到 `docs/screenshots/` 目录下。
