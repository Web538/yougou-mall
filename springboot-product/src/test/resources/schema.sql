-- ============================================================
-- H2 测试数据库 schema
-- ============================================================

CREATE TABLE IF NOT EXISTS t_product (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    category      VARCHAR(50)  NOT NULL,
    price         DECIMAL(10,2) NOT NULL,
    stock         INT NOT NULL DEFAULT 0,
    description   VARCHAR(500) DEFAULT NULL,
    image_url     VARCHAR(500) DEFAULT NULL,
    status        INT NOT NULL DEFAULT 1,
    sales         INT NOT NULL DEFAULT 0,
    rating        DECIMAL(2,1) DEFAULT 5.0,
    create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted       INT NOT NULL DEFAULT 0
);
