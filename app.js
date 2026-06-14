/**
 * 优购商城 - 核心业务逻辑
 * 包含用户认证、商品、购物车、订单等功能
 */

// ========== 商品数据 ==========
const products = [
  { id: 1, name: "Apple iPhone 15 Pro 256GB", category: "手机数码", price: 7999, originalPrice: 8999, icon: "📱", rating: 4.8, sales: 12580, description: "搭载A17 Pro芯片，钛金属机身，专业级摄影系统，支持USB 3.0高速传输。", specs: ["A17 Pro 处理器", "6.1英寸 Super Retina XDR", "48MP 主摄系统", "256GB 存储空间", "钛金属机身设计"] },
  { id: 2, name: "Sony WH-1000XM5 无线降噪耳机", category: "手机数码", price: 2299, originalPrice: 2899, icon: "🎧", rating: 4.9, sales: 8920, description: "业界领先的降噪技术，30小时续航，舒适轻量设计，高解析度音频。", specs: ["业界领先降噪", "30小时超长续航", "高解析度音频", "多点连接", "轻量舒适设计"] },
  { id: 3, name: "MacBook Air M3 13英寸 笔记本电脑", category: "电脑办公", price: 8999, originalPrice: 9999, icon: "💻", rating: 4.9, sales: 6540, description: "Apple M3芯片，轻薄便携，长达18小时电池续航，Liquid Retina显示屏。", specs: ["Apple M3 芯片", "13.6英寸 Liquid Retina", "18小时电池续航", "仅1.24kg", "静音无风扇设计"] },
  { id: 4, name: "Nike Air Jordan 1 High OG 运动鞋", category: "运动户外", price: 1299, originalPrice: 1599, icon: "👟", rating: 4.7, sales: 15230, description: "经典高帮设计，优质皮革鞋面，Air气垫缓震，潮流百搭款式。", specs: ["优质皮革鞋面", "Air气垫缓震", "经典高帮设计", "耐磨橡胶外底", "潮流配色"] },
  { id: 5, name: "Dyson V15 Detect 无绳吸尘器", category: "家居生活", price: 4690, originalPrice: 5490, icon: "🧹", rating: 4.8, sales: 4280, description: "激光探测灰尘，智能感应吸力，60分钟续航，强劲吸力。", specs: ["激光灰尘探测", "智能感应技术", "60分钟续航", "HEPA过滤系统", "多种清洁刷头"] },
  { id: 6, name: "Levi's 501 原创直筒牛仔裤", category: "服饰鞋包", price: 599, originalPrice: 799, icon: "👖", rating: 4.6, sales: 23560, description: "经典501款式，100%棉质面料，经典五口袋设计，百搭舒适。", specs: ["100%棉质面料", "经典直筒版型", "五口袋设计", "纽扣门襟", "经典水洗工艺"] },
  { id: 7, name: "Apple Watch Series 9 GPS 45mm", category: "手机数码", price: 2999, originalPrice: 3499, icon: "⌚", rating: 4.8, sales: 9870, description: "全新S9芯片，双指互点操作，精准健康监测，全天候显示。", specs: ["S9 SiP 芯片", "45mm 全天候显示", "双指互点操作", "精准健康监测", "ECG 心电图"] },
  { id: 8, name: "Nintendo Switch OLED 游戏主机", category: "手机数码", price: 2299, originalPrice: 2599, icon: "🎮", rating: 4.9, sales: 11230, description: "7英寸OLED屏幕，鲜艳色彩显示，随时随地畅玩游戏，64GB存储。", specs: ["7英寸 OLED 屏幕", "64GB 存储空间", "加宽可调支架", "增强型底座", "长效电池"] },
  { id: 9, name: "小米米家扫地机器人 Pro", category: "家居生活", price: 2499, originalPrice: 2999, icon: "🤖", rating: 4.7, sales: 18650, description: "LDS激光导航，4000Pa强劲吸力，智能避障，APP远程控制。", specs: ["LDS 激光导航", "4000Pa 强劲吸力", "智能避障", "APP 远程控制", "自动回充"] },
  { id: 10, name: "雅诗兰黛小棕瓶精华 50ml", category: "美妆护肤", price: 950, originalPrice: 1180, icon: "💄", rating: 4.9, sales: 28900, description: "经典修护精华，二裂酵母配方，改善肌肤状态，淡化细纹。", specs: ["50ml 大容量", "二裂酵母配方", "深层修护", "淡化细纹", "改善肤质"] },
  { id: 11, name: "SK-II 神仙水 230ml", category: "美妆护肤", price: 1590, originalPrice: 1890, icon: "✨", rating: 4.8, sales: 21340, description: "90%以上PITERA精华，改善肤质，提亮肤色，经典护肤水。", specs: ["230ml 容量", "90%+ PITERA", "改善肤质", "提亮肤色", "保湿修护"] },
  { id: 12, name: "三只松鼠坚果大礼包 1588g", category: "食品饮料", price: 99, originalPrice: 158, icon: "🥜", rating: 4.6, sales: 56780, description: "9种坚果组合，新鲜烘焙，独立包装，营养健康零食首选。", specs: ["1588g 大包装", "9种坚果组合", "新鲜烘焙", "独立小包装", "营养健康"] },
  { id: 13, name: "伊利安慕希希腊风味酸奶 200g*12盒", category: "食品饮料", price: 69, originalPrice: 89, icon: "🥛", rating: 4.7, sales: 45230, description: "希腊风味酸奶，浓郁口感，优质奶源，营养早餐好选择。", specs: ["200g*12盒", "希腊风味", "浓郁口感", "优质奶源", "营养丰富"] },
  { id: 14, name: "Kindle Paperwhite 5 电子书阅读器", category: "电脑办公", price: 998, originalPrice: 1299, icon: "📚", rating: 4.8, sales: 7890, description: "6.8英寸墨水屏，防水设计，可调色温，续航长达数周。", specs: ["6.8英寸墨水屏", "防水设计 (IPX8)", "可调色温", "8GB 存储", "数周续航"] },
  { id: 15, name: "Under Armour 运动T恤 男士", category: "运动户外", price: 249, originalPrice: 349, icon: "👕", rating: 4.6, sales: 12450, description: "速干透气面料，运动剪裁，舒适贴身，适合各种运动。", specs: ["速干透气面料", "运动剪裁", "舒适贴身", "吸汗排湿", "多种颜色"] },
  { id: 16, name: "Coach 经典马车单肩包", category: "服饰鞋包", price: 2580, originalPrice: 3280, icon: "👜", rating: 4.7, sales: 5670, description: "经典品牌设计，优质皮革，大容量设计，商务休闲两相宜。", specs: ["优质皮革材质", "经典品牌设计", "大容量设计", "可调节肩带", "商务休闲"] },
  { id: 17, name: "九阳豆浆机 DJ13B-D818SG", category: "家居生活", price: 699, originalPrice: 899, icon: "🥤", rating: 4.7, sales: 15680, description: "免滤豆浆机，预约功能，多种食谱，一键清洗，家用必备。", specs: ["免滤设计", "预约功能", "多种食谱", "一键清洗", "1300ml 容量"] },
  { id: 18, name: "华为 MatePad Pro 11英寸 平板电脑", category: "电脑办公", price: 3999, originalPrice: 4599, icon: "📱", rating: 4.8, sales: 8760, description: "HarmonyOS系统，OLED屏幕，生产力利器，支持手写笔键盘。", specs: ["11英寸 OLED 屏幕", "HarmonyOS 系统", "强劲处理器", "支持手写笔", "长续航"] },
  { id: 19, name: "兰蔻菁纯面霜 50ml", category: "美妆护肤", price: 1680, originalPrice: 1980, icon: "🌸", rating: 4.9, sales: 12340, description: "奢华抗老面霜，玫瑰精粹，紧致肌肤，焕发光彩。", specs: ["50ml 容量", "玫瑰精粹", "抗老紧致", "滋养肌肤", "奢华质感"] },
  { id: 20, name: "安踏 KT7 篮球鞋 男款", category: "运动户外", price: 699, originalPrice: 899, icon: "🏀", rating: 4.7, sales: 9870, description: "专业篮球鞋，缓震科技，透气网面，抓地力强，球场利器。", specs: ["专业篮球鞋", "缓震科技", "透气网面", "强抓地力", "舒适包裹"] },
  { id: 21, name: "星巴克咖啡豆 深烘 250g", category: "食品饮料", price: 98, originalPrice: 128, icon: "☕", rating: 4.6, sales: 18920, description: "星巴克精选咖啡豆，深度烘焙，浓郁醇厚，新鲜烘焙。", specs: ["250g 包装", "深度烘焙", "浓郁醇厚", "精选咖啡豆", "新鲜烘焙"] },
  { id: 22, name: "Samsung 三星 Galaxy Tab S9 平板", category: "电脑办公", price: 4999, originalPrice: 5699, icon: "📱", rating: 4.8, sales: 5430, description: "11英寸 Dynamic AMOLED 2X屏幕，骁龙8 Gen2处理器，生产力平板。", specs: ["11英寸 AMOLED", "骁龙8 Gen2", "S Pen 支持", "120Hz 刷新率", "IP68 防水"] },
  { id: 23, name: "优衣库 男士摇粒绒夹克", category: "服饰鞋包", price: 299, originalPrice: 399, icon: "🧥", rating: 4.7, sales: 25670, description: "柔软温暖摇粒绒，轻量保暖，百搭款式，秋冬季必备。", specs: ["摇粒绒材质", "轻量保暖", "柔软舒适", "百搭款式", "多色可选"] },
  { id: 24, name: "飞利浦 Sonicare 电动牙刷 HX6730", category: "家居生活", price: 399, originalPrice: 599, icon: "🪥", rating: 4.7, sales: 32180, description: "声波震动技术，3种清洁模式，智能定时，专业口腔护理。", specs: ["声波震动", "3种清洁模式", "智能定时", "感应充电", "专业护理"] }
];

// ========== 分类列表 ==========
const categories = ["全部", "手机数码", "电脑办公", "家居生活", "服饰鞋包", "美妆护肤", "运动户外", "食品饮料"];

// ========== 状态管理 ==========
let state = {
  currentView: 'home',
  currentCategory: '全部',
  searchKeyword: '',
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  orders: [],
  currentProduct: null,
  checkoutQuantity: 1,
  orderFilter: 'all',
  orderPage: 1,
  pendingTimers: {}
};

// ========== 工具函数 ==========
function formatPrice(price) {
  return '¥' + price.toFixed(2);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  let stars = '';
  for (let i = 0; i < fullStars; i++) stars += '★';
  if (hasHalf) stars += '☆';
  while (stars.length < 5) stars += '☆';
  return stars;
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => {
    toast.className = 'toast';
  }, 2000);
}

// ========== 认证相关函数 ==========
function updateAuthUI() {
  const isLoggedIn = Store.isLoggedIn();
  const user = Store.getUser();
  
  const loginBtn = document.getElementById('navLoginBtn');
  const registerBtn = document.getElementById('navRegisterBtn');
  const userMenu = document.getElementById('navUserMenu');
  const usernameSpan = document.getElementById('navUsername');
  
  if (isLoggedIn && user) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    userMenu.style.display = 'block';
    usernameSpan.textContent = user.username;
  } else {
    loginBtn.style.display = '';
    registerBtn.style.display = '';
    userMenu.style.display = 'none';
  }
}

function showAuthModal(type) {
  const modal = document.getElementById('authModal');
  modal.classList.add('active');
  switchAuthForm(type);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('active');
}

function switchAuthForm(type) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (type === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await API.login(username, password);
    Store.setAuth(res.data.token, res.data.user);
    closeAuthModal();
    showToast('登录成功！欢迎 ' + res.data.user.username, 'success');
    updateAuthUI();
    // 如果在结算页或订单页，刷新页面
    if (state.currentView === 'checkout' || state.currentView === 'orders') {
      navigate(state.currentView);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  
  try {
    const res = await API.register(username, email, password, phone);
    Store.setAuth(res.data.token, res.data.user);
    closeAuthModal();
    showToast('注册成功！欢迎 ' + res.data.user.username, 'success');
    updateAuthUI();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function handleLogout() {
  // 关闭下拉菜单
  closeUserDropdown();
  
  // 二次确认退出登录
  if (!confirm('确定要退出登录吗？')) {
    return;
  }
  
  Store.clearAuth();
  state.orders = [];
  showToast('已退出登录', '');
  updateAuthUI();
  navigate('home');
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function closeUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
  }
}

// ========== 个人中心 ==========
async function loadProfile() {
  try {
    const res = await API.getProfile();
    const user = res.data;
    
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileInputUsername').value = user.username;
    document.getElementById('profileInputEmail').value = user.email;
    document.getElementById('profileInputPhone').value = user.phone || '';
  } catch (err) {
    showToast('加载个人信息失败', 'error');
  }
}

function showProfileTab(tab) {
  document.getElementById('profileInfoTab').style.display = tab === 'info' ? 'block' : 'none';
  document.getElementById('profilePasswordTab').style.display = tab === 'password' ? 'block' : 'none';
  document.getElementById('tabInfo').classList.toggle('active', tab === 'info');
  document.getElementById('tabPassword').classList.toggle('active', tab === 'password');
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const phone = document.getElementById('profileInputPhone').value.trim();
  
  try {
    await API.updateProfile({ phone });
    showToast('个人信息更新成功！', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handlePasswordSubmit(event) {
  event.preventDefault();
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    showToast('两次输入的密码不一致', 'error');
    return;
  }
  
  try {
    await API.changePassword(oldPassword, newPassword);
    showToast('密码修改成功！', 'success');
    document.getElementById('passwordForm').reset();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========== 导航函数 ==========
function navigate(view) {
  // 未登录用户访问需要登录的页面
  if ((view === 'checkout' || view === 'orders' || view === 'profile') && !Store.isLoggedIn()) {
    showToast('请先登录', '');
    showAuthModal('login');
    return;
  }
  
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');
  
  if (view === 'cart') renderCart();
  if (view === 'orders') loadOrders();
  if (view === 'checkout') renderCheckout();
  if (view === 'profile') {
    loadProfile();
    showProfileTab('info');
  }
  
  window.scrollTo(0, 0);
}

// ========== 分类渲染 ==========
function renderCategories() {
  const container = document.getElementById('categoryList');
  container.innerHTML = categories.map(cat => 
    `<div class="category-item ${cat === state.currentCategory ? 'active' : ''}" onclick="selectCategory('${cat}')">${cat}</div>`
  ).join('');
}

function selectCategory(category) {
  state.currentCategory = category;
  renderCategories();
  renderProducts();
  document.getElementById('sectionTitle').textContent = 
    category === '全部' ? '🔥 热门推荐' : `📂 ${category}`;
}

// ========== 商品列表渲染 ==========
function getFilteredProducts() {
  let filtered = products.slice();
  
  if (state.currentCategory !== '全部') {
    filtered = filtered.filter(p => p.category === state.currentCategory);
  }
  
  if (state.searchKeyword.trim()) {
    const kw = state.searchKeyword.trim().toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      p.category.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw)
    );
  }
  
  const sortValue = document.getElementById('sortSelect')?.value || 'default';
  switch (sortValue) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'sales': filtered.sort((a, b) => b.sales - a.sales); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
  }
  
  return filtered;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const filtered = getFilteredProducts();
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
      <div style="font-size: 80px; margin-bottom: 15px;">🔍</div>
      <p style="font-size: 16px;">没有找到相关商品，换个关键词试试吧</p>
    </div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(p => `
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

// ========== 商品详情 ==========
function showProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  state.currentProduct = product;
  state.checkoutQuantity = 1;
  navigate('product');
  
  const container = document.getElementById('productDetail');
  container.innerHTML = `
    <div class="detail-container">
      <div class="detail-image">${product.icon}</div>
      <div class="detail-info">
        <h1>${product.name}</h1>
        <span class="detail-category">${product.category}</span>
        <div class="detail-rating">${renderStars(product.rating)} ${product.rating} · 已售 ${product.sales}</div>
        <div class="detail-price">
          <span class="price"><span class="currency">¥</span>${product.price}</span>
          <span class="original-price">¥${product.originalPrice}</span>
          <span class="discount">省¥${product.originalPrice - product.price}</span>
        </div>
        <div class="detail-description">${product.description}</div>
        <div class="detail-specs">
          <h3>📋 商品规格</h3>
          <ul>${product.specs.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="quantity-selector">
          <label>数量：</label>
          <div class="quantity-control">
            <button onclick="changeQuantity(-1)">−</button>
            <input type="number" id="productQuantity" value="1" min="1" readonly>
            <button onclick="changeQuantity(1)">+</button>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary" onclick="addToCartFromDetail()">🛒 加入购物车</button>
          <button class="btn-primary" onclick="buyNow()">⚡ 立即购买</button>
        </div>
      </div>
    </div>
  `;
}

function changeQuantity(delta) {
  const input = document.getElementById('productQuantity');
  if (!input) return;
  let qty = parseInt(input.value) + delta;
  if (qty < 1) qty = 1;
  if (qty > 99) qty = 99;
  input.value = qty;
  state.checkoutQuantity = qty;
}

function addToCartFromDetail() {
  if (state.currentProduct) {
    addToCart(state.currentProduct.id, state.checkoutQuantity);
  }
}

function buyNow() {
  if (state.currentProduct) {
    addToCart(state.currentProduct.id, state.checkoutQuantity, true);
    navigate('checkout');
  }
}

// ========== 搜索功能 ==========
function handleSearch() {
  const input = document.getElementById('searchInput');
  state.searchKeyword = input.value;
  state.currentCategory = '全部';
  renderCategories();
  navigate('home');
  renderProducts();
  document.getElementById('sectionTitle').textContent = 
    state.searchKeyword.trim() ? `🔍 搜索："${state.searchKeyword}"` : '🔥 热门推荐';
  
  if (state.searchKeyword.trim()) {
    const count = getFilteredProducts().length;
    showToast(`找到 ${count} 个相关商品`, 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
});

// ========== 购物车功能 ==========
function addToCart(productId, quantity, silent = false) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  Store.addToCart(productId, quantity);
  updateCartBadge();
  
  if (!silent) {
    showToast(`已添加 ${product.name} 到购物车`, 'success');
  }
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.productId === productId);
  if (!item) return;
  
  item.quantity += delta;
  if (item.quantity < 1) item.quantity = 1;
  if (item.quantity > 99) item.quantity = 99;
  
  Store.saveCart(state.cart);
  renderCart();
  updateCartBadge();
}

function removeFromCart(productId) {
  Store.removeFromCart(productId);
  state.cart = Store.getCart();
  renderCart();
  updateCartBadge();
  showToast('已从购物车移除', '');
}

function clearCart() {
  Store.clearCart();
  state.cart = [];
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const total = Store.getCartCount();
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = total;
}

function getCartTotal() {
  return Store.getCartTotal(products);
}

function renderCart() {
  const container = document.getElementById('cartContent');
  state.cart = Store.getCart();
  
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="icon">🛒</div>
        <p>购物车空空如也，快去挑选心仪商品吧~</p>
        <button class="btn-primary" onclick="navigate('home')">去逛商场</button>
      </div>
    `;
    return;
  }
  
  const total = getCartTotal();
  const totalQty = Store.getCartCount();
  
  container.innerHTML = `
    <div class="cart-list">
      ${state.cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        const itemTotal = product.price * item.quantity;
        return `
          <div class="cart-item">
            <div class="cart-item-image" onclick="showProductDetail(${product.id})">${product.icon}</div>
            <div class="cart-item-info" onclick="showProductDetail(${product.id})">
              <div class="cart-item-name">${product.name}</div>
              <div class="cart-item-price">¥${product.price}</div>
            </div>
            <div class="quantity-control">
              <button onclick="updateCartQuantity(${product.id}, -1)">−</button>
              <input type="number" value="${item.quantity}" readonly>
              <button onclick="updateCartQuantity(${product.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">¥${itemTotal.toFixed(2)}</div>
            <button class="remove-btn" onclick="removeFromCart(${product.id})">🗑️</button>
          </div>
        `;
      }).join('')}
    </div>
    <div class="cart-summary">
      <div class="cart-summary-left">
        共 ${totalQty} 件商品
        <button style="margin-left: 15px; padding: 6px 14px; border: 1px solid #ddd; background: #fff; border-radius: 15px; cursor: pointer; color: #666;" onclick="if(confirm('确定清空购物车？'))clearCart()">清空购物车</button>
      </div>
      <div class="cart-summary-right">
        <div style="font-size: 14px; color: #666;">合计：</div>
        <div class="cart-summary-total">¥${total.toFixed(2)}</div>
        <button class="btn-primary" style="margin-top: 10px;" onclick="navigate('checkout')">去结算</button>
      </div>
    </div>
  `;
}

// ========== 结算功能 ==========
function renderCheckout() {
  const container = document.getElementById('checkoutContent');
  
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="background: #fff; border-radius: 16px; padding: 60px 20px; text-align: center; color: #999;">
        <div style="font-size: 80px; margin-bottom: 15px;">🛒</div>
        <p style="font-size: 16px; margin-bottom: 20px;">购物车空空如也，无法结算</p>
        <button class="btn-primary" onclick="navigate('home')">去逛商场</button>
      </div>
    `;
    return;
  }
  
  const subtotal = getCartTotal();
  const shipping = subtotal >= 99 ? 0 : 10;
  const discount = 0;
  const total = subtotal + shipping - discount;
  
  container.innerHTML = `
    <div class="checkout-form">
      <h3>📍 收货信息</h3>
      <div class="form-group">
        <label>收货人姓名 *</label>
        <input type="text" id="shippingName" placeholder="请输入收货人姓名" value="">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>联系电话 *</label>
          <input type="tel" id="shippingPhone" placeholder="请输入手机号码" value="">
        </div>
        <div class="form-group">
          <label>所在地区</label>
          <input type="text" id="shippingRegion" placeholder="省/市/区" value="">
        </div>
      </div>
      <div class="form-group">
        <label>详细地址 *</label>
        <textarea id="shippingAddress" placeholder="请输入详细地址，如街道、门牌号等"></textarea>
      </div>
      
      <h3 style="margin-top: 25px;">💳 支付方式</h3>
      <div class="payment-methods">
        <div class="payment-option active" onclick="selectPayment(this)">
          <input type="radio" name="payment" value="alipay" checked>
          <span class="pm-icon">💰</span>支付宝
        </div>
        <div class="payment-option" onclick="selectPayment(this)">
          <input type="radio" name="payment" value="wechat">
          <span class="pm-icon">💬</span>微信支付
        </div>
        <div class="payment-option" onclick="selectPayment(this)">
          <input type="radio" name="payment" value="card">
          <span class="pm-icon">💳</span>银行卡
        </div>
        <div class="payment-option" onclick="selectPayment(this)">
          <input type="radio" name="payment" value="cod">
          <span class="pm-icon">💵</span>货到付款
        </div>
      </div>
      
      <h3 style="margin-top: 25px;">📝 订单备注</h3>
      <div class="form-group">
        <textarea id="orderNote" placeholder="选填，请输入您的留言（如颜色、尺寸偏好等）"></textarea>
      </div>
    </div>
    
    <div class="checkout-summary">
      <h3>🧾 订单摘要</h3>
      <div class="summary-item-list">
        ${state.cart.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return '';
          return `<div class="summary-item">
            <span>${product.name} × ${item.quantity}</span>
            <span>¥${(product.price * item.quantity).toFixed(2)}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="summary-row"><span>商品合计</span><span>¥${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>运费 ${shipping === 0 ? '(满99包邮)' : ''}</span><span>${shipping === 0 ? '免运费' : '¥' + shipping.toFixed(2)}</span></div>
      <div class="summary-row"><span>优惠</span><span>-¥${discount.toFixed(2)}</span></div>
      <div class="summary-row total"><span>应付总额</span><span>¥${total.toFixed(2)}</span></div>
      <div class="checkout-actions">
        <button class="btn-primary" onclick="submitOrder()">提交订单</button>
        <button class="btn-secondary" style="width: 100%; margin-top: 10px; padding: 10px;" onclick="navigate('cart')">返回购物车</button>
      </div>
    </div>
  `;
}

function selectPayment(el) {
  document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
  el.classList.add('active');
  const input = el.querySelector('input');
  if (input) input.checked = true;
}

async function submitOrder() {
  if (!Store.isLoggedIn()) {
    showToast('请先登录', '');
    showAuthModal('login');
    return;
  }
  
  const name = document.getElementById('shippingName').value.trim();
  const phone = document.getElementById('shippingPhone').value.trim();
  const address = document.getElementById('shippingAddress').value.trim();
  
  if (!name) { showToast('请输入收货人姓名', 'error'); return; }
  if (!phone) { showToast('请输入联系电话', 'error'); return; }
  if (!/^1\d{10}$/.test(phone)) { showToast('请输入正确的手机号码', 'error'); return; }
  if (!address) { showToast('请输入详细地址', 'error'); return; }
  
  const region = document.getElementById('shippingRegion').value.trim();
  const note = document.getElementById('orderNote').value.trim();
  const paymentInput = document.querySelector('input[name="payment"]:checked');
  const payment = paymentInput ? paymentInput.value : 'alipay';
  
  const paymentLabels = { alipay: '支付宝', wechat: '微信支付', card: '银行卡', cod: '货到付款' };
  
  try {
    const res = await API.createOrder({
      items: state.cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
      shipping: { name, phone, region, address },
      payment: paymentLabels[payment],
      note
    });
    
    Store.clearCart();
    state.cart = [];
    updateCartBadge();
    
    showToast('订单提交成功！', 'success');
    navigate('orders');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========== 订单管理 ==========
async function loadOrders() {
  const container = document.getElementById('ordersContent');
  
  if (!Store.isLoggedIn()) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🔒</div><p>请先登录查看订单</p><button class="btn-primary" onclick="showAuthModal('login')">去登录</button></div>`;
    return;
  }
  
  container.innerHTML = '<div class="loading">加载中</div>';
  
  try {
    const [ordersRes, countRes] = await Promise.all([
      API.getOrders({ status: state.orderFilter, page: state.orderPage, limit: 10 }),
      API.getOrderCount()
    ]);
    
    state.orders = ordersRes.data.list;
    const counts = countRes.data;
    
    renderOrdersContent(counts);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>加载订单失败: ${err.message}</p></div>`;
  }
}

function renderOrdersContent(counts) {
  const container = document.getElementById('ordersContent');
  
  const filters = [
    { key: 'all', label: '全部', count: counts.all },
    { key: 'pending', label: '待付款', count: counts.pending },
    { key: 'processing', label: '待发货', count: counts.processing },
    { key: 'shipped', label: '待收货', count: counts.shipped },
    { key: 'completed', label: '已完成', count: counts.completed },
    { key: 'cancelled', label: '已取消', count: counts.cancelled }
  ];
  
  let html = `
    <div class="order-stats">
      ${filters.map(f => `
        <div class="stat-card" onclick="filterOrders('${f.key}')">
          <div class="stat-num">${f.count}</div>
          <div class="stat-label">${f.label}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  if (state.orders.length === 0) {
    html += `<div class="empty-state"><div class="icon">📦</div><p>暂无订单</p><button class="btn-primary" onclick="navigate('home')">去购物</button></div>`;
  } else {
    html += state.orders.map(order => {
      const itemsHtml = order.items.map(item => `
        <div class="order-item">
          <div class="order-item-image">${item.icon}</div>
          <div>
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-qty">数量: ${item.quantity}</div>
          </div>
          <div class="order-item-price">¥${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('');
      
      const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
      const statusClass = order.status;
      
      let actionsHtml = '';
      if (order.status === 'pending') {
        actionsHtml = `<button onclick="payOrder('${order.id}')">立即付款</button><button onclick="cancelOrder('${order.id}')" class="cancel-btn">取消订单</button>`;
      } else if (order.status === 'processing') {
        actionsHtml = `<button onclick="cancelOrder('${order.id}')" class="cancel-btn">申请退款</button>`;
      } else if (order.status === 'shipped') {
        actionsHtml = `<button onclick="confirmReceipt('${order.id}')">确认收货</button>`;
      }
      
      return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">订单号: ${order.id}</span>
              <div class="order-date">${formatDate(order.createdAt)}</div>
            </div>
            <span class="order-status ${statusClass}">${order.statusText}</span>
          </div>
          <div class="order-items">${itemsHtml}</div>
          <div class="order-footer">
            <div class="order-total">
              ${order.shipping.name} · ${order.shipping.phone} · 共 ${totalQty} 件，合计: 
              <strong>¥${order.total.toFixed(2)}</strong>
            </div>
            <div class="order-actions">${actionsHtml}</div>
          </div>
        </div>
      `;
    }).join('');
    
    // 分页
    html += renderPagination();
  }
  
  container.innerHTML = html;
}

function renderPagination() {
  // 简单分页
  return `
    <div class="pagination">
      <button onclick="changeOrderPage(-1)" ${state.orderPage <= 1 ? 'disabled' : ''}>上一页</button>
      <span class="page-info">第 ${state.orderPage} 页</span>
      <button onclick="changeOrderPage(1)">下一页</button>
    </div>
  `;
}

function changeOrderPage(delta) {
  state.orderPage += delta;
  if (state.orderPage < 1) state.orderPage = 1;
  loadOrders();
}

function filterOrders(filter) {
  state.orderFilter = filter;
  state.orderPage = 1;
  loadOrders();
}

async function payOrder(orderId) {
  try {
    showToast('正在模拟支付...', '');
    await API.payOrder(orderId);
    showToast('支付成功！', 'success');
    setTimeout(() => loadOrders(), 100);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cancelOrder(orderId) {
  if (!confirm('确定要取消/退款该订单吗？')) return;
  try {
    await API.cancelOrder(orderId);
    showToast('订单已取消', '');
    loadOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmReceipt(orderId) {
  if (!confirm('确定已收到商品？')) return;
  try {
    await API.confirmReceipt(orderId);
    showToast('确认收货成功！', 'success');
    loadOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========== 初始化 ==========
function init() {
  renderCategories();
  renderProducts();
  updateCartBadge();
  updateAuthUI();
  
  // 绑定表单事件
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.addEventListener('submit', handleProfileSubmit);
  
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) passwordForm.addEventListener('submit', handlePasswordSubmit);
  
  // 监听认证状态变化
  window.addEventListener('authChange', () => {
    updateAuthUI();
    if (state.currentView === 'orders') loadOrders();
  });
  
  // 监听购物车变化
  window.addEventListener('cartChange', () => {
    state.cart = Store.getCart();
    updateCartBadge();
  });
  
  // 点击其他地方关闭下拉菜单
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const userMenu = document.getElementById('navUserMenu');
    if (dropdown && userMenu && !userMenu.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

init();
