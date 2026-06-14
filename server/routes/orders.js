/**
 * 订单路由模块
 * 处理订单创建、查询、更新等接口
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../utils/db');

const router = express.Router();

// 初始化数据库
db.initOrders();

// 订单状态常量
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const STATUS_TEXT = {
  pending: '待付款',
  processing: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消'
};

// 待处理的定时器
const pendingTimers = {};

/**
 * 生成订单号
 */
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

/**
 * 计算订单金额
 */
function calculateOrder(items) {
  let subtotal = 0;
  const orderItems = items.map(item => {
    const product = global.__products ? global.__products.find(p => p.id === item.productId) : null;
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
  const total = subtotal + shippingFee;

  return { items: orderItems, subtotal, shippingFee, total };
}

/**
 * POST /api/orders
 * 创建订单（需要认证）
 */
router.post('/', authMiddleware, (req, res) => {
  try {
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
      shipping: {
        name: shipping.name,
        phone: shipping.phone,
        region: shipping.region || '',
        address: shipping.address
      },
      payment: payment || '支付宝',
      note: note || '',
      subtotal,
      shippingFee,
      total,
      status: ORDER_STATUS.PENDING,
      statusText: STATUS_TEXT.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedOrder = db.createOrder(order);
    if (!savedOrder) {
      return res.status(500).json({ success: false, message: '创建订单失败' });
    }

    res.status(201).json({ success: true, message: '订单创建成功', data: savedOrder });
  } catch (err) {
    console.error('[ORDERS ERROR] Create:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * GET /api/orders
 * 获取当前用户的订单列表（需要认证）
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let orders = db.getOrdersByUserId(req.user.id);

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = orders.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

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

/**
 * GET /api/orders/count
 * 获取各状态订单数量（需要认证）
 */
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

/**
 * GET /api/orders/:id
 * 获取订单详情（需要认证）
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const order = db.findOrderByIdAndUser(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('[ORDERS ERROR] Detail:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * POST /api/orders/:id/pay
 * 支付订单（需要认证）
 */
router.post('/:id/pay', authMiddleware, (req, res) => {
  try {
    const order = db.findOrderByIdAndUser(req.params.id, req.user.id);

    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: '当前订单状态不支持付款' });
    }

    // 清除旧的定时器
    if (pendingTimers[order.id]) { clearTimeout(pendingTimers[order.id]); delete pendingTimers[order.id]; }
    if (pendingTimers[order.id + '_ship']) { clearTimeout(pendingTimers[order.id + '_ship']); delete pendingTimers[order.id + '_ship']; }

    // 1.5秒后变为待发货
    pendingTimers[order.id] = setTimeout(() => {
      const currentOrder = db.findOrderByIdAndUser(order.id, req.user.id);
      if (!currentOrder || currentOrder.status === ORDER_STATUS.CANCELLED) return;

      db.updateOrder(order.id, req.user.id, {
        status: ORDER_STATUS.PROCESSING,
        statusText: STATUS_TEXT.PROCESSING,
        updatedAt: new Date().toISOString()
      });

      // 3秒后自动变为待收货
      pendingTimers[order.id + '_ship'] = setTimeout(() => {
        const finalOrder = db.findOrderByIdAndUser(order.id, req.user.id);
        if (!finalOrder || finalOrder.status === ORDER_STATUS.CANCELLED) return;

        db.updateOrder(order.id, req.user.id, {
          status: ORDER_STATUS.SHIPPED,
          statusText: STATUS_TEXT.SHIPPED,
          updatedAt: new Date().toISOString()
        });

        delete pendingTimers[order.id + '_ship'];
      }, 3000);

      delete pendingTimers[order.id];
    }, 1500);

    res.json({ success: true, message: '支付成功', data: { orderId: order.id } });
  } catch (err) {
    console.error('[ORDERS ERROR] Pay:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * POST /api/orders/:id/cancel
 * 取消订单（需要认证）
 */
router.post('/:id/cancel', authMiddleware, (req, res) => {
  try {
    const order = db.findOrderByIdAndUser(req.params.id, req.user.id);

    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.PROCESSING) {
      return res.status(400).json({ success: false, message: '当前订单状态不支持取消' });
    }

    // 清除未执行的定时器
    if (pendingTimers[order.id]) { clearTimeout(pendingTimers[order.id]); delete pendingTimers[order.id]; }
    if (pendingTimers[order.id + '_ship']) { clearTimeout(pendingTimers[order.id + '_ship']); delete pendingTimers[order.id + '_ship']; }

    db.updateOrder(order.id, req.user.id, {
      status: ORDER_STATUS.CANCELLED,
      statusText: STATUS_TEXT.CANCELLED,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: '订单已取消' });
  } catch (err) {
    console.error('[ORDERS ERROR] Cancel:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * POST /api/orders/:id/confirm
 * 确认收货（需要认证）
 */
router.post('/:id/confirm', authMiddleware, (req, res) => {
  try {
    const order = db.findOrderByIdAndUser(req.params.id, req.user.id);

    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.status !== ORDER_STATUS.SHIPPED) {
      return res.status(400).json({ success: false, message: '当前订单状态不支持确认收货' });
    }

    db.updateOrder(order.id, req.user.id, {
      status: ORDER_STATUS.COMPLETED,
      statusText: STATUS_TEXT.COMPLETED,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: '确认收货成功' });
  } catch (err) {
    console.error('[ORDERS ERROR] Confirm:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
