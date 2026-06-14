/**
 * 商品 API 模块 - productApi.js
 * 功能：
 * 1. 封装商品相关的 API 请求
 * 2. 支持分页查询和分类筛选
 * 3. 自动切换 Mock 和真实 API
 */

const ProductAPI = (function() {
  'use strict';

  // 请求实例
  const request = window.Request;

  // 状态
  let currentPage = 1;
  let currentCategory = '全部';
  let currentKeyword = '';
  let currentPageSize = 8;
  let isLoading = false;

  // 回调函数
  let onSuccess = null;
  let onError = null;
  let onComplete = null;

  // ========== 配置方法 ==========
  
  /**
   * 设置每页数量
   */
  function setPageSize(size) {
    currentPageSize = size;
  }

  /**
   * 设置分类
   */
  function setCategory(category) {
    currentCategory = category;
    currentPage = 1; // 切换分类时重置页码
  }

  /**
   * 设置关键词
   */
  function setKeyword(keyword) {
    currentKeyword = keyword;
    currentPage = 1; // 搜索时重置页码
  }

  /**
   * 重置到第一页
   */
  function resetPage() {
    currentPage = 1;
  }

  /**
   * 设置回调
   */
  function setCallbacks({ success, error, complete }) {
    if (success) onSuccess = success;
    if (error) onError = error;
    if (complete) onComplete = complete;
  }

  // ========== 核心请求方法 ==========

  /**
   * 获取商品列表（分页 + 筛选）
   * @param {Object} options - 请求选项
   * @param {boolean} options.append - 是否追加数据（加载更多模式）
   */
  async function getProductList(options = {}) {
    const { append = false } = options;

    if (isLoading) {
      console.log('[ProductAPI] 请求中，跳过重复请求');
      return null;
    }

    isLoading = true;

    // 如果不是追加模式，重置页码
    if (!append) {
      currentPage = 1;
    }

    try {
      const params = {
        page: currentPage,
        pageSize: currentPageSize
      };

      // 添加筛选条件
      if (currentCategory && currentCategory !== '全部') {
        params.category = currentCategory;
      }
      if (currentKeyword) {
        params.keyword = currentKeyword;
      }

      console.log(`[ProductAPI] 获取商品列表: 页码=${currentPage}, 每页=${currentPageSize}, 分类=${currentCategory || '全部'}, 关键词="${currentKeyword || ''}"`);

      const result = await request.get('/products', params);

      if (result.success) {
        // 更新页码（如果是追加模式且有更多数据）
        if (append && result.data.pagination.hasMore) {
          currentPage++;
        }

        console.log(`[ProductAPI] 获取成功: 共 ${result.data.pagination.total} 条, 当前页 ${result.data.pagination.page}/${result.data.pagination.totalPages}`);

        if (onSuccess) {
          onSuccess(result.data, { append, ...params });
        }

        return result.data;
      } else {
        throw new Error(result.message || '获取商品列表失败');
      }
    } catch (err) {
      console.error('[ProductAPI] 获取商品列表失败:', err);
      
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      isLoading = false;
      
      if (onComplete) {
        onComplete();
      }
    }
  }

  /**
   * 获取下一页（加载更多）
   */
  async function loadMore() {
    return getProductList({ append: true });
  }

  /**
   * 获取商品详情
   */
  async function getProductDetail(id) {
    try {
      console.log(`[ProductAPI] 获取商品详情: id=${id}`);
      const result = await request.get(`/products/${id}`);
      return result.success ? result.data : null;
    } catch (err) {
      console.error('[ProductAPI] 获取商品详情失败:', err);
      return null;
    }
  }

  /**
   * 获取分类列表
   */
  async function getCategories() {
    try {
      console.log('[ProductAPI] 获取分类列表');
      const result = await request.get('/products/categories');
      return result.success ? result.data : [];
    } catch (err) {
      console.error('[ProductAPI] 获取分类列表失败:', err);
      return [];
    }
  }

  /**
   * 筛选商品
   */
  async function filterProducts({ category, keyword } = {}) {
    if (category !== undefined) currentCategory = category;
    if (keyword !== undefined) currentKeyword = keyword;
    currentPage = 1;
    return getProductList({ append: false });
  }

  // ========== 状态查询 ==========

  function getCurrentPage() {
    return currentPage;
  }

  function getCurrentCategory() {
    return currentCategory;
  }

  function getCurrentKeyword() {
    return currentKeyword;
  }

  function isRequestLoading() {
    return isLoading;
  }

  // ========== 导出 ==========
  return {
    // 配置
    setPageSize,
    setCategory,
    setKeyword,
    setCallbacks,
    
    // 请求
    getProductList,
    loadMore,
    getProductDetail,
    getCategories,
    filterProducts,
    
    // 状态
    getCurrentPage,
    getCurrentCategory,
    getCurrentKeyword,
    isLoading: isRequestLoading,
    resetPage
  };
})();

// 导出到全局
window.ProductAPI = ProductAPI;
