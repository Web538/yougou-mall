-- =====================================================
-- 优购商城 - 订单模块数据库表结构
-- MySQL 8.0+
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS yougou_order DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE yougou_order;

-- =====================================================
-- 1. 订单主表 (t_order)
-- =====================================================
DROP TABLE IF EXISTS t_order;
CREATE TABLE t_order (
    id            BIGINT          NOT NULL    COMMENT '订单ID',
    order_no      VARCHAR(32)     NOT NULL    COMMENT '订单编号',
    user_id       BIGINT          NOT NULL    COMMENT '用户ID',
    total_amount  DECIMAL(10,2)   NOT NULL    COMMENT '订单总金额',
    freight_amount DECIMAL(10,2)  DEFAULT 0.00 COMMENT '运费金额',
    pay_amount    DECIMAL(10,2)  NOT NULL    COMMENT '实付金额',
    status        TINYINT         NOT NULL    DEFAULT 0 COMMENT '订单状态: 0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-退款中 6-已退款',
    payment_method VARCHAR(20)     DEFAULT NULL COMMENT '支付方式: WECHAT-微信 ALIPAY-支付宝 BANK_CARD-银行卡',
    payment_time  DATETIME        DEFAULT NULL COMMENT '支付时间',
    shipping_name  VARCHAR(50)     DEFAULT NULL COMMENT '收货人姓名',
    shipping_phone VARCHAR(20)     DEFAULT NULL COMMENT '收货人电话',
    shipping_province VARCHAR(50)  DEFAULT NULL COMMENT '收货省份',
    shipping_city VARCHAR(50)      DEFAULT NULL COMMENT '收货城市',
    shipping_district VARCHAR(50)  DEFAULT NULL COMMENT '收货区县',
    shipping_address VARCHAR(255)  DEFAULT NULL COMMENT '详细地址',
    remark        VARCHAR(500)    DEFAULT NULL COMMENT '订单备注',
    deleted       TINYINT         NOT NULL    DEFAULT 0 COMMENT '删除标记: 0-未删除 1-已删除',
    create_time   DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (id),
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单主表';

-- =====================================================
-- 2. 订单明细表 (t_order_item)
-- =====================================================
DROP TABLE IF EXISTS t_order_item;
CREATE TABLE t_order_item (
    id            BIGINT          NOT NULL    COMMENT '明细ID',
    order_id      BIGINT          NOT NULL    COMMENT '订单ID',
    product_id    BIGINT          NOT NULL    COMMENT '商品ID',
    product_name  VARCHAR(200)    NOT NULL    COMMENT '商品名称',
    product_icon  VARCHAR(500)    DEFAULT NULL COMMENT '商品图标',
    sku_id        BIGINT          DEFAULT NULL COMMENT 'SKU ID',
    sku_name      VARCHAR(200)    DEFAULT NULL COMMENT 'SKU规格名称',
    price         DECIMAL(10,2)  NOT NULL    COMMENT '商品单价',
    quantity      INT             NOT NULL    DEFAULT 1 COMMENT '购买数量',
    subtotal      DECIMAL(10,2)  NOT NULL    COMMENT '小计金额',
    deleted       TINYINT         NOT NULL    DEFAULT 0 COMMENT '删除标记',
    create_time   DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (id),
    KEY idx_order_id (order_id),
    KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- =====================================================
-- 3. 订单操作日志表 (t_order_log)
-- =====================================================
DROP TABLE IF EXISTS t_order_log;
CREATE TABLE t_order_log (
    id            BIGINT          NOT NULL    COMMENT '日志ID',
    order_id      BIGINT          NOT NULL    COMMENT '订单ID',
    operate_type  VARCHAR(20)     NOT NULL    COMMENT '操作类型: CREATE-创建 PAY-支付 SHIP-发货 RECEIVE-收货 CANCEL-取消 REFUND-退款',
    operate_msg   VARCHAR(500)    DEFAULT NULL COMMENT '操作描述',
    operator_id   BIGINT          DEFAULT NULL COMMENT '操作人ID',
    operator_name VARCHAR(100)    DEFAULT NULL COMMENT '操作人名称',
    create_time   DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

    PRIMARY KEY (id),
    KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单操作日志表';

-- =====================================================
-- 初始化测试数据
-- =====================================================

-- 插入订单数据
INSERT INTO t_order (id, order_no, user_id, total_amount, freight_amount, pay_amount, status, payment_method, shipping_name, shipping_phone, shipping_province, shipping_city, shipping_district, shipping_address) VALUES
(1, 'ORD202606140001', 1001, 8999.00, 0.00, 8999.00, 0, NULL, '张三', '13800138001', '北京市', '北京市', '朝阳区', '建国路88号'),
(2, 'ORD202606140002', 1001, 299.00, 10.00, 309.00, 1, 'ALIPAY', '张三', '13800138001', '北京市', '北京市', '朝阳区', '建国路88号'),
(3, 'ORD202606140003', 1002, 1599.00, 0.00, 1599.00, 2, 'WECHAT', '李四', '13800138002', '上海市', '上海市', '浦东新区', '世纪大道100号');

-- 插入订单明细数据
INSERT INTO t_order_item (id, order_id, product_id, product_name, product_icon, sku_id, sku_name, price, quantity, subtotal) VALUES
(1, 1, 1001, 'Apple iPhone 15 Pro 256GB', '/images/iphone15.jpg', 2001, '深空黑', 8999.00, 1, 8999.00),
(2, 2, 1002, '小米手环8', '/images/miband.jpg', NULL, NULL, 299.00, 1, 299.00),
(3, 3, 1003, '华为MatePad 11', '/images/huawei_pad.jpg', 2003, 'WiFi版 8+128GB', 1599.00, 1, 1599.00);

-- 插入订单日志
INSERT INTO t_order_log (id, order_id, operate_type, operate_msg, operator_id, operator_name) VALUES
(1, 1, 'CREATE', '订单已创建', 1001, '张三'),
(2, 2, 'CREATE', '订单已创建', 1001, '张三'),
(2, 2, 'PAY', '订单已支付', 1001, '张三'),
(3, 3, 'CREATE', '订单已创建', 1002, '李四'),
(3, 3, 'PAY', '订单已支付', 1002, '李四'),
(3, 3, 'SHIP', '商家已发货', NULL, '系统管理员');
