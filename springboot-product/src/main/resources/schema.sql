-- ============================================================
-- 优购商城 - 商品表建表 SQL
-- 数据库名：yougou_product
-- ============================================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS yougou_product
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE yougou_product;

-- ============================================================
-- 商品表
-- ============================================================
DROP TABLE IF EXISTS t_product;

CREATE TABLE t_product (
    id            BIGINT UNSIGNED AUTO_INCREMENT COMMENT '商品ID（主键）',
    name          VARCHAR(100)  NOT NULL COMMENT '商品名称',
    category      VARCHAR(50)  NOT NULL COMMENT '商品分类',
    price         DECIMAL(10,2) NOT NULL COMMENT '商品价格（元）',
    stock         INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '商品库存（件）',
    description   VARCHAR(500) DEFAULT NULL COMMENT '商品描述',
    image_url     VARCHAR(500) DEFAULT NULL COMMENT '商品图片URL',
    status        TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '商品状态：0-下架，1-上架',
    sales         INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '销量',
    rating        DECIMAL(2,1)  DEFAULT 5.0 COMMENT '商品评分（1.0-5.0）',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除标记：0-未删除，1-已删除',

    PRIMARY KEY (id),
    -- 名称唯一索引（允许软删除后重新使用相同名称）
    UNIQUE KEY uk_name (name),
    -- 分类索引
    KEY idx_category (category),
    -- 状态索引
    KEY idx_status (status),
    -- 复合索引（支持多条件查询）
    KEY idx_category_status (category, status),
    -- 创建时间索引（用于排序）
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ============================================================
-- 初始化测试数据
-- ============================================================
INSERT INTO t_product (name, category, price, stock, description, status, sales, rating) VALUES
('Apple iPhone 15 Pro 256GB', '手机数码', 7999.00, 200, '搭载A17 Pro芯片，钛金属机身，专业级摄影系统', 1, 12580, 4.8),
('Sony WH-1000XM5 无线降噪耳机', '手机数码', 2299.00, 500, '业界领先的降噪技术，30小时续航', 1, 8920, 4.9),
('MacBook Air M3 13英寸 笔记本电脑', '电脑办公', 8999.00, 150, 'Apple M3芯片，轻薄便携，长达18小时电池续航', 1, 6540, 4.9),
('Nike Air Jordan 1 High OG 运动鞋', '运动户外', 1299.00, 300, '经典高帮设计，优质皮革鞋面，Air气垫缓震', 1, 15230, 4.7),
('Dyson V15 Detect 无绳吸尘器', '家居生活', 4690.00, 80, '激光探测灰尘，智能感应吸力，60分钟续航', 1, 4280, 4.8),
('SK-II 神仙水 230ml', '美妆护肤', 1590.00, 600, '90%以上PITERA精华，改善肤质，提亮肤色', 1, 21340, 4.8),
('Kindle Paperwhite 5 电子书阅读器', '电脑办公', 998.00, 400, '6.8英寸墨水屏，防水设计，可调色温', 1, 7890, 4.8),
('华为 MatePad Pro 11英寸 平板电脑', '电脑办公', 3999.00, 200, 'HarmonyOS系统，OLED屏幕，生产力利器', 1, 8760, 4.8),
('小米米家扫地机器人 Pro', '家居生活', 2499.00, 350, 'LDS激光导航，4000Pa强劲吸力，智能避障', 1, 18650, 4.7),
('星巴克咖啡豆 深烘 250g', '食品饮料', 98.00, 1000, '星巴克精选咖啡豆，深度烘焙，浓郁醇厚', 1, 18920, 4.6);
