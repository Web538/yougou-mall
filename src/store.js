/**
 * 状态管理模块
 * 管理应用全局状态
 */

const Store = {
  // 用户登录状态
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
  },

  // 购物车
  getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  },

  saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  addToCart(productId, quantity) {
    const cart = this.getCart();
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    this.saveCart(cart);
    window.dispatchEvent(new Event('cartChange'));
    return cart;
  },

  updateCartQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
      item.quantity = Math.max(1, Math.min(99, quantity));
    }
    this.saveCart(cart);
    window.dispatchEvent(new Event('cartChange'));
    return cart;
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.productId !== productId);
    this.saveCart(cart);
    window.dispatchEvent(new Event('cartChange'));
    return cart;
  },

  clearCart() {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartChange'));
  },

  getCartTotal(products) {
    return this.getCart().reduce((sum, item) => {
      const product = products ? products.find(p => p.id === item.productId) : null;
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  },

  getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }
};

window.Store = Store;
