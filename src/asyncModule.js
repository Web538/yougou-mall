/**
 * 电商前端异步请求增强模块
 * 功能：
 * 1. 初始化 Request 和 Mock
 * 2. 扩展商品列表异步加载功能
 * 3. 支持分页查询和分类筛选
 */

(function() {
  'use strict';

  console.log('[AsyncModule] 初始化异步请求增强模块...');

  // ========== 状态 ==========
  let productList = [];
  let pagination = null;
  let isLoading = false;
  let currentSort = 'default';

  // ========== 初始化 ==========
  function init() {
    // 注册 Mock 处理器
    Mock.registerHandlers(Request);
    console.log('[AsyncModule] Mock 处理器已注册');

    // 初始化 ProductAPI
    ProductAPI.setPageSize(8);
    
    // 设置回调
    ProductAPI.setCallbacks({
      success: onLoadSuccess,
      error: onLoadError,
      complete: onLoadComplete
    });
  }

  // ========== 加载商品列表 ==========
  async function loadProducts(options = {}) {
    const { append = false } = options;

    if (isLoading) {
      console.log('[AsyncModule] 正在加载中，跳过重复请求');
      return;
    }

    isLoading = true;
    showLoading(true, append);

    try {
      const result = await ProductAPI.getProductList({
        category: state.currentCategory,
        keyword: state.searchKeyword,
        append: append
      });

      if (result) {
        if (append) {
          productList = [...productList, ...result.list];
        } else {
          productList = result.list;
        }
        pagination = result.pagination;
        renderProductList(productList);
        updatePaginationUI();
      }
    } catch (err) {
      console.error('[AsyncModule] 加载商品失败:', err);
      showError('加载商品失败，请重试');
    } finally {
      isLoading = false;
      showLoading(false, append);
    }
  }

  // ========== 加载成功回调 ==========
  function onLoadSuccess(data, params) {
    console.log('[AsyncModule] 加载成功:', data.pagination);
  }

  function onLoadError(err) {
    console.error('[AsyncModule] 加载失败:', err);
  }

  function onLoadComplete() {
    console.log('[AsyncModule] 加载完成');
  }

  // ========== 渲染商品列表 ==========
  function renderProductList(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
          <div style="font-size: 80px; margin-bottom: 15px;">🔍</div>
          <p style="font-size: 16px;">没有找到相关商品，换个关键词试试吧</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick="showProductDetail(${p.id})">
        <div class="product-image">${p.icon}</div>
        <div class="product-info">
          <span class="product-category-tag">${p.category}</span>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${renderStars(p.rating)}</span> ${p.rating} · 已售${p.sales}
          </div>
          <div class="product-price-row">
            <div class="product-price"><span class="currency">¥</span>${p.price}</div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id}, 1)">加入购物车</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ========== 加载状态 ==========
  function showLoading(show, append = false) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (show) {
      if (append) {
        // 追加模式：显示加载更多
        const existing = document.getElementById('loadMoreBtn');
        if (!existing) {
          const loadMoreDiv = document.createElement('div');
          loadMoreDiv.id = 'loadMoreBtn';
          loadMoreDiv.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 20px; color: #1890ff;';
          loadMoreDiv.innerHTML = '<span style="font-size: 24px; animation: spin 1s linear infinite;">⟳</span> 加载中...';
          grid.parentElement.appendChild(loadMoreDiv);
        }
      } else {
        // 首次加载
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div style="font-size: 48px; animation: spin 1s linear infinite; color: #1890ff;">⟳</div>
            <p style="margin-top: 15px; color: #666;">加载中...</p>
          </div>
        `;
      }
    } else {
      // 移除加载提示
      const loadMore = document.getElementById('loadMoreBtn');
      if (loadMore) loadMore.remove();
    }
  }

  // ========== 错误提示 ==========
  function showError(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.className = 'toast show error';
      setTimeout(() => { toast.className = 'toast'; }, 2000);
    }
  }

  // ========== 更新分页 UI ==========
  function updatePaginationUI() {
    if (!pagination) return;

    // 查找或创建分页容器
    let paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.id = 'paginationContainer';
      paginationContainer.className = 'pagination';
      paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 10px; padding: 20px;';
      
      const grid = document.getElementById('productGrid');
      if (grid && grid.parentElement) {
        grid.parentElement.appendChild(paginationContainer);
      }
    }

    const { page, pageSize, total, totalPages, hasMore } = pagination;

    paginationContainer.innerHTML = `
      <span style="color: #666;">共 ${total} 件商品</span>
      <span style="color: #999;">|</span>
      <span style="color: #666;">第 ${page}/${totalPages} 页</span>
      ${hasMore ? `
        <button onclick="AsyncModule.loadMore()" style="
          padding: 8px 20px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">加载更多</button>
      ` : ''}
    `;
  }

  // ========== 扩展原有函数 ==========
  
  // 保存原函数引用
  const originalSelectCategory = window.selectCategory;
  const originalHandleSearch = window.handleSearch;
  const originalInitApp = window.initApp;

  // 重写分类选择
  window.selectCategory = async function(category) {
    state.currentCategory = category;
    state.searchKeyword = '';
    ProductAPI.setCategory(category);
    ProductAPI.setKeyword('');
    
    // 更新分类高亮
    const container = document.getElementById('categoryList');
    if (container) {
      container.querySelectorAll('.category-item').forEach(el => {
        el.classList.toggle('active', el.textContent.trim() === category);
      });
    }

    // 更新标题
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) {
      sectionTitle.textContent = category === '全部' ? '🔥 热门推荐' : `📂 ${category}`;
    }

    // 异步加载商品
    await loadProducts();
  };

  // 重写搜索处理
  window.handleSearch = async function() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    state.searchKeyword = input.value.trim();
    state.currentCategory = '全部';
    ProductAPI.setKeyword(state.searchKeyword);
    ProductAPI.setCategory('全部');

    // 更新分类高亮
    const container = document.getElementById('categoryList');
    if (container) {
      container.querySelectorAll('.category-item').forEach(el => {
        el.classList.toggle('active', el.textContent.trim() === '全部');
      });
    }

    // 异步加载商品
    await loadProducts();
  };

  // 重写初始化
  window.initApp = function() {
    console.log('[AsyncModule] 拦截 initApp，添加异步加载...');
    
    // 先执行原初始化
    if (originalInitApp) {
      originalInitApp();
    }

    // 更新认证 UI
    if (typeof updateAuthUI === 'function') {
      updateAuthUI();
    }

    // 延迟加载商品（等待 DOM 渲染完成）
    setTimeout(() => {
      loadProducts();
    }, 100);
  };

  // ========== 导出模块 ==========
  window.AsyncModule = {
    loadProducts,
    loadMore: () => loadProducts({ append: true }),
    getProductList: () => productList,
    getPagination: () => pagination,
    isLoading: () => isLoading,
    init
  };

  // ========== 自动初始化 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[AsyncModule] 异步请求增强模块加载完成');
})();
