# 优购商城电商平台 - 实现思路文档

## 1. 项目概述

**优购商城** 是一个基于前后端分离架构的电商购物平台，提供完整的商品浏览、购物车管理、订单创建与查询、用户认证等核心功能。

- **项目名称**: 优购商城 (YouGou Mall)
- **开发时间**: 2026年6月
- **开发环境**: Windows 11 + Node.js v24.16.0
- **服务端口**: 3000

---

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                        浏览器                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │     index.html + styles.css + app.js (前端)    │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │  HTTP/HTTPS 请求                   │
│         ┌───────────┴────────────┐                       │
│         │     Express Server     │                       │
│         │   server/index.js       │                       │
│         └────┬─────────┬─────────┘                       │
│              │         │                                 │
│    ┌─────────┴───┐ ┌──┴────────────┐              │
│    │ 路由层      │ │ 中间件层      │              │
│    │ routes/     │ │ middleware/    │              │
│    │ auth.js     │ │ auth.js       │              │
│    │ products.js │ │                │              │
│    │ orders.js   │ │                │              │
│    └────┬────────┘ └────────┬───────┘              │
│         │                    │                        │
│    ┌────┴────────────────────┴────────┐                │
│    │         工具层 utils/             │                │
│    │  db.js (文件数据库) + jwt.js      │                │
│    └────────────┬─────────────────────┘                │
│                 │                                        │
│         ┌───────┴────────┐                               │
│         │  JSON 数据文件 │                               │
│         │ users.json     │                               │
│         │ orders.json    │                               │
│         └────────────────┘                               │
└──────────────────────────────────────────────────────────┘
```

### 2.2 分层架构说明

| 层级 | 模块/文件 | 职责说明 |
|------|-----------|----------|
| **视图层** | index.html / styles.css / app.js | 用户界面，渲染商品、处理用户交互 |
| **前端服务层** | src/api.js | API 调用封装，统一处理请求与响应 |
| **前端状态** | src/store.js | 购物车状态、用户登录状态管理 |
| **后端路由** | server/routes/*.js | RESTful API 路由，处理请求分发 |
| **后端中间件** | server/middleware/auth.js | JWT Token 验证、权限控制 |
| **后端工具** | server/utils/ | 数据库操作、JWT 工具、通用工具 |
| **数据层** | data/*.json | 轻量级文件数据库（替代传统关系型数据库） |

---

## 3. 核心功能模块实现思路

### 3.1 用户认证模块 (JWT Token 认证)

**设计思路**:
1. 使用 **JWT (JSON Web Token)** 实现无状态认证
2. 密码使用 **bcryptjs** 进行加盐哈希存储，避免明文存储
3. Token 有效期设置为 **7 天**，支持自动延长机制
4. 所有需要登录的接口通过中间件统一校验 Token

**核心流程**:
```
用户注册 → bcrypt 加密密码 → 存储到 users.json
    ↓
用户登录 → 验证用户名/密码 → 生成 JWT Token
    ↓
返回 Token → 前端存储到 localStorage
    ↓
后续请求 → Authorization: Bearer <token> → 中间件校验
    ↓
校验通过 → 执行业务逻辑 → 返回数据
```

**安全机制**:
- 密码强度校验（至少6位）
- 邮箱格式正则校验
- Token 过期自动失效
- 用户名唯一性校验

---

### 3.2 商品展示模块

**设计思路**:
1. 商品数据以 **内存数组** 形式定义（24个商品，8种分类）
2. 支持 **分类筛选**、**关键词搜索**、**多种排序**
3. 商品详情页提供规格说明、库存信息、加入购物车功能

**商品数据结构**:
```javascript
{
  id: Number,           // 商品ID
  name: String,         // 商品名称
  category: String,     // 分类 (手机数码/电脑办公/家居生活...)
  price: Number,        // 销售价格
  originalPrice: Number,// 原价
  icon: String,         // 图标/emoji
  rating: Number,       // 评分
  sales: Number,        // 销量
  description: String,  // 描述
  specs: [String]       // 规格列表
}
```

**筛选与排序实现**:
- **分类筛选**: 通过 `state.currentCategory` 控制，点击分类导航触发
- **搜索**: 关键词匹配商品名称、分类、描述
- **排序**: 价格升序/价格降序/销量优先/评分优先

---

### 3.3 购物车模块

**设计思路**:
1. 使用 **localStorage** 持久化存储购物车数据
2. 购物车数据仅保存 `productId` 和 `quantity`，商品信息从商品数据动态获取
3. 购物车操作通过全局事件 (`cartChange`) 通知各视图更新

**购物车数据结构**:
```javascript
[
  { productId: 1, quantity: 2 },
  { productId: 2, quantity: 1 }
]
```

**购物车操作**:
| 操作 | 实现方式 |
|------|----------|
| 加入购物车 | `addToCart(productId, quantity)` |
| 修改数量 | `updateCartQuantity(productId, delta)` |
| 移除商品 | `removeFromCart(productId)` |
| 清空购物车 | `clearCart()` |
| 计算总价 | `Store.getCartTotal(products)` |
| 计算总数 | `Store.getCartCount()` |

---

### 3.4 订单管理模块

**设计思路**:
1. **订单状态机**：待付款 → 待发货 → 待收货 → 已完成
2. 支持取消订单和申请退款（待付款/待发货状态可取消）
3. 订单列表支持状态筛选、分页查询
4. 创建订单时自动清空购物车

**订单状态流转图**:
```
pending (待付款) ──支付──► processing (待发货)
     │                      │
     └──取消──► cancelled   └──申请退款──► cancelled
                           │
                           └──3秒自动发货──► shipped (待收货)
                                                   │
                                                   └──确认收货──► completed (已完成)
```

**订单数据结构**:
```javascript
{
  id: "ORD2026061414300840",  // 订单号
  userId: "uuid-xxx-xxx",      // 用户ID（隔离数据）
  items: [{productId, name, icon, price, quantity, total}],
  shipping: { name, phone, region, address },  // 收货信息
  payment: "支付宝",           // 支付方式
  note: String,               // 订单备注
  subtotal: Number,           // 商品总价
  shippingFee: Number,        // 运费
  total: Number,              // 应付总额
  status: "pending",          // 订单状态
  statusText: "待付款",        // 状态文本
  createdAt: ISOString,       // 创建时间
  updatedAt: ISOString        // 更新时间
}
```

**订单生成规则**:
- 订单号格式: `ORD + 年月日时分秒 + 3位随机数`
- 运费规则: 商品总价 ≥ 99元免运费，否则10元运费

---

### 3.5 订单列表查询模块

**设计思路**:
1. 订单按用户ID隔离，用户只能查看自己的订单
2. 支持按状态筛选（全部/待付款/待发货/待收货/已完成/已取消）
3. 订单列表支持分页查询（默认每页10条）
4. 返回订单数量统计（各状态数量）

**核心查询逻辑**:
```
获取用户所有订单
    ↓
按状态筛选（如需要）
    ↓
按创建时间降序排序（最新在前）
    ↓
计算分页参数（page, limit）
    ↓
返回指定页数据 + 总数
```

---

## 4. 数据库设计（从 JSON 文件迁移到关系型数据库）

### 4.1 数据迁移思路

当前项目使用 **JSON 文件** 存储数据（轻量级、零配置），如需迁移到关系型数据库（如 MySQL），设计思路如下：

**文件数据库 vs 关系型数据库 映射**:
| 文件存储 | 数据库表 | 说明 |
|----------|----------|------|
| users.json | t_user | 用户表 |
| orders.json | t_order, t_order_item | 订单主表 + 订单明细表 |
| products.js | t_product, t_category | 商品表 + 分类表 |

---

## 5. API 接口设计规范

### 5.1 接口设计原则

1. **RESTful 风格**: 使用 HTTP 方法表示 CRUD 操作
   - `GET` - 查询数据
   - `POST` - 创建数据 / 执行操作
   - `PUT` - 更新数据
   - `DELETE` - 删除数据

2. **统一响应格式**:
```javascript
{
  success: Boolean,    // 请求是否成功
  message: String,     // 提示信息
  data: Object|Array   // 业务数据
}
```

3. **认证方式**:
   - Header: `Authorization: Bearer <token>`
   - Token 从登录接口获取

4. **错误处理**:
   - HTTP 400: 参数错误
   - HTTP 401: 未认证
   - HTTP 403: 无权限
   - HTTP 404: 资源不存在
   - HTTP 409: 资源冲突（如重复注册）
   - HTTP 500: 服务器错误

### 5.2 接口清单

| 接口 | 方法 | 说明 | 需认证 |
|------|------|------|--------|
| /api/auth/register | POST | 用户注册 | ❌ |
| /api/auth/login | POST | 用户登录 | ❌ |
| /api/auth/profile | GET | 获取用户信息 | ✅ |
| /api/auth/profile | PUT | 更新用户信息 | ✅ |
| /api/auth/password | PUT | 修改密码 | ✅ |
| /api/products | GET | 商品列表 | ❌ |
| /api/products/categories | GET | 商品分类 | ❌ |
| /api/products/:id | GET | 商品详情 | ❌ |
| /api/orders | GET | 订单列表 | ✅ |
| /api/orders/count | GET | 订单数量统计 | ✅ |
| /api/orders/:id | GET | 订单详情 | ✅ |
| /api/orders | POST | 创建订单 | ✅ |
| /api/orders/:id/pay | POST | 支付订单 | ✅ |
| /api/orders/:id/cancel | POST | 取消订单 | ✅ |
| /api/orders/:id/confirm | POST | 确认收货 | ✅ |

---

## 6. 前端关键实现思路

### 6.1 视图切换（SPA 单页应用）

使用 `navigate(view)` 函数实现视图切换，不刷新页面：
- `view-home` - 首页（商品列表）
- `view-product` - 商品详情页
- `view-cart` - 购物车页面
- `view-checkout` - 订单结算页
- `view-orders` - 订单列表页
- `view-profile` - 个人中心

### 6.2 状态管理设计

前端状态分为三部分：

1. **用户状态** (`localStorage`)
   - `token` - JWT Token
   - `user` - 用户基本信息（JSON字符串）

2. **购物车状态** (`localStorage`)
   - `cart` - 购物车商品列表（JSON字符串）

3. **页面状态** (`app.js state` 对象)
   - 当前视图
   - 当前分类
   - 搜索关键词
   - 查看的商品信息

### 6.3 下拉菜单交互

用户下拉菜单的三种交互方式：
- **点击用户名**: `classList.toggle("show")` - 切换显示
- **点击菜单项**: `classList.remove("show")` - 自动关闭
- **点击菜单外部**: `document.addEventListener('click')` - 检测点击位置并关闭

---

## 7. 关键技术点与解决思路

### 7.1 购物车总价为0的问题（已修复）

**问题**: 购物车总价始终显示 ¥0.00
**原因**: `src/store.js` 的 `getCartTotal()` 函数依赖 `window.products`，但脚本加载顺序导致 products 未定义
**解决方案**:
- 修改 `store.js`: 接收 `products` 参数代替 `window.products`
- 修改 `app.js`: 调用时传入 `Store.getCartTotal(products)`

### 7.2 退出登录未确认的问题（已修复）

**问题**: 点击退出登录未经过确认直接退出
**原因**: 原代码逻辑中 `confirm()` 函数的调用时机和写法可能不稳定
**解决方案**:
- 先关闭下拉菜单，避免UI冲突
- 使用 `if (!confirm()) return;` 的否定式写法，逻辑更清晰
- 添加 toast 提示"已退出登录"

### 7.3 下拉菜单交互冲突（已修复）

**问题**: CSS `:hover` 和 JavaScript `toggle` 同时控制菜单，可能产生闪烁
**原因**: CSS 选择器 `.nav-user-menu:hover .user-dropdown` 与 JS 切换 display 冲突
**解决方案**:
- 移除 CSS `:hover` 自动显示
- 改用纯 JS 控制 + CSS `.show` 类名
- 添加淡入+上移动画过渡效果 (`dropdownFadeIn` keyframes)

### 7.4 Token 过期处理

**实现**: 前端 API 服务层检测 401 状态 → 清除本地 Token → 刷新UI

---

## 8. 项目文件组织规范

```
d:\编程\web\
│
├── index.html              # 主页面 (3KB)
├── styles.css              # 样式表 (40KB, 包含动画/响应式)
├── app.js                  # 前端业务逻辑 (25KB, 18个功能)
├── package.json            # 项目依赖配置
├── start.bat / run.bat     # Windows启动脚本
├── .gitignore              # Git忽略规则
├── README.md              # 项目说明文档
│
├── src/                    # 前端模块目录
│   ├── api.js             # API 服务层（所有fetch请求封装）
│   └── store.js           # 状态管理（用户/购物车）
│
├── server/                 # 后端服务目录
│   ├── index.js           # Express 入口（路由注册+中间件配置）
│   │
│   ├── routes/            # 路由模块
│   │   ├── auth.js       # 认证路由（注册/登录/profile）
│   │   ├── products.js   # 商品路由（列表/分类/详情）
│   │   └── orders.js     # 订单路由（CRUD+状态变更）
│   │
│   ├── middleware/        # 中间件
│   │   └── auth.js       # JWT认证中间件（提取+验证Token）
│   │
│   ├── utils/             # 工具模块
│   │   ├── db.js         # 文件数据库（读写JSON）
│   │   └── jwt.js        # JWT工具（生成/验证/解码）
│   │
│   └── data/              # 数据存储目录
│       ├── users.json    # 用户数据
│       └── orders.json   # 订单数据
│
└── docs/                   # 项目文档目录
    ├── README.md          # 项目说明
    ├── IMPLEMENTATION.md  # 实现思路
    ├── schema.sql         # 数据库表结构
    ├── API.md             # 接口文档
    ├── TEST_REPORT.md    # 测试报告
    └── AI_PROMPTS.md     # AI 提问记录
```

---

## 9. 开发工具与依赖

**核心依赖 (package.json)**:
```json
{
  "express": "^4.18.2",      // Web 框架
  "cors": "^2.8.5",          // CORS 跨域支持
  "jsonwebtoken": "^9.0.2",  // JWT Token 认证
  "bcryptjs": "^2.4.3",      // 密码加密
  "uuid": "^9.0.0"           // 唯一ID生成
}
```

**开发环境**:
- Node.js v24.16.0
- Windows 11
- 原生浏览器（Chrome/Edge/Firefox）

---

## 10. 性能与安全考量

| 方面 | 实现方式 |
|------|----------|
| **密码安全** | bcryptjs 加盐哈希（10轮） |
| **Token 安全** | JWT 签名 + 7 天过期 |
| **数据隔离** | 订单按 userId 过滤，防止越权访问 |
| **前端防注入** | 使用 textContent/text 代替 innerHTML，拼接 HTML |
| **XSS 防护** | 表单数据在展示前转义（虽然当前项目是纯文本） |
| **搜索优化** | 内存数组查询，支持多字段匹配（名称/分类/描述） |
| **性能优化** | 静态资源直接 Express.static，无构建过程 |
| **状态校验** | 订单状态变更前严格检查（如只有 pending 状态才能支付） |

---

## 11. 未来扩展方向

- [ ] 接入真实数据库（MySQL/SQLite）替代 JSON 文件
- [ ] 实现商品库存管理与扣减
- [ ] 接入第三方支付 API（支付宝沙箱/微信沙箱）
- [ ] 实现商品评论与评分系统
- [ ] 实现后台管理系统（商品管理/订单管理/用户管理）
- [ ] 前端迁移到 Vue.js / React 框架
- [ ] 支持多商户/多店铺模式
- [ ] 实现商品推荐算法
- [ ] 支持优惠券/秒杀/拼团等营销功能
