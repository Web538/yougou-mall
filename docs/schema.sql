-- ============================================================
-- 优购商城电商平台 - 数据库表结构 SQL
-- Database Schema: MySQL 5.7+ / MySQL 8.0+
-- 字符集: utf8mb4
-- 引擎: InnoDB
-- 创建时间: 2026-06-14
-- ============================================================

-- 设置默认字符集和排序规则
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 用户表 (t_user)
-- ============================================================
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID（主键）',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（唯一）',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱（唯一）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt哈希）',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态: 1=正常, 0=禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_username` (`username`) USING BTREE,
  UNIQUE KEY `uk_email` (`email`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表';

-- ============================================================
-- 2. 商品分类表 (t_category)
-- ============================================================
DROP TABLE IF EXISTS `t_category`;
CREATE TABLE `t_category` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `sort` INT(11) NOT NULL DEFAULT 0 COMMENT '排序权重（数字小优先）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_name` (`name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品分类表';

-- 初始化分类数据
INSERT INTO `t_category` (`name`, `sort`) VALUES
('手机数码', 1),
('电脑办公', 2),
('家居生活', 3),
('服饰鞋包', 4),
('美妆护肤', 5),
('运动户外', 6),
('食品饮料', 7),
('全部', 8);

-- ============================================================
-- 3. 商品表 (t_product)
-- ============================================================
DROP TABLE IF EXISTS `t_product`;
CREATE TABLE `t_product` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(255) NOT NULL COMMENT '商品名称',
  `category_id` INT(11) NOT NULL COMMENT '分类ID',
  `price` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '销售价格',
  `original_price` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '原价',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标/emoji',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '商品图片URL',
  `description` TEXT NULL COMMENT '商品描述',
  `stock` INT(11) NOT NULL DEFAULT 0 COMMENT '库存数量',
  `rating` DECIMAL(3, 1) NOT NULL DEFAULT 0.0 COMMENT '评分',
  `sales` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '销量',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '上架状态: 1=上架, 0=下架',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_category` (`category_id`) USING BTREE,
  KEY `idx_price` (`price`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品表';

-- 初始化商品数据
INSERT INTO `t_product` (`name`, `category_id`, `price`, `original_price`, `icon`, `description`, `stock`, `rating`, `sales`) VALUES
('Apple iPhone 15 Pro 256GB', 1, 7999.00, 8999.00, '📱', '搭载A17 Pro芯片，钛金属机身，专业级摄影系统，支持USB 3.0高速传输。', 1000, 4.8, 12580),
('Sony WH-1000XM5 无线降噪耳机', 1, 2299.00, 2899.00, '🎧', '业界领先的降噪技术，30小时续航，舒适轻量设计，高解析度音频。', 500, 4.9, 8920),
('MacBook Air M3 13英寸 笔记本电脑', 2, 8999.00, 9999.00, '💻', 'Apple M3芯片，轻薄便携，长达18小时电池续航，Liquid Retina显示屏。', 200, 4.9, 6540),
('Nike Air Jordan 1 High OG 运动鞋', 6, 1299.00, 1599.00, '👟', '经典高帮设计，优质皮革鞋面，Air气垫缓震，潮流百搭款式。', 800, 4.7, 15230),
('Dyson V15 Detect 无绳吸尘器', 3, 4690.00, 5490.00, '🧹', '激光探测灰尘，智能感应吸力，60分钟续航，强劲吸力。', 300, 4.8, 4280),
('Levi\'s 501 原创直筒牛仔裤', 4, 599.00, 799.00, '👖', '经典501款式，100%棉质面料，经典五口袋设计，百搭舒适。', 2000, 4.6, 23560),
('Apple Watch Series 9 GPS 45mm', 1, 2999.00, 3499.00, '⌚', '全新S9芯片，双指互点操作，精准健康监测，全天候显示。', 600, 4.8, 9870),
('Nintendo Switch OLED 游戏主机', 1, 2299.00, 2599.00, '🎮', '7英寸OLED屏幕，鲜艳色彩显示，随时随地畅玩游戏，64GB存储。', 400, 4.9, 11230),
('小米米家扫地机器人 Pro', 3, 2499.00, 2999.00, '🤖', 'LDS激光导航，4000Pa强劲吸力，智能避障，APP远程控制。', 1000, 4.7, 18650),
('雅诗兰黛小棕瓶精华 50ml', 5, 950.00, 1180.00, '💄', '经典修护精华，二裂酵母配方，改善肌肤状态，淡化细纹。', 1500, 4.9, 28900),
('SK-II 神仙水 230ml', 5, 1590.00, 1890.00, '✨', '90%以上PITERA精华，改善肤质，提亮肤色，经典护肤水。', 800, 4.8, 21340),
('三只松鼠坚果大礼包 1588g', 7, 99.00, 158.00, '🥜', '9种坚果组合，新鲜烘焙，独立包装，营养健康零食首选。', 3000, 4.6, 56780),
('伊利安慕希希腊风味酸奶 200g*12盒', 7, 69.00, 89.00, '🥛', '希腊风味酸奶，浓郁口感，优质奶源，营养早餐好选择。', 5000, 4.7, 45230),
('Kindle Paperwhite 5 电子书阅读器', 2, 998.00, 1299.00, '📚', '6.8英寸墨水屏，防水设计，可调色温，续航长达数周。', 700, 4.8, 7890),
('Under Armour 运动T恤 男士', 6, 249.00, 349.00, '👕', '速干透气面料，运动剪裁，舒适贴身，适合各种运动。', 1500, 4.6, 12450),
('Coach 经典马车单肩包', 4, 2580.00, 3280.00, '👜', '经典品牌设计，优质皮革，大容量设计，商务休闲两相宜。', 400, 4.7, 5670),
('九阳豆浆机 DJ13B-D818SG', 3, 699.00, 899.00, '🥤', '免滤豆浆机，预约功能，多种食谱，一键清洗，家用必备。', 1200, 4.7, 15680),
('华为 MatePad Pro 11英寸 平板电脑', 2, 3999.00, 4599.00, '📱', 'HarmonyOS系统，OLED屏幕，生产力利器，支持手写笔键盘。', 500, 4.8, 8760),
('兰蔻菁纯面霜 50ml', 5, 1680.00, 1980.00, '🌸', '奢华抗老面霜，玫瑰精粹，紧致肌肤，焕发光彩。', 900, 4.9, 12340),
('安踏 KT7 篮球鞋 男款', 6, 699.00, 899.00, '🏀', '专业篮球鞋，缓震科技，透气网面，抓地力强，球场利器。', 1000, 4.7, 9870),
('星巴克咖啡豆 深烘 250g', 7, 98.00, 128.00, '☕', '星巴克精选咖啡豆，深度烘焙，浓郁醇厚，新鲜烘焙。', 600, 4.6, 18920),
('Samsung 三星 Galaxy Tab S9 平板', 2, 4999.00, 5699.00, '📱', '11英寸 Dynamic AMOLED 2X屏幕，骁龙8 Gen2处理器，生产力平板。', 300, 4.8, 5430),
('优衣库 男士摇粒绒夹克', 4, 299.00, 399.00, '🧥', '柔软温暖摇粒绒，轻量保暖，百搭款式，秋冬季必备。', 1800, 4.7, 25670),
('飞利浦 Sonicare 电动牙刷 HX6730', 3, 399.00, 599.00, '🪥', '声波震动技术，3种清洁模式，智能定时，专业口腔护理。', 2500, 4.7, 32180);

-- ============================================================
-- 4. 商品规格表 (t_product_spec)
-- ============================================================
DROP TABLE IF EXISTS `t_product_spec`;
CREATE TABLE `t_product_spec` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `product_id` INT(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `spec_name` VARCHAR(255) NOT NULL COMMENT '规格名称',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_product` (`product_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品规格表';

-- 初始化商品规格数据
INSERT INTO `t_product_spec` (`product_id`, `spec_name`) VALUES
(1, 'A17 Pro 处理器'),
(1, '6.1英寸 Super Retina XDR'),
(1, '48MP 主摄系统'),
(1, '256GB 存储空间'),
(1, '钛金属机身设计'),
(2, '业界领先降噪'),
(2, '30小时超长续航'),
(2, '高解析度音频'),
(2, '多点连接'),
(2, '轻量舒适设计'),
(3, 'Apple M3 芯片'),
(3, '13.6英寸 Liquid Retina'),
(3, '18小时电池续航'),
(3, '仅1.24kg'),
(3, '静音无风扇设计'),
(4, '优质皮革鞋面'),
(4, 'Air气垫缓震'),
(4, '经典高帮设计'),
(4, '耐磨橡胶外底'),
(4, '潮流配色'),
(5, '激光灰尘探测'),
(5, '智能感应技术'),
(5, '60分钟续航'),
(5, 'HEPA过滤系统'),
(5, '多种清洁刷头'),
(6, '100%棉质面料'),
(6, '经典直筒版型'),
(6, '五口袋设计'),
(6, '纽扣门襟'),
(6, '经典水洗工艺'),
(7, 'S9 SiP 芯片'),
(7, '45mm 全天候显示'),
(7, '双指互点操作'),
(7, '精准健康监测'),
(7, 'ECG 心电图'),
(8, '7英寸 OLED 屏幕'),
(8, '64GB 存储空间'),
(8, '加宽可调支架'),
(8, '增强型底座'),
(8, '长效电池'),
(9, 'LDS 激光导航'),
(9, '4000Pa 强劲吸力'),
(9, '智能避障'),
(9, 'APP 远程控制'),
(9, '自动回充'),
(10, '50ml 大容量'),
(10, '二裂酵母配方'),
(10, '深层修护'),
(10, '淡化细纹'),
(10, '改善肤质'),
(11, '230ml 容量'),
(11, '90%+ PITERA'),
(11, '改善肤质'),
(11, '提亮肤色'),
(11, '保湿修护'),
(12, '1588g 大包装'),
(12, '9种坚果组合'),
(12, '新鲜烘焙'),
(12, '独立小包装'),
(12, '营养健康'),
(13, '200g*12盒'),
(13, '希腊风味'),
(13, '浓郁口感'),
(13, '优质奶源'),
(13, '营养丰富'),
(14, '6.8英寸墨水屏'),
(14, '防水设计 (IPX8)'),
(14, '可调色温'),
(14, '8GB 存储'),
(14, '数周续航'),
(15, '速干透气面料'),
(15, '运动剪裁'),
(15, '舒适贴身'),
(15, '吸汗排湿'),
(15, '多种颜色'),
(16, '优质皮革材质'),
(16, '经典品牌设计'),
(16, '大容量设计'),
(16, '可调节肩带'),
(16, '商务休闲'),
(17, '免滤设计'),
(17, '预约功能'),
(17, '多种食谱'),
(17, '一键清洗'),
(17, '1300ml 容量'),
(18, '11英寸 OLED 屏幕'),
(18, 'HarmonyOS 系统'),
(18, '强劲处理器'),
(18, '支持手写笔'),
(18, '长续航'),
(19, '50ml 容量'),
(19, '玫瑰精粹'),
(19, '抗老紧致'),
(19, '滋养肌肤'),
(19, '奢华质感'),
(20, '专业篮球鞋'),
(20, '缓震科技'),
(20, '透气网面'),
(20, '强抓地力'),
(20, '舒适包裹'),
(21, '250g 包装'),
(21, '深度烘焙'),
(21, '浓郁醇厚'),
(21, '精选咖啡豆'),
(21, '新鲜烘焙'),
(22, '11英寸 AMOLED'),
(22, '骁龙8 Gen2'),
(22, 'S Pen 支持'),
(22, '120Hz 刷新率'),
(22, 'IP68 防水'),
(23, '摇粒绒材质'),
(23, '轻量保暖'),
(23, '柔软舒适'),
(23, '百搭款式'),
(23, '多色可选'),
(24, '声波震动'),
(24, '3种清洁模式'),
(24, '智能定时'),
(24, '感应充电'),
(24, '专业护理');

-- ============================================================
-- 5. 订单主表 (t_order)
-- ============================================================
DROP TABLE IF EXISTS `t_order`;
CREATE TABLE `t_order` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID（主键）',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号（ORD + 时间戳 + 随机数）',
  `user_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '用户ID（关联 t_user.id）',
  `shipping_name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  `shipping_phone` VARCHAR(20) NOT NULL COMMENT '收货人手机号',
  `shipping_region` VARCHAR(100) DEFAULT NULL COMMENT '所在地区',
  `shipping_address` VARCHAR(500) NOT NULL COMMENT '详细地址',
  `payment` VARCHAR(50) DEFAULT '支付宝' COMMENT '支付方式',
  `note` VARCHAR(1000) DEFAULT NULL COMMENT '订单备注',
  `subtotal` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '商品总价',
  `shipping_fee` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '运费',
  `total` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '应付总额',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态: pending待付款 / processing待发货 / shipped待收货 / completed已完成 / cancelled已取消',
  `status_text` VARCHAR(20) NOT NULL DEFAULT '待付款' COMMENT '状态文本',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_order_no` (`order_no`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_created_at` (`created_at`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单主表';

-- ============================================================
-- 6. 订单明细表 (t_order_item)
-- ============================================================
DROP TABLE IF EXISTS `t_order_item`;
CREATE TABLE `t_order_item` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `order_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '订单ID',
  `product_id` INT(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(255) NOT NULL COMMENT '商品名称（快照）',
  `product_icon` VARCHAR(50) DEFAULT NULL COMMENT '商品图标（快照）',
  `price` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '下单时价格',
  `quantity` INT(11) NOT NULL DEFAULT 1 COMMENT '购买数量',
  `total` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '小计金额',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_order_id` (`order_id`) USING BTREE,
  KEY `idx_product_id` (`product_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单明细表';

-- ============================================================
-- 7. Token 黑名单表 (t_token_blacklist)
-- ============================================================
DROP TABLE IF EXISTS `t_token_blacklist`;
CREATE TABLE `t_token_blacklist` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `token` VARCHAR(512) NOT NULL COMMENT 'Token 值',
  `user_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '用户ID',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_token` (`token`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Token 黑名单表（用于登出Token）';

-- ============================================================
-- 8. 商品评论表 (t_product_review)
-- ============================================================
DROP TABLE IF EXISTS `t_product_review`;
CREATE TABLE `t_product_review`;
CREATE TABLE `t_product_review` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `product_id` INT(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `user_id` BIGINT(20) UNSIGNED NOT NULL COMMENT '用户ID',
  `rating` TINYINT(1) NOT NULL DEFAULT 5 COMMENT '评分 1-5 星',
  `content` TEXT DEFAULT NULL COMMENT '评论内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_product_id` (`product_id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品评论表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 表结构创建完成
-- 数据库初始化数据插入完成
-- ============================================================
