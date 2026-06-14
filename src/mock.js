/**
 * Mock 数据模块 - mock.js
 * 功能：
 * 1. 提供完整的 Mock 数据集（商品、分类等）
 * 2. 支持分页查询（每页发送一次请求）
 * 3. 支持分类筛选和关键词搜索
 * 4. 与 Request.js 配合使用
 */

const Mock = (function() {
  'use strict';

  // ========== Mock 数据集 ==========
  
  // 商品数据（24个商品）
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

  // 分类数据
  const categories = [
    { id: 0, name: "全部" },
    { id: 1, name: "手机数码" },
    { id: 2, name: "电脑办公" },
    { id: 3, name: "家居生活" },
    { id: 4, name: "服饰鞋包" },
    { id: 5, name: "美妆护肤" },
    { id: 6, name: "运动户外" },
    { id: 7, name: "食品饮料" }
  ];

  // ========== 请求日志 ==========
  const requestLog = [];
  
  function logRequest(params, result) {
    requestLog.push({
      timestamp: new Date().toISOString(),
      params: { ...params },
      result: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        listLength: result.list.length
      }
    });
    console.log('[Mock][RequestLog]', `Page ${result.page}, Fetched ${result.list.length}/${result.total} items`);
  }

  // ========== 分页查询核心逻辑 ==========
  function paginateQuery(data, params) {
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 8;
    const category = params.category;
    const keyword = params.keyword || '';

    // 1. 筛选数据
    let filtered = data;
    
    // 分类筛选
    if (category && category !== '全部') {
      filtered = filtered.filter(item => item.category === category);
    }

    // 关键词搜索
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw) ||
        item.category.toLowerCase().includes(kw)
      );
    }

    // 2. 计算分页
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // 3. 获取当前页数据
    const list = filtered.slice(startIndex, endIndex);

    // 4. 返回分页结果
    return {
      success: true,
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    };
  }

  // ========== 注册 Mock 处理器 ==========
  function registerHandlers(request) {
    // 商品列表（分页 + 筛选）
    request.mock.register('/products', 'GET', (params) => {
      console.log('[Mock] 商品列表请求:', params);
      const result = paginateQuery(products, params);
      logRequest(params, result.data);
      return result;
    });

    // 商品详情
    request.mock.register('/products/:id', 'GET', (params, query) => {
      const id = parseInt(query.id || params.id);
      const product = products.find(p => p.id === id);
      if (product) {
        return { success: true, data: product };
      }
      return { success: false, message: '商品不存在' };
    });

    // 分类列表
    request.mock.register('/products/categories', 'GET', () => {
      return { success: true, data: categories };
    });

    console.log('[Mock] 已注册 3 个 Mock 处理器');
  }

  // ========== 获取请求日志 ==========
  function getRequestLog() {
    return requestLog;
  }

  // ========== 清空请求日志 ==========
  function clearRequestLog() {
    requestLog.length = 0;
  }

  // ========== 导出 ==========
  return {
    products,
    categories,
    registerHandlers,
    getRequestLog,
    clearRequestLog,
    paginateQuery
  };
})();

// 导出到全局
window.Mock = Mock;
