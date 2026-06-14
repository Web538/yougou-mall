# 订单列表查询功能前后端工作过程说明

## 一、功能概述

订单列表查询功能允许已登录用户查看自己的所有订单，支持按状态筛选（全部、待付款、待发货、待收货、已完成、已取消）和分页展示。同时提供各状态订单数量统计。

## 二、核心接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/orders` | GET | 获取订单列表 | 需要 |
| `/api/orders/count` | GET | 获取各状态订单数量 | 需要 |
| `/api/orders/:id` | GET | 获取订单详情 | 需要 |

## 三、后端工作过程

### 1. 订单列表查询 (`server/routes/orders.js`)

```javascript
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // 1. 获取当前用户的所有订单
    let orders = db.getOrdersByUserId(req.user.id);
    
    // 2. 按状态筛选
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }
    
    // 3. 按创建时间倒序排列
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 4. 分页计算
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = orders.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    
    // 5. 返回分页结果
    res.json({
      success: true,
      data: {
        list: orders.slice(start, end),
        pagination: { page: pageNum, limit: limitNum, total, totalPages }
      }
    });
  } catch (err) {
    console.error('[ORDERS ERROR] List:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
```

**处理流程：**
1. **认证验证**：`authMiddleware` 先验证 Token，将用户信息挂载到 `req.user`
2. **数据查询**：调用 `db.getOrdersByUserId(req.user.id)` 从 JSON 文件中筛选出当前用户的订单
3. **状态筛选**：如果传入 `status` 参数且不是 `all`，则过滤对应状态的订单
4. **排序**：按创建时间倒序排列，最新的订单排在前面
5. **分页**：根据 `page` 和 `limit` 参数计算分页范围
6. **响应**：返回标准格式的 JSON 数据，包含订单列表和分页信息

### 2. 订单数量统计 (`server/routes/orders.js`)

```javascript
router.get('/count', authMiddleware, (req, res) => {
  try {
    const orders = db.getOrdersByUserId(req.user.id);
    const counts = {
      all: orders.length,
      pending: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
      processing: orders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
      shipped: orders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
      completed: orders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
      cancelled: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length
    };
    res.json({ success: true, data: counts });
  } catch (err) {
    console.error('[ORDERS ERROR] Count:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
```

**处理流程：**
1. 获取当前用户的所有订单
2. 分别统计各状态订单数量
3. 返回统计结果，用于前端展示状态筛选卡片

### 3. 数据库层 (`server/utils/db.js`)

```javascript
function getOrdersByUserId(userId) {
  const orders = getOrders();
  return orders.filter(o => o.userId === userId);
}

function getOrders() {
  return readJson(ORDERS_FILE) || [];
}

function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[DB ERROR] 读取文件失败: ${filePath}`, err);
    return null;
  }
}
```

**数据存储方式：**
- 订单数据以 JSON 格式存储在 `server/data/orders.json` 文件中
- 每次操作读取整个文件，修改后写回
- 通过 `userId` 字段关联订单与用户的所属关系

## 四、前端工作过程

### 1. API 服务层 (`src/api.js`)

```javascript
async function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request('/orders' + (query ? `?${query}` : ''));
}

async function getOrderCount() {
  return request('/orders/count');
}
```

**功能说明：**
- `getOrders`：将查询参数转换为 URL 查询字符串，发送 GET 请求
- `getOrderCount`：发送 GET 请求获取订单统计数量
- 两个请求都会自动携带 `Authorization: Bearer <token>` 请求头

### 2. 业务逻辑层 (`app.js`)

```javascript
async function loadOrders() {
  const container = document.getElementById('ordersContent');
  
  // 1. 检查登录状态
  if (!Store.isLoggedIn()) {
    container.innerHTML = `<div class="empty-state">...</div>`;
    return;
  }
  
  // 2. 显示加载状态
  container.innerHTML = '<div class="loading">加载中</div>';
  
  try {
    // 3. 并行发送两个请求
    const [ordersRes, countRes] = await Promise.all([
      API.getOrders({ status: state.orderFilter, page: state.orderPage, limit: 10 }),
      API.getOrderCount()
    ]);
    
    // 4. 更新状态
    state.orders = ordersRes.data.list;
    const counts = countRes.data;
    
    // 5. 渲染页面
    renderOrdersContent(counts);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">加载订单失败: ${err.message}</div>`;
  }
}
```

**处理流程：**
1. **登录检查**：未登录用户显示提示信息
2. **加载状态**：显示"加载中"提示
3. **并行请求**：同时发送订单列表和数量统计两个请求，提高效率
4. **状态更新**：将返回数据保存到应用状态
5. **页面渲染**：调用渲染函数更新 DOM

### 3. 页面渲染 (`app.js`)

```javascript
function renderOrdersContent(counts) {
  const container = document.getElementById('ordersContent');
  
  // 1. 渲染状态统计卡片
  const filters = [
    { key: 'all', label: '全部', count: counts.all },
    { key: 'pending', label: '待付款', count: counts.pending },
    { key: 'processing', label: '待发货', count: counts.processing },
    { key: 'shipped', label: '待收货', count: counts.shipped },
    { key: 'completed', label: '已完成', count: counts.completed },
    { key: 'cancelled', label: '已取消', count: counts.cancelled }
  ];
  
  let html = `
    <div class="order-stats">
      ${filters.map(f => `
        <div class="stat-card" onclick="filterOrders('${f.key}')">
          <div class="stat-num">${f.count}</div>
          <div class="stat-label">${f.label}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  // 2. 渲染订单列表
  if (state.orders.length === 0) {
    html += `<div class="empty-state">...</div>`;
  } else {
    html += state.orders.map(order => {
      // 渲染每个订单卡片
      return `
        <div class="order-card">
          <div class="order-header">...</div>
          <div class="order-items">...</div>
          <div class="order-footer">...</div>
        </div>
      `;
    }).join('');
    
    // 3. 渲染分页
    html += renderPagination();
  }
  
  container.innerHTML = html;
}
```

**渲染内容：**
1. **状态统计卡片**：显示各状态订单数量，点击可筛选
2. **订单卡片**：显示订单号、日期、状态、商品列表、金额、操作按钮
3. **分页组件**：上一页/下一页按钮和页码信息

## 五、完整交互流程

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   前端页面   │         │   后端服务   │         │  JSON数据文件 │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  1. 用户点击"我的订单" │                       │
       │                       │                       │
       │  2. navigate('orders')│                       │
       │     loadOrders()      │                       │
       │                       │                       │
       │  3. 检查登录状态       │                       │
       │     Store.isLoggedIn()│                       │
       │                       │                       │
       │  4. 显示"加载中"       │                       │
       │                       │                       │
       │  5. 并行发送两个请求   │                       │
       │                       │                       │
       │  GET /api/orders?status=all&page=1&limit=10   │
       │  Authorization: Bearer│                       │
       │  <token>              │                       │
       │ ─────────────────────>│                       │
       │                       │                       │
       │  GET /api/orders/count│                       │
       │  Authorization: Bearer│                       │
       │  <token>              │                       │
       │ ─────────────────────>│                       │
       │                       │                       │
       │                       │  6. authMiddleware    │
       │                       │     验证 Token        │
       │                       │                       │
       │                       │  7. 查询订单数据       │
       │                       │ ─────────────────────>│
       │                       │                       │
       │                       │  8. 返回订单数据       │
       │                       │ <─────────────────────│
       │                       │                       │
       │                       │  9. 筛选/排序/分页     │
       │                       │                       │
       │  10. 返回 JSON 响应    │                       │
       │  {list, pagination}   │                       │
       │ <─────────────────────│                       │
       │                       │                       │
       │  11. 渲染统计卡片      │                       │
       │  12. 渲染订单列表      │                       │
       │  13. 渲染分页组件      │                       │
       │                       │                       │
       │  14. 用户点击状态筛选  │                       │
       │     filterOrders('pending')                    │
       │                       │                       │
       │  15. 重复步骤 4-13    │                       │
       │                       │                       │
```

## 六、数据格式

### 请求参数

```
GET /api/orders?status=pending&page=1&limit=10
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 订单状态筛选，可选值：all/pending/processing/shipped/completed/cancelled |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "ORD20260614123045001",
        "userId": "user-uuid",
        "items": [
          {
            "productId": 1,
            "name": "Apple iPhone 15 Pro 256GB",
            "icon": "📱",
            "price": 7999,
            "quantity": 1,
            "total": 7999
          }
        ],
        "shipping": {
          "name": "张三",
          "phone": "13800138000",
          "region": "北京市",
          "address": "朝阳区xxx街道"
        },
        "payment": "支付宝",
        "note": "",
        "subtotal": 7999,
        "shippingFee": 0,
        "total": 7999,
        "status": "pending",
        "statusText": "待付款",
        "createdAt": "2026-06-14T12:30:45.000Z",
        "updatedAt": "2026-06-14T12:30:45.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

## 七、工程化规范

1. **RESTful API 设计**：使用 GET 方法查询资源，URL 语义清晰
2. **统一响应格式**：所有接口返回 `{success, data/message}` 标准结构
3. **错误处理**：使用 try-catch 捕获异常，返回 500 状态码和错误信息
4. **参数校验**：对分页参数进行类型转换和默认值处理
5. **数据隔离**：通过 `req.user.id` 确保用户只能访问自己的订单数据
6. **并行请求**：前端使用 `Promise.all` 同时发送多个独立请求，提升性能
