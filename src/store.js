/**
 * 状态管理模块 —— 类 Pinia 风格 (state + getters + actions)
 *
 * 由于本项目是原生 HTML/JS（非 Vue 框架），无法直接使用 Pinia。
 * 此处采用与 Pinia 一致的设计理念：
 *   - state:   存储响应式状态（通过 localStorage 持久化）
 *   - getters: 计算属性（基于 state 的派生值，无副作用）
 *   - actions: 动作方法（修改 state 的唯一途径，可异步）
 *
 * 使用方式 (全局挂载在 window.Store 上)：
 *   Store.cart.state.items       -> 购物车商品项
 *   Store.cart.getters.total()   -> 购物车总价
 *   Store.cart.actions.add(1, 2) -> 添加商品 (actions 是修改 state 的唯一途径)
 */

// ========== 通用工具：defineStore（模拟 Pinia 的 defineStore）==========
/**
 * @param {string} id          - store 的唯一 ID（用于事件通知）
 * @param {Object} definition  - { state: Object, getters: Object, actions: Object }
 * @param {Object} options     - { persist: boolean, storageKey: string }
 */
function defineStore(id, definition, options) {
  options = options || {};
  const persist = options.persist !== false; // 默认持久化
  const storageKey = options.storageKey || ('store_' + id);

  // ---- 初始化 state ----
  // 若本地有持久化数据则恢复，否则使用默认初始 state
  let reactiveState = definition.state || {};
  if (persist) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        reactiveState = JSON.parse(saved);
      }
    } catch (e) {
      // 解析失败则使用默认值
    }
  }

  // ---- 持久化辅助 ----
  function saveState() {
    if (!persist) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(reactiveState));
    } catch (e) { /* localStorage 可能因隐私模式失败，静默忽略 */ }
  }

  // ---- 状态变更通知（类似 Pinia 的 $subscribe）----
  function emitChange() {
    try {
      window.dispatchEvent(new CustomEvent(id + 'Change', { detail: reactiveState }));
    } catch (e) { /* 旧浏览器不支持 CustomEvent 时忽略 */ }
  }

  // ---- 包装 actions：每次 action 执行后自动持久化 + 通知 ----
  const wrappedActions = {};
  Object.keys(definition.actions || {}).forEach(function(actionName) {
    wrappedActions[actionName] = function() {
      const result = definition.actions[actionName].apply(
        { state: reactiveState, saveState: saveState },
        arguments
      );
      // action 执行后持久化并通知
      saveState();
      emitChange();
      return result;
    };
  });

  // ---- 包装 getters：作为只读计算属性 ----
  const wrappedGetters = {};
  Object.keys(definition.getters || {}).forEach(function(getterName) {
    wrappedGetters[getterName] = function() {
      return definition.getters[getterName].apply({ state: reactiveState }, arguments);
    };
  });

  return {
    $id: id,
    state: reactiveState,
    getters: wrappedGetters,
    actions: wrappedActions,
    $reset: function() {
      reactiveState = definition.state || {};
      saveState();
      emitChange();
    }
  };
}

// ============================================================
// 1. 认证 Store（对应 Pinia: useAuthStore）
//    state:   token, user
//    getters: isLoggedIn, username
//    actions: setAuth, clearAuth
// ============================================================
const authStore = defineStore('auth', {
  state: {
    token: null,
    user: null
  },
  getters: {
    isLoggedIn: function() {
      return !!this.state.token;
    },
    username: function() {
      return this.state.user ? this.state.user.username : '';
    }
  },
  actions: {
    setAuth: function(token, user) {
      this.state.token = token;
      this.state.user = user;
    },
    clearAuth: function() {
      this.state.token = null;
      this.state.user = null;
    },
    updateUser: function(partial) {
      if (this.state.user) {
        this.state.user = Object.assign({}, this.state.user, partial);
      }
    }
  }
});

// ============================================================
// 2. 购物车 Store（对应 Pinia: useCartStore）
//    state:   items: [{ productId, quantity }]
//    getters: totalCount, totalPrice(products), isEmpty, getItemQuantity
//    actions: addItem, removeItem, updateQuantity, clearCart
// ============================================================
const cartStore = defineStore('cart', {
  state: {
    items: []  // [{ productId, quantity }]
  },
  getters: {
    totalCount: function() {
      return this.state.items.reduce(function(sum, item) {
        return sum + item.quantity;
      }, 0);
    },
    isEmpty: function() {
      return this.state.items.length === 0;
    },
    itemCount: function() {
      return this.state.items.length;
    },
    /**
     * 计算购物车总价
     * @param {Array} products - 商品列表（用于查询价格）
     */
    totalPrice: function(products) {
      return this.state.items.reduce(function(sum, item) {
        const product = products ? products.find(function(p) { return p.id === item.productId; }) : null;
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);
    },
    /**
     * 查询某商品在购物车中的数量
     */
    getItemQuantity: function(productId) {
      const item = this.state.items.find(function(i) { return i.productId === productId; });
      return item ? item.quantity : 0;
    },
    /**
     * 获取所有购物车项（用于渲染）
     */
    getItems: function() {
      return this.state.items.slice(); // 返回副本，防止外部直接修改
    }
  },
  actions: {
    /**
     * 添加商品到购物车（若已存在则累加数量）
     */
    addItem: function(productId, quantity) {
      quantity = quantity || 1;
      const existing = this.state.items.find(function(i) { return i.productId === productId; });
      if (existing) {
        existing.quantity += quantity;
        if (existing.quantity > 99) existing.quantity = 99;
      } else {
        this.state.items.push({ productId: productId, quantity: quantity });
      }
    },

    /**
     * 直接设置某商品的数量
     */
    setItemQuantity: function(productId, quantity) {
      const item = this.state.items.find(function(i) { return i.productId === productId; });
      if (item) {
        item.quantity = Math.max(1, Math.min(99, quantity));
      }
    },

    /**
     * 移除商品
     */
    removeItem: function(productId) {
      this.state.items = this.state.items.filter(function(i) { return i.productId !== productId; });
    },

    /**
     * 清空购物车
     */
    clearCart: function() {
      this.state.items = [];
    }
  }
});

// ============================================================
// 3. UI Store（页面级别状态，如当前路由/筛选条件等）
//    state:   currentView, orderFilter
//    getters: (可选)
//    actions: setView, setOrderFilter
// ============================================================
const uiStore = defineStore('ui', {
  state: {
    currentView: 'home',
    orderFilter: 'all',
    orderPage: 1,
    searchKeyword: ''
  },
  getters: {},
  actions: {
    setView: function(view) { this.state.currentView = view; },
    setOrderFilter: function(filter) {
      this.state.orderFilter = filter;
      this.state.orderPage = 1;
    },
    setOrderPage: function(page) { this.state.orderPage = page; },
    setSearchKeyword: function(kw) { this.state.searchKeyword = kw; }
  }
}, { persist: false }); // UI 状态不持久化

// ========== 兼容旧 API（向后兼容）==========
// 为了保持 app.js 中原有的 Store.xxx() 调用不报错，这里提供兼容层
const Store = {
  // --- Auth 兼容层 ---
  isLoggedIn: function() { return authStore.getters.isLoggedIn(); },
  getUser: function() { return authStore.state.user; },
  setAuth: function(token, user) { return authStore.actions.setAuth(token, user); },
  clearAuth: function() { return authStore.actions.clearAuth(); },

  // --- Cart 兼容层 ---
  getCart: function() { return cartStore.getters.getItems(); },
  saveCart: function(items) {
    // 直接重置 items 并持久化
    cartStore.state.items = items || [];
    // 手动触发持久化 + 通知
    localStorage.setItem('store_cart', JSON.stringify(cartStore.state));
    try {
      window.dispatchEvent(new CustomEvent('cartChange', { detail: cartStore.state }));
    } catch (e) {}
  },
  addToCart: function(productId, quantity) { return cartStore.actions.addItem(productId, quantity); },
  updateCartQuantity: function(productId, quantity) {
    return cartStore.actions.setItemQuantity(productId, quantity);
  },
  removeFromCart: function(productId) { return cartStore.actions.removeItem(productId); },
  clearCart: function() { return cartStore.actions.clearCart(); },
  getCartTotal: function(products) { return cartStore.getters.totalPrice(products); },
  getCartCount: function() { return cartStore.getters.totalCount(); },

  // --- 暴露底层 Pinia 风格的 store（供新代码使用）---
  auth: authStore,
  cart: cartStore,
  ui: uiStore
};

window.Store = Store;
