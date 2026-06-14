# 优购商城 - 电商购物平台

基于 Node.js + Express 的完整前后端分离电商系统。

## 功能特性

- **用户认证**: 注册、登录、JWT Token 验证
- **商品管理**: 商品列表、分类筛选、搜索、详情
- **购物车**: 添加商品、修改数量、删除、清空
- **订单系统**: 创建订单、支付、取消、确认收货
- **个人中心**: 查看个人信息、修改密码

## 技术栈

- **后端**: Node.js + Express + JWT + bcryptjs
- **前端**: 原生 HTML/CSS/JavaScript
- **数据存储**: JSON 文件（轻量级，无需数据库）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
# Windows
start.bat

# 或手动启动
node server/index.js
```

### 3. 访问应用

打开浏览器访问: http://localhost:3000/

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/register | POST | 用户注册 |
| /api/auth/login | POST | 用户登录 |
| /api/auth/profile | GET | 获取用户信息 |
| /api/auth/profile | PUT | 更新用户信息 |
| /api/auth/password | PUT | 修改密码 |
| /api/products | GET | 商品列表 |
| /api/products/:id | GET | 商品详情 |
| /api/orders | GET | 订单列表 |
| /api/orders | POST | 创建订单 |
| /api/orders/:id/pay | POST | 支付订单 |
| /api/orders/:id/cancel | POST | 取消订单 |
| /api/orders/:id/confirm | POST | 确认收货 |

## 项目结构

```
.
├── server/              # 后端服务
│   ├── index.js        # 入口文件
│   ├── routes/         # 路由模块
│   │   ├── auth.js     # 认证路由
│   │   ├── products.js # 商品路由
│   │   └── orders.js  # 订单路由
│   ├── middleware/     # 中间件
│   │   └── auth.js    # 认证中间件
│   └── utils/          # 工具模块
│       ├── db.js      # 数据库操作
│       └── jwt.js     # JWT 工具
├── src/                # 前端模块
│   ├── api.js         # API 服务层
│   └── store.js       # 状态管理
├── public/             # 静态资源目录
├── data/              # 数据存储目录
├── index.html         # 主页面
├── styles.css         # 样式文件
├── app.js             # 核心业务逻辑
└── package.json      # 项目配置
```

## 测试账号

注册后即可登录使用。

## 注意事项

- 后端服务运行在端口 3000
- 数据存储在 `data/` 目录的 JSON 文件中
- JWT Token 有效期为 7 天
- 订单支付为模拟流程，实际不会扣款
