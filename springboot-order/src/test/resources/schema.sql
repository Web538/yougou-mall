-- Schema for H2 Test Database
CREATE TABLE IF NOT EXISTS t_order (
    id            BIGINT          NOT NULL PRIMARY KEY,
    order_no      VARCHAR(32)     NOT NULL UNIQUE,
    user_id       BIGINT          NOT NULL,
    total_amount  DECIMAL(10,2)   NOT NULL,
    freight_amount DECIMAL(10,2)  DEFAULT 0.00,
    pay_amount    DECIMAL(10,2)  NOT NULL,
    status        INT             NOT NULL    DEFAULT 0,
    payment_method VARCHAR(20)     DEFAULT NULL,
    payment_time  TIMESTAMP        DEFAULT NULL,
    shipping_name  VARCHAR(50)     DEFAULT NULL,
    shipping_phone VARCHAR(20)     DEFAULT NULL,
    shipping_province VARCHAR(50)  DEFAULT NULL,
    shipping_city VARCHAR(50)      DEFAULT NULL,
    shipping_district VARCHAR(50)  DEFAULT NULL,
    shipping_address VARCHAR(255)  DEFAULT NULL,
    remark        VARCHAR(500)    DEFAULT NULL,
    deleted       INT             NOT NULL    DEFAULT 0,
    create_time   TIMESTAMP        NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    update_time   TIMESTAMP        NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_order_item (
    id            BIGINT          NOT NULL PRIMARY KEY,
    order_id      BIGINT          NOT NULL,
    product_id    BIGINT          NOT NULL,
    product_name  VARCHAR(200)    NOT NULL,
    product_icon  VARCHAR(500)    DEFAULT NULL,
    sku_id        BIGINT          DEFAULT NULL,
    sku_name      VARCHAR(200)    DEFAULT NULL,
    price         DECIMAL(10,2)  NOT NULL,
    quantity      INT             NOT NULL    DEFAULT 1,
    subtotal      DECIMAL(10,2)  NOT NULL,
    deleted       INT             NOT NULL    DEFAULT 0,
    create_time   TIMESTAMP        NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    update_time   TIMESTAMP        NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_order_log (
    id            BIGINT          NOT NULL PRIMARY KEY,
    order_id      BIGINT          NOT NULL,
    operate_type  VARCHAR(20)     NOT NULL,
    operate_msg   VARCHAR(500)    DEFAULT NULL,
    operator_id   BIGINT          DEFAULT NULL,
    operator_name VARCHAR(100)    DEFAULT NULL,
    create_time   TIMESTAMP        NOT NULL    DEFAULT CURRENT_TIMESTAMP
);
