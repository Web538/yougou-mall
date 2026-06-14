# 登录验证原理说明

## 一、概述

本系统采用 **JWT（JSON Web Token）** 实现无状态的用户身份认证机制。用户登录成功后，后端生成 JWT Token 返回给前端，前端在后续请求中携带该 Token，后端通过验证 Token 来确认用户身份。

## 二、核心组件

### 1. JWT 工具模块 (`server/utils/jwt.js`)

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yougou-mall-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
```

**功能说明：**
- `generateToken`: 使用 `jwt.sign()` 将用户基本信息（id, username, email）加密生成 Token，设置 7 天有效期
- `verifyToken`: 使用 `jwt.verify()` 验证 Token 的合法性和有效期

### 2. 认证中间件 (`server/middleware/auth.js`)

```javascript
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // 1. 检查是否存在 Authorization 头
  if (!authHeader) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }
  
  // 2. 解析 Bearer Token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, message: '令牌格式错误' });
  }
  
  const token = parts[1];
  
  // 3. 验证 Token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: '令牌无效或已过期' });
  }
  
  // 4. 将用户信息附加到请求对象
  req.user = { id: decoded.id, username: decoded.username, email: decoded.email };
  
  next();
}
```

**验证流程：**
1. 从请求头中获取 `Authorization` 字段
2. 检查格式是否为 `Bearer <token>`
3. 调用 `jwt.verify()` 验证 Token 签名和有效期
4. 验证通过则将用户信息挂载到 `req.user`，供后续路由使用
5. 验证失败返回 401 未授权错误

### 3. 前端 API 封装 (`src/api.js`)

```javascript
async function request(url, options = {}) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' }
  };
  
  // 自动添加 Token
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(API_BASE_URL + url, finalOptions);
  
  // 处理 401 未授权
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
  }
  
  return data;
}
```

**功能说明：**
- 每次请求自动从 `localStorage` 读取 Token
- 将 Token 以 `Bearer <token>` 格式添加到请求头
- 遇到 401 响应时自动清除本地登录状态并触发认证状态变更事件

### 4. 前端状态管理 (`src/store.js`)

```javascript
const Store = {
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
  }
};
```

**功能说明：**
- `isLoggedIn`: 检查本地是否存在 Token
- `setAuth`: 登录成功后保存 Token 和用户信息
- `clearAuth`: 退出登录时清除本地存储
- 通过自定义事件 `authChange` 实现跨组件状态通知

## 三、完整登录流程

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   前端页面   │         │   后端服务   │         │   JSON文件   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  1. 输入用户名密码     │                       │
       │  2. 点击登录按钮       │                       │
       │                       │                       │
       │  POST /api/auth/login │                       │
       │  {username, password} │                       │
       │ ─────────────────────>│                       │
       │                       │                       │
       │                       │  3. 查询用户数据       │
       │                       │ ─────────────────────>│
       │                       │                       │
       │                       │  4. 返回用户数据       │
       │                       │ <─────────────────────│
       │                       │                       │
       │                       │  5. bcrypt.compare()  │
       │                       │     验证密码           │
       │                       │                       │
       │                       │  6. 生成 JWT Token    │
       │                       │     jwt.sign()        │
       │                       │                       │
       │  7. 返回 Token + 用户信息                     │
       │  {token, user}        │                       │
       │ <─────────────────────│                       │
       │                       │                       │
       │  8. localStorage.setItem('token', token)      │
       │  9. localStorage.setItem('user', JSON.stringify(user))
       │  10. 触发 authChange 事件                      │
       │                       │                       │
       │  后续请求自动携带 Authorization: Bearer <token>
       │                       │                       │
```

## 四、Token 验证流程

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   前端页面   │         │  认证中间件  │         │   业务路由   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  请求 API (携带 Token) │                       │
       │  Authorization: Bearer│                       │
       │  <token>              │                       │
       │ ─────────────────────>│                       │
       │                       │                       │
       │                       │  1. 解析请求头         │
       │                       │  2. 提取 Token         │
       │                       │                       │
       │                       │  3. jwt.verify()      │
       │                       │     验证签名和有效期   │
       │                       │                       │
       │                       │  4. 验证通过？         │
       │                       │                       │
       │    ┌──────────────────┴──────────────────┐   │
       │    │  是                                │ 否  │
       │    │                                    │     │
       │    │  5. req.user = decoded             │ 5. 返回 401
       │    │  6. next()                         │     │
       │    │                                    │     │
       │    └──────────────────┬──────────────────┘   │
       │                       │                       │
       │                       │  7. 调用业务路由       │
       │                       │ ─────────────────────>│
       │                       │                       │
       │                       │  8. 执行业务逻辑       │
       │                       │     (可访问 req.user) │
       │                       │                       │
       │  9. 返回响应           │                       │
       │ <─────────────────────│ <─────────────────────│
```

## 五、安全机制

| 安全机制 | 说明 |
|---------|------|
| 密码加密 | 使用 bcryptjs 对密码进行哈希存储，salt rounds = 10 |
| Token 有效期 | JWT 设置 7 天过期时间，过期后需重新登录 |
| Token 格式校验 | 严格检查 `Bearer <token>` 格式 |
| 无状态认证 | 服务端不存储 Session，完全依赖 Token 验证 |
| 自动登出 | 前端检测到 401 响应时自动清除登录状态 |
| 密码强度校验 | 注册时要求密码长度至少 6 个字符 |

## 六、代码工程化规范

1. **模块化设计**：JWT 操作、认证中间件、API 封装、状态管理各自独立模块
2. **统一错误处理**：所有认证错误返回标准格式的 JSON 响应 `{success, message}`
3. **常量管理**：JWT 密钥和过期时间集中配置
4. **注释规范**：所有函数添加 JSDoc 注释说明参数和返回值
5. **代码复用**：认证中间件可复用于所有需要保护的路由
