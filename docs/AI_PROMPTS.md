# 优购商城项目 - AI 提问内容记录

## 文档说明

本文档记录了开发优购商城电商平台项目过程中，与 AI 助手交流的所有问题内容。

---

## 问题 1: 为什么在付款后申请退款还可以点击确认收货

**问题描述**:
> 发现订单状态流转异常问题：在付款后申请退款，却仍然可以点击"确认收货"按钮。

**问题分析**:
- 原代码中 `payOrder()` 函数有两个异步定时器
- 付款后 1.5 秒将状态改为 `processing` (待发货)
- 3 秒后自动改为 `shipped` (待收货)
- 如果用户在期间点击了"取消订单"（退款），订单状态变为 `cancelled`
- 但定时器仍会强制执行，将状态改回 `shipped`
- 导致已取消的订单又变成了"待收货"，可以被确认收货

**修复方案**:
1. 在 `payOrder()` 的定时回调中检查当前订单状态
2. 在 `cancelOrder()` 中清除未执行的定时器
3. 在 `confirmReceipt()` 中校验订单状态必须为 `shipped` 才能确认收货
4. 在 `cancelOrder()` 中校验订单状态必须为 `pending` 或 `processing`

---

## 问题 2: 完善电商购物平台

**问题描述**:
> 要求在现有项目基础上，增加用户登录（Token 验证）、订单列表查询等功能，并按工程化规范优化所有代码。

**需求要点**:
1. **用户认证系统**: 实现注册、登录、JWT Token 验证
2. **订单系统增强**: 订单列表查询、分页、状态筛选、数量统计
3. **代码工程化**:
   - 前后端分离
   - 模块化目录结构
   - API 服务层封装
   - 状态管理模块
   - 中间件模式
   - 数据持久化
4. **用户中心**: 个人信息管理、修改密码

**实现方案**:
- 后端: Node.js + Express, 基于 RESTful API 设计
- 认证: JWT + bcryptjs 密码加密
- 数据存储: JSON 文件数据库 (轻量级, 无外部依赖)
- 前端: 原生 HTML/CSS/JavaScript 单页应用
- 目录结构: `server/`（后端）、`src/`（前端模块）、`data/`（数据）

---

## 问题 3: 购物车商品合计为 0

**问题描述**:
> 购物车中的商品数量正确显示，但合计金额始终为 0。

**问题根因**:
- `src/store.js` 的 `getCartTotal()` 函数依赖 `window.products`
- `window.products` 全局变量未定义或在脚本加载顺序中不可用
- 导致 `products.find()` 返回 `null`
- 最终计算 `price * quantity` 时使用 0 作为默认值

**修复方案**:
1. 修改 `getCartTotal()` 函数签名，接收 `products` 作为参数
2. 修改 `app.js` 中调用 `getCartTotal(products)` 时传入商品数据
3. 购物车渲染、结算页金额计算同步更新

---

## 问题 4: 退出登录未经过确认

**问题描述**:
> 点击用户下拉菜单中的"退出登录"后，立即退出登录状态，没有经过任何确认操作。

**问题分析**:
- 原 `handleLogout()` 函数可能缺少 `confirm()` 确认步骤
- 或者 `confirm()` 的逻辑写法不清晰
- 用户误触会导致不必要的重新登录

**修复方案**:
1. 在 `handleLogout()` 开头增加 `confirm()` 确认弹窗
2. 使用否定式判断：`if (!confirm('确定要退出登录吗？')) return;`
3. 确认通过后执行退出逻辑
4. 关闭下拉菜单 → 清除 Token → 刷新 UI → 返回首页
5. 在 CSS 中为"退出登录"选项增加醒目的红色样式（`logout-item` 类）

---

## 问题 5: 下拉菜单交互体验不佳

**问题描述**:
> 用户下拉菜单通过 CSS `:hover` 自动显示，点击用户名时可能与 hover 冲突，体验不稳定。

**问题分析**:
- CSS `:hover` 会在鼠标移入时自动显示菜单
- JavaScript `toggle()` 点击切换可能产生竞态
- 点击菜单项后没有自动关闭

**修复方案**:
1. 移除 CSS `.nav-user-menu:hover .user-dropdown { display: block }`
2. 改用纯 JS 控制 + `show` 类名
3. `toggleUserDropdown()`: 点击用户名切换 `.show` 类
4. `closeUserDropdown()`: 点击菜单项后移除 `.show`
5. 监听 `document.click`: 点击菜单外部区域关闭
6. 添加下拉淡入动画 (`dropdownFadeIn` keyframes)

---

## 问题 6: 后端静态文件路径配置错误

**问题描述**:
> 访问首页 `http://localhost:3000/` 返回 404 "接口不存在"。

**问题分析**:
- `server/index.js` 中 `express.static` 配置路径错误
- 配置为 `../public/`，但实际前端文件在项目根目录
- 导致所有 HTML/CSS/JS 文件无法通过静态服务访问
- 仅剩 API 路由可用

**修复方案**:
修改 `server/index.js` 第44行:
```javascript
// 修复前 (错误)
app.use(express.static(path.join(__dirname, '../public')));

// 修复后 (正确)
app.use(express.static(path.join(__dirname, '..')));
```

---

## 问题 7: 后端测试验证

**问题描述**:
> 验证后端 API 接口是否都能正确工作，包括：
> - 健康检查
> - 用户注册/登录
> - 商品列表/详情
> - 订单创建/查询/支付/取消/确认收货

**验证方法**:
通过 Node.js 脚本模拟 API 调用：
1. 调用 `/api/health` 检查服务状态
2. 调用 `/api/auth/register` 测试注册
3. 调用 `/api/auth/login` 测试登录并获取 Token
4. 使用 Token 调用受保护接口
5. 验证商品列表、分类、详情接口
6. 验证订单 CRUD 和状态流转

---

## 问题 8: 项目交付文档生成

**问题描述**:
> 按交付要求生成以下文档：
> 1. 实现思路说明文档
> 2. 数据库表结构 SQL
> 3. API 接口代码文档
> 4. 完整测试报告
> 5. AI 提问内容记录
> 6. 推送到远程仓库（Gitee/GitHub）

**文档生成要求**:
- **实现思路**: 架构设计、模块划分、核心逻辑、技术选型
- **SQL 表结构**: 用户表、商品表、分类表、订单主表、订单明细表、规格表
- **API 文档**: 请求参数、响应格式、核心代码片段、示例调用
- **测试报告**: 测试用例清单、通过/失败统计、Bug 修复记录、性能数据
- **AI 提问记录**: 所有问题及解决思路

---

## 核心问题解决模式总结

### 模式 1: 异步状态竞态问题

**问题特征**:
- 定时器 (`setTimeout`) 在状态改变后仍会执行
- UI 状态与实际数据状态不一致

**解决方法**:
```javascript
// 1. 保存定时器ID
pendingTimers[order.id] = setTimeout(() => {...});

// 2. 状态变更时清除定时器
function cancelOrder(orderId) {
  if (pendingTimers[orderId]) {
    clearTimeout(pendingTimers[orderId]);
    delete pendingTimers[orderId];
  }
}

// 3. 定时器回调中再次验证状态
setTimeout(() => {
  const current = findOrder(orderId);
  if (current.status === 'cancelled') return;  // 状态已变, 跳过
}, 3000);
```

### 模式 2: 脚本加载顺序依赖

**问题特征**:
- 模块 A 依赖模块 B 中的全局变量
- B 在 A 之后加载导致变量为 undefined
- 数据计算出现意外的 0/null/NaN

**解决方法**:
```javascript
// 避免全局依赖, 改为参数传递
// 修复前:
function getCartTotal() {
  const product = window.products.find(...);  // window.products 可能 undefined
}

// 修复后:
function getCartTotal(products) {               // 作为参数传入
  const product = products.find(...);
}
```

### 模式 3: CSS :hover 与 JS toggle 冲突

**问题特征**:
- CSS 伪类自动显示/隐藏元素
- JavaScript 同时控制同一元素
- 产生闪烁、不响应等不可预测行为

**解决方法**:
**二选一原则**: 要么纯 CSS, 要么纯 JS, 不要混用
```javascript
// 推荐: 完全由 JS 控制
<button onclick="toggleMenu()">用户 ▾</button>

function toggleMenu() {
  document.getElementById('menu').classList.toggle('show');
}
```

```css
/* 只定义显隐状态, 不控制触发 */
.user-dropdown { display: none; }
.user-dropdown.show { display: block; }
```

### 模式 4: 危险操作确认机制

**问题特征**:
- 退出登录、删除、取消订单等不可逆操作
- 缺少确认步骤, 误触代价高

**解决方法**:
```javascript
function doDangerousAction() {
  // 1. 先确认
  if (!confirm('确定要执行吗？')) {
    return;  // 用户取消, 直接返回
  }
  // 2. 再执行
  executeAction();
}
```

---

## 技术选型总结

| 技术 | 选择 | 理由 |
|:---:|:---|:---|
| 后端框架 | Express.js | 轻量、灵活、社区成熟, 适合中小项目 |
| 认证方案 | JWT (jsonwebtoken) | 无状态、跨域友好、前端可存储 localStorage |
| 密码加密 | bcryptjs | 加盐哈希、抗彩虹表、行业标准 |
| 数据存储 | JSON 文件 | 零配置、无外部依赖、适合演示与中小数据量 |
| 前端方案 | 原生 HTML/CSS/JS | 零构建、启动即用、学习成本低 |
| 唯一 ID | uuid | 标准实现, 避免重复 |
| 跨域支持 | cors 中间件 | 前后端分离必备 |

---

**文档记录时间**: 2026-06-14
**提问总数**: 8 个核心问题
**解决方案应用**: 5 个代码修复点 + 1 个完整项目重构
