# 优购商城 - API 接口代码文档

## 目录

1. [后端入口 (server/index.js)](#1-后端入口)
2. [认证路由 (server/routes/auth.js)](#2-认证路由)
3. [商品路由 (server/routes/products.js)](#3-商品路由)
4. [订单路由 (server/routes/orders.js)](#4-订单路由)
5. [认证中间件 (server/middleware/auth.js)](#5-认证中间件)
6. [数据库工具 (server/utils/db.js)](#6-数据库工具)
7. [JWT 工具 (server/utils/jwt.js)](#7-jwt-工具)
8. [前端 API 服务层 (src/api.js)](#8-前端-api-服务层)
9. [前端状态管理 (src/store.js)](#9-前端状态管理)

---

## 1. 后端入口

**文件路径**: [server/index.js](file:///d:/编程/web/server/index.js)

**职责**:
- 初始化 Express 服务器
- 配置 CORS 跨域支持
- 注册全局中间件
- 挂载 API 路由
- 配置错误处理

```javascript
// 核心代码
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 配置
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// API 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 2. 认证路由

**文件路径**: [server/routes/auth.js](file:///d:/编程/web/server/routes/auth.js)

### 接口 1: 用户注册

| 项 | 值 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/auth/register` |
| **认证** | 否 |

**请求参数**:
```javascript
{
  "username": "testuser",       // 用户名 (3-20字符) 必填
  "email": "test@example.com",  // 邮箱 必填
  "password": "password123",    // 密码 (>=6位) 必填
  "phone": "13800001111"        // 手机号 选填
}
```

**响应示例** (201 Created):
```javascript
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a54a07ab-9646-440e-896e-72c0245f384a",
      "username": "testuser",
      "email": "test@example.com",
      "phone": "13800001111",
      "createdAt": "2026-06-14T06:22:37.347Z"
    }
  }
}
```

**错误响应** (409 Conflict):
```javascript
{
  "success": false,
  "message": "用户名已被注册"
}
```

**核心实现代码**:
```javascript
router.post('/register', async (req, res) => {
  const { username, email, password, phone } = req.body;

  // 参数校验
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ success: false, message: '用户名长度应为3-20个字符' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: '请输入有效的邮箱地址' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '密码长度至少为6个字符' });
  }

  // 唯一性检查
  if (db.findUserByUsername(username)) {
    return res.status(409).json({ success: false, message: '用户名已被注册' });
  }
  if (db.findUserByEmail(email)) {
    return res.status(409).json({ success: false, message: '邮箱已被注册' });
  }

  // bcrypt 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = db.createUser({
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    phone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 生成 Token
  const token = generateToken({ id: user.id, username: user.username, email: user.email });

  res.status(201).json({
    success: true,
    message: '注册成功',
    data: { token, user: {...} }
  });
});
```

---

### 接口 2: 用户登录

| 项 | 值 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/auth/login` |
| **认证** | 否 |

**请求参数**:
```javascript
{
  "username": "testuser",      // 用户名或邮箱 必填
  "password": "password123"    // 密码 必填
}
```

**响应示例** (200 OK):
```javascript
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a54a07ab-9646-440e-896e-72c0245f384a",
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

**错误响应** (401 Unauthorized):
```javascript
{
  "success": false,
  "message": "用户名或密码错误"
}
```

**核心实现代码**:
```javascript
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  // 查找用户 (支持用户名或邮箱登录)
  const user = db.findUserByUsername(username) || db.findUserByEmail(username);

  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  // bcrypt 验证密码
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  // 生成 Token
  const token = generateToken({ id: user.id, username: user.username, email: user.email });

  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

  res.json({ success: true, message: '登录成功', data: { token, user } });
});
```

---

### 接口 3: 获取用户信息

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/auth/profile` |
| **认证** | 是 (需要 Token) |

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例** (200 OK):
```javascript
{
  "success": true,
  "data": {
    "id": "a54a07ab-9646-440e-896e-72c0245f384a",
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800001111",
    "avatar": "",
    "createdAt": "2026-06-14T06:22:37.347Z",
    "lastLoginAt": "2026-06-14T06:23:15.501Z"
  }
}
```

---

### 接口 4: 更新用户信息

| 项 | 值 |
|---|---|
| **方法** | `PUT` |
| **路径** | `/api/auth/profile` |
| **认证** | 是 |

**请求参数**:
```javascript
{
  "phone": "13900002222",   // 选填
  "avatar": "https://..."  // 选填
}
```

---

### 接口 5: 修改密码

| 项 | 值 |
|---|---|
| **方法** | `PUT` |
| **路径** | `/api/auth/password` |
| **认证** | 是 |

**请求参数**:
```javascript
{
  "oldPassword": "password123",   // 必填 - 旧密码
  "newPassword": "newpass456"     // 必填 - 新密码
}
```

---

## 3. 商品路由

**文件路径**: [server/routes/products.js](file:///d:/编程/web/server/routes/products.js)

### 接口 6: 商品列表

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/products` |
| **认证** | 否 |

**查询参数**:
```
category=手机数码      // 按分类筛选（选填）
search=iphone          // 关键词搜索（选填）
sort=price-asc         // 排序: price-asc, price-desc, sales, rating（选填）
page=1                 // 页码（选填，默认1）
limit=12               // 每页数量（选填，默认12）
```

**请求示例**:
```
GET /api/products?category=手机数码&sort=sales&page=1&limit=12
```

**响应示例** (200 OK):
```javascript
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "Apple iPhone 15 Pro 256GB",
        "category": "手机数码",
        "price": 7999,
        "originalPrice": 8999,
        "icon": "📱",
        "rating": 4.8,
        "sales": 12580,
        "description": "搭载A17 Pro芯片..."
      }
      // ... 更多商品
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 24,
      "totalPages": 2
    }
  }
}
```

**核心实现代码**:
```javascript
router.get('/', (req, res) => {
  const { category, search, sort, page = 1, limit = 12 } = req.query;

  let result = [...products];  // products 是内存商品数组

  // 1. 分类筛选
  if (category && category !== '全部') {
    result = result.filter(p => p.category === category);
  }

  // 2. 关键词搜索
  if (search) {
    const kw = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.category.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw)
    );
  }

  // 3. 排序
  switch (sort) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'sales': result.sort((a, b) => b.sales - a.sales); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
  }

  // 4. 分页
  const total = result.length;
  const start = (page - 1) * limit;
  result = result.slice(start, start + parseInt(limit));

  res.json({
    success: true,
    data: {
      list: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});
```

---

### 接口 7: 获取分类

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/products/categories` |
| **认证** | 否 |

**响应示例**:
```javascript
{
  "success": true,
  "data": ["全部", "手机数码", "电脑办公", "家居生活", "服饰鞋包", "美妆护肤", "运动户外", "食品饮料"]
}
```

---

### 接口 8: 商品详情

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/products/:id` |
| **认证** | 否 |

**路径参数**:
```
:id = 商品ID (数字)
```

**响应示例** (200 OK):
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Apple iPhone 15 Pro 256GB",
    "category": "手机数码",
    "price": 7999,
    "originalPrice": 8999,
    "icon": "📱",
    "rating": 4.8,
    "sales": 12580,
    "description": "搭载A17 Pro芯片...",
    "specs": ["A17 Pro 处理器", "6.1英寸屏幕"]
  }
}
```

---

## 4. 订单路由

**文件路径**: [server/routes/orders.js](file:///d:/编程/web/server/routes/orders.js)

### 接口 9: 创建订单

| 项 | 值 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/orders` |
| **认证** | 是 |

**请求参数**:
```javascript
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ],
  "shipping": {
    "name": "张三",              // 必填
    "phone": "13800001111",     // 必填
    "region": "北京市朝阳区",    // 选填
    "address": "XX街XX号XX栋"  // 必填
  },
  "payment": "支付宝",           // 选填，默认支付宝
  "note": "请尽快发货"          // 选填
}
```

**响应示例** (201 Created):
```javascript
{
  "success": true,
  "message": "订单创建成功",
  "data": {
    "id": "ORD2026061414300840",
    "userId": "a54a07ab-9646-440e-896e-72c0245f384a",
    "items": [
      { "productId": 1, "name": "Apple iPhone 15 Pro", "icon": "📱", "price": 7999, "quantity": 2, "total": 15998 },
      { "productId": 2, "name": "Sony WH-1000XM5", "icon": "🎧", "price": 2299, "quantity": 1, "total": 2299 }
    ],
    "subtotal": 18297,
    "shippingFee": 0,
    "total": 18297,
    "status": "pending",
    "statusText": "待付款",
    "createdAt": "2026-06-14T14:30:08.400Z"
  }
}
```

**核心实现代码**:
```javascript
// 生成订单号
function generateOrderId() {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  return 'ORD' + timestamp + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// 计算订单金额
function calculateOrder(items) {
  let subtotal = 0;
  const orderItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    const price = product ? product.price : 0;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;
    return {
      productId: item.productId,
      name: product ? product.name : '未知商品',
      icon: product ? product.icon : '?',
      price,
      quantity: item.quantity,
      total: itemTotal
    };
  });
  const shippingFee = subtotal >= 99 ? 0 : 10;
  return { items: orderItems, subtotal, shippingFee, total: subtotal + shippingFee };
}

router.post('/', authMiddleware, (req, res) => {
  const { items, shipping, payment, note } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: '订单商品不能为空' });
  }
  if (!shipping || !shipping.name || !shipping.phone || !shipping.address) {
    return res.status(400).json({ success: false, message: '收货信息不完整' });
  }

  const { items: orderItems, subtotal, shippingFee, total } = calculateOrder(items);

  const order = {
    id: generateOrderId(),
    userId: req.user.id,
    items: orderItems,
    shipping,
    payment: payment || '支付宝',
    note: note || '',
    subtotal,
    shippingFee,
    total,
    status: 'pending',
    statusText: '待付款',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createOrder(order);
  res.status(201).json({ success: true, message: '订单创建成功', data: order });
});
```

---

### 接口 10: 订单列表

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/orders` |
| **认证** | 是 |

**查询参数**:
```
status=pending      // 筛选: pending待付款 / processing待发货 / shipped待收货 / completed已完成 / cancelled已取消（选填）
page=1              // 页码（选填，默认1）
limit=10            // 每页数量（选填，默认10）
```

**核心实现代码**:
```javascript
router.get('/', authMiddleware, (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let orders = db.getOrdersByUserId(req.user.id);

  // 按状态筛选
  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }

  // 按时间降序
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 分页
  const total = orders.length;
  const start = (page - 1) * limit;
  const list = orders.slice(start, start + parseInt(limit));

  res.json({
    success: true,
    data: {
      list,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});
```

---

### 接口 11: 订单数量统计

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/orders/count` |
| **认证** | 是 |

**响应示例**:
```javascript
{
  "success": true,
  "data": {
    "all": 5,
    "pending": 1,
    "processing": 1,
    "shipped": 1,
    "completed": 1,
    "cancelled": 1
  }
}
```

---

### 接口 12: 订单详情

| 项 | 值 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/orders/:id` |
| **认证** | 是 |

**路径参数**:
```
:id = 订单号 (ORD2026...)
```

---

### 接口 13: 支付订单

| 项 | 值 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/orders/:id/pay` |
| **认证** | 是 |

**响应示例**:
```javascript
{
  "success": true,
  "message": "支付成功",
  "data": {
    "orderId": "ORD2026061414300840"
  }
}
```

**支付后的自动状态流转**:
```
待付款 ──支付──► 待发货 (processing) ──3秒后自动──► 待收货 (shipped)
                                                          │
                                                     用户确认收货
                                                          │
                                                     已完成 (completed)
```

**状态校验逻辑**:
```javascript
router.post('/:id/pay', authMiddleware, (req, res) => {
  const order = db.findOrderByIdAndUser(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ success: false, message: '订单不存在' });
  }

  // 只有待付款状态才能支付
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: '当前订单状态不支持付款' });
  }

  // 1.5秒后变为待发货
  pendingTimers[order.id] = setTimeout(() => {
    db.updateOrder(order.id, req.user.id, {
      status: 'processing',
      statusText: '待发货',
      updatedAt: new Date().toISOString()
    });

    // 3秒后自动发货
    pendingTimers[order.id + '_ship'] = setTimeout(() => {
      db.updateOrder(order.id, req.user.id, {
        status: 'shipped',
        statusText: '待收货',
        updatedAt: new Date().toISOString()
      });
    }, 3000);
  }, 1500);

  res.json({ success: true, message: '支付成功' });
});
```

---

### 接口 14: 取消订单

| 项 | 值 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/orders/:id/cancel` |
| **认证** | 是 |

**状态限制**: 只有 `pending` (待付款) 或 `processing` (待发货) 状态可以取消

**核心代码**:
```javascript
router.post('/:id/cancel', authMiddleware, (req, res) => {
  const order = db.findOrderByIdAndUser(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ success: false, message: '订单不存在' });
  }

  if (order.status !== 'pending' && order.status !== 'processing') {
    return res.status(400).json({ success: false, message: '当前订单状态不支持取消' });
  }

  // 清除定时器
  if (pendingTimers[order.id]) {
    clearTimeout(pendingTimers[order.id]);
    delete pendingTimers[order.id];
  }

  db.updateOrder(order.id, req.user.id, {
    status: 'cancelled',
    statusText: '已取消',
    updatedAt: new Date().toISOString()
  });

  res.json({ success: true, message: '订单已取消' });
});
```

---

### 接口 15: 确认收货

| 项 | 值 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/orders/:id/confirm` |
| **认证** | 是 |

**状态限制**: 只有 `shipped` (待收货) 状态可以确认收货

**核心代码**:
```javascript
router.post('/:id/confirm', authMiddleware, (req, res) => {
  const order = db.findOrderByIdAndUser(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ success: false, message: '订单不存在' });
  }

  if (order.status !== 'shipped') {
    return res.status(400).json({ success: false, message: '当前订单状态不支持确认收货' });
  }

  db.updateOrder(order.id, req.user.id, {
    status: 'completed',
    statusText: '已完成',
    updatedAt: new Date().toISOString()
  });

  res.json({ success: true, message: '确认收货成功' });
});
```

---

## 5. 认证中间件

**文件路径**: [server/middleware/auth.js](file:///d:/编程/web/server/middleware/auth.js)

**核心代码**:
```javascript
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. 检查 Token 头
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌，请先登录'
    });
  }

  // 2. 解析 Bearer Token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: '令牌格式错误，应为: Bearer <token>'
    });
  }

  // 3. 验证 Token 有效性
  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期，请重新登录'
    });
  }

  // 4. 将用户信息附加到请求对象
  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email
  };

  next();
}

module.exports = { authMiddleware };
```

---

## 6. 数据库工具

**文件路径**: [server/utils/db.js](file:///d:/编程/web/server/utils/db.js)

**核心功能**:
- `getUsers()` - 获取所有用户
- `findUserByUsername(username)` - 按用户名查找
- `findUserByEmail(email)` - 按邮箱查找
- `createUser(user)` - 创建用户
- `updateUser(id, updates)` - 更新用户
- `getOrdersByUserId(userId)` - 获取用户订单
- `findOrderById(orderId)` - 按ID查找订单
- `findOrderByIdAndUser(orderId, userId)` - 按订单号+用户ID查找（数据隔离）
- `createOrder(order)` - 创建订单
- `updateOrder(orderId, userId, updates)` - 更新订单（需验证归属）
- `deleteOrder(orderId, userId)` - 删除订单

**JSON 文件操作核心**:
```javascript
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}
```

---

## 7. JWT 工具

**文件路径**: [server/utils/jwt.js](file:///d:/编程/web/server/utils/jwt.js)

**核心代码**:
```javascript
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yougou-mall-secret-key-2026';
const JWT_EXPIRES_IN = '7d';  // 7天过期

// 生成 Token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证 Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// 解码 Token (不验证)
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken, decodeToken, JWT_SECRET };
```

---

## 8. 前端 API 服务层

**文件路径**: [src/api.js](file:///d:/编程/web/src/api.js)

**核心功能**: 统一封装所有与后端的 API 调用，提供给业务代码使用

**核心代码示例**:
```javascript
const API_BASE_URL = '/api';

// 统一请求封装
async function request(url, options = {}) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' }
  };

  // 自动附加 Token
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(API_BASE_URL + url, finalOptions);
    const data = await response.json();

    // 处理 401 未授权
    if (!response.ok && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
    }

    return data;
  } catch (err) {
    console.error('[API ERROR]', url, err);
    throw err;
  }
}

// 认证相关 API
async function register(username, email, password, phone) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, phone })
  });
}

async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

async function getProfile() {
  return request('/auth/profile');
}

// 商品相关 API
async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request('/products' + (query ? `?${query}` : ''));
}

async function getProduct(id) {
  return request(`/products/${id}`);
}

// 订单相关 API
async function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request('/orders' + (query ? `?${query}` : ''));
}

async function getOrderCount() {
  return request('/orders/count');
}

async function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

async function payOrder(id) {
  return request(`/orders/${id}/pay`, { method: 'POST' });
}

async function cancelOrder(id) {
  return request(`/orders/${id}/cancel`, { method: 'POST' });
}

async function confirmReceipt(id) {
  return request(`/orders/${id}/confirm`, { method: 'POST' });
}

window.API = {
  register, login, getProfile,
  getProducts, getProduct,
  getOrders, getOrderCount, getOrder,
  createOrder, payOrder, cancelOrder, confirmReceipt
};
```

---

## 9. 前端状态管理

**文件路径**: [src/store.js](file:///d:/编程/web/src/store.js)

**核心功能**: 管理购物车状态、用户登录状态

**核心代码**:
```javascript
const Store = {
  // ===== 用户状态 =====
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('authChange'));
  },

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
  },

  // ===== 购物车状态 =====
  getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  },

  saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  addToCart(productId, quantity) {
    const cart = this.getCart();
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    this.saveCart(cart);
    window.dispatchEvent(new Event('cartChange'));
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.productId !== productId);
    this.saveCart(cart);
    window.dispatchEvent(new Event('cartChange'));
  },

  clearCart() {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartChange'));
  },

  getCartTotal(products) {
    return this.getCart().reduce((sum, item) => {
      const product = products ? products.find(p => p.id === item.productId) : null;
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  },

  getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }
};

window.Store = Store;
```

---

## 10. 接口调用总结表

| 编号 | 接口 | 方法 | 路径 | 认证 | 返回数据 |
|:---:|:------:|:---:|:---|:---:|:---|
| 1 | 注册 | POST | `/api/auth/register` | ❌ | token + user |
| 2 | 登录 | POST | `/api/auth/login` | ❌ | token + user |
| 3 | 获取用户信息 | GET | `/api/auth/profile` | ✅ | user |
| 4 | 修改用户信息 | PUT | `/api/auth/profile` | ✅ | user |
| 5 | 修改密码 | PUT | `/api/auth/password` | ✅ | 状态消息 |
| 6 | 商品列表 | GET | `/api/products` | ❌ | 商品数组+分页 |
| 7 | 商品分类 | GET | `/api/products/categories` | ❌ | 分类数组 |
| 8 | 商品详情 | GET | `/api/products/:id` | ❌ | 商品对象 |
| 9 | 订单列表 | GET | `/api/orders` | ✅ | 订单数组+分页 |
| 10 | 订单数量 | GET | `/api/orders/count` | ✅ | 各状态数量 |
| 11 | 订单详情 | GET | `/api/orders/:id` | ✅ | 订单对象 |
| 12 | 创建订单 | POST | `/api/orders` | ✅ | 订单对象 |
| 13 | 支付订单 | POST | `/api/orders/:id/pay` | ✅ | 状态消息 |
| 14 | 取消订单 | POST | `/api/orders/:id/cancel` | ✅ | 状态消息 |
| 15 | 确认收货 | POST | `/api/orders/:id/confirm` | ✅ | 状态消息 |

---

**文档完成时间**: 2026-06-14
