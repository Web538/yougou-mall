/**
 * API 服务层模块
 * 封装所有与后端的 HTTP 请求
 */

const API_BASE_URL = '/api';

/**
 * HTTP 请求封装
 * @param {string} url - 请求地址
 * @param {Object} options - 请求配置
 * @returns {Promise<Object>} 响应数据
 */
async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // 添加 Token
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(API_BASE_URL + url, finalOptions);
    const data = await response.json();

    if (!response.ok) {
      // 处理 401 未授权
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
      }
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (err) {
    console.error('[API ERROR]', url, err);
    throw err;
  }
}

// ========== 认证 API ==========

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

async function updateProfile(data) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function changePassword(oldPassword, newPassword) {
  return request('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

// ========== 商品 API ==========

async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request('/products' + (query ? `?${query}` : ''));
}

async function getCategories() {
  return request('/products/categories');
}

async function getProduct(id) {
  return request(`/products/${id}`);
}

// ========== 订单 API ==========

async function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request('/orders' + (query ? `?${query}` : ''));
}

async function getOrderCount() {
  return request('/orders/count');
}

async function getOrder(id) {
  return request(`/orders/${id}`);
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

// ========== 导出 API 模块 ==========

window.API = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getProducts,
  getCategories,
  getProduct,
  getOrders,
  getOrderCount,
  getOrder,
  createOrder,
  payOrder,
  cancelOrder,
  confirmReceipt
};
