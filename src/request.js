/**
 * 独立请求工具模块 - Request.js
 * 功能：
 * 1. HTTP 请求封装（支持 Promise、拦截器）
 * 2. Mock 数据适配（无需后端即可开发）
 * 3. 请求日志（调试友好）
 */

const Request = (function() {
  'use strict';

  // ========== 配置 ==========
  const config = {
    baseURL: '/api',
    timeout: 10000,
    mockMode: true,           // 是否启用 Mock 数据
    mockDelay: 300,          // Mock 模拟延迟（毫秒）
    enableLog: true          // 是否启用日志
  };

  // ========== 请求计数器（用于日志） ==========
  let requestId = 0;

  // ========== 日志工具 ==========
  function log(type, ...args) {
    if (!config.enableLog) return;
    const timestamp = new Date().toLocaleTimeString();
    console[`%c[Request][${timestamp}][${type}]`, 'color: #1890ff; font-weight: bold', ...args);
  }

  // ========== 请求拦截器 ==========
  const interceptors = {
    request: [],
    response: []
  };

  /**
   * 添加请求拦截器
   * @param {Function} onFulfilled - 成功回调
   * @param {Function} onRejected - 失败回调
   */
  function addRequestInterceptor(onFulfilled, onRejected) {
    interceptors.request.push({ onFulfilled, onRejected });
  }

  /**
   * 添加响应拦截器
   * @param {Function} onFulfilled - 成功回调
   * @param {Function} onRejected - 失败回调
   */
  function addResponseInterceptor(onFulfilled, onRejected) {
    interceptors.response.push({ onFulfilled, onRejected });
  }

  // ========== 核心请求方法 ==========
  async function request(url, options = {}) {
    const id = ++requestId;
    const startTime = Date.now();

    // 默认配置
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    };

    // 合并配置
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };

    // 添加 Token
    const token = localStorage.getItem('token');
    if (token) {
      finalOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    // 执行请求拦截器
    let modifiedUrl = url;
    let modifiedOptions = finalOptions;
    for (const interceptor of interceptors.request) {
      try {
        const result = await interceptor.onFulfilled({ url: modifiedUrl, options: modifiedOptions });
        if (result) {
          modifiedUrl = result.url || modifiedUrl;
          modifiedOptions = result.options || modifiedOptions;
        }
      } catch (err) {
        log('REQUEST_INTERCEPTOR_ERROR', err);
      }
    }

    log('REQUEST', `#${id}`, modifiedOptions.method, modifiedUrl, modifiedOptions);

    // 检测是否使用 Mock
    if (config.mockMode && MockAdapter.shouldMock(modifiedUrl, modifiedOptions.method)) {
      return handleMock(id, modifiedUrl, modifiedOptions, startTime);
    }

    // 发起真实请求
    try {
      const response = await fetchWithTimeout(config.baseURL + modifiedUrl, modifiedOptions);
      const data = await response.json();
      const duration = Date.now() - startTime;

      log('RESPONSE', `#${id}`, response.status, `+${duration}ms`, data);

      // 处理响应拦截器
      let result = { data, status: response.status };
      for (const interceptor of interceptors.response) {
        try {
          const interceptorResult = await interceptor.onFulfilled(result);
          if (interceptorResult) result = interceptorResult;
        } catch (err) {
          log('RESPONSE_INTERCEPTOR_ERROR', err);
        }
      }

      // 处理错误状态码
      if (!response.ok) {
        throw new Error(result.data?.message || `HTTP ${response.status}`);
      }

      return result.data;
    } catch (err) {
      const duration = Date.now() - startTime;
      log('ERROR', `#${id}`, `+${duration}ms`, err.message);
      throw err;
    }
  }

  // ========== 带超时的 fetch ==========
  function fetchWithTimeout(url, options) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('请求超时'));
      }, options.timeout || config.timeout);

      fetch(url, options)
        .then(res => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  // ========== Mock 适配器 ==========
  const MockAdapter = {
    // 判断是否需要使用 Mock
    shouldMock(url, method) {
      // Mock 模式下，所有 /api 开头的请求都走 Mock
      // 实际项目中可以配置白名单
      return true;
    },

    // 处理 Mock 请求
    async handle(url, options) {
      const id = requestId;
      const startTime = Date.now();

      log('MOCK', `#${id}`, options.method, url);

      // 解析 URL 和参数
      const urlObj = new URL(url, window.location.origin);
      const params = Object.fromEntries(urlObj.searchParams);

      // 获取 Mock 处理函数
      const handler = getMockHandler(url, options.method);
      if (!handler) {
        throw new Error(`Mock: 未找到处理器 for ${options.method} ${url}`);
      }

      // 模拟延迟
      await sleep(config.mockDelay);

      // 调用 Mock 处理函数
      let result;
      const body = options.body ? JSON.parse(options.body) : null;

      if (options.method === 'GET') {
        result = await handler(params);
      } else {
        result = await handler(body, params);
      }

      const duration = Date.now() - startTime;
      log('MOCK_RESPONSE', `#${id}`, `+${duration}ms`, result);

      return result;
    }
  };

  function handleMock(id, url, options, startTime) {
    return MockAdapter.handle(url, options);
  }

  // ========== Mock 处理器注册表 ==========
  const mockHandlers = new Map();

  function registerMockHandler(url, method, handler) {
    const key = `${method}:${url}`;
    mockHandlers.set(key, handler);
    log('MOCK_REGISTER', method, url);
  }

  function getMockHandler(url, method) {
    // 精确匹配
    const key = `${method}:${url}`;
    if (mockHandlers.has(key)) {
      return mockHandlers.get(key);
    }

    // 通配符匹配（支持路径参数如 /products/:id）
    for (const [k, handler] of mockHandlers) {
      const [kMethod, kPath] = k.split(':');
      if (kMethod === method && matchPath(kPath, url)) {
        return handler;
      }
    }

    return null;
  }

  // 路径匹配（支持 :id 等参数）
  function matchPath(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return false;

    return patternParts.every((part, i) => {
      if (part.startsWith(':')) return true;
      return part === pathParts[i];
    });
  }

  // ========== 便捷方法 ==========
  function get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(url + (query ? `?${query}` : ''), { method: 'GET' });
  }

  function post(url, data) {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  function put(url, data) {
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  function del(url) {
    return request(url, { method: 'DELETE' });
  }

  // ========== 配置方法 ==========
  function setConfig(key, value) {
    if (typeof key === 'object') {
      Object.assign(config, key);
    } else {
      config[key] = value;
    }
  }

  function getConfig() {
    return { ...config };
  }

  // ========== 工具方法 ==========
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== 导出 ==========
  return {
    request,
    get,
    post,
    put,
    delete: del,
    config,
    setConfig,
    getConfig,
    interceptors: {
      request: addRequestInterceptor,
      response: addResponseInterceptor
    },
    mock: {
      register: registerMockHandler,
      getHandler: getMockHandler
    }
  };
})();

// 导出到全局
window.Request = Request;
