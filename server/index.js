/**
 * 优购商城 - 后端服务入口
 * 基于 Express 的 RESTful API 服务
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// 路由模块
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// ========== 中间件配置 ==========

// CORS 配置 - 允许跨域访问
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// JSON 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 静态文件服务 - 前端页面
app.use(express.static(path.join(__dirname, '..')));

// ========== API 路由 ==========

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// ========== 错误处理 ==========

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== 启动服务器 ==========

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('优购商城后端服务已启动');
  console.log('='.repeat(50));
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`前端页面: http://localhost:${PORT}/`);
  console.log(`API文档: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
  console.log('');
  console.log('可用接口:');
  console.log('  POST /api/auth/register  - 用户注册');
  console.log('  POST /api/auth/login    - 用户登录');
  console.log('  GET  /api/auth/profile  - 获取用户信息');
  console.log('  GET  /api/products     - 商品列表');
  console.log('  GET  /api/products/:id  - 商品详情');
  console.log('  GET  /api/orders        - 订单列表');
  console.log('  POST /api/orders        - 创建订单');
  console.log('  PUT  /api/orders/:id    - 更新订单');
  console.log('='.repeat(50));
});

module.exports = app;
