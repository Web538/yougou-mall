-- Test Data for H2 Database (UTF-8)
INSERT INTO t_order (id, order_no, user_id, total_amount, freight_amount, pay_amount, status, shipping_name, shipping_phone, shipping_province, shipping_city, shipping_district, shipping_address) VALUES
(1, 'ORD202606140001', 1001, 8999.00, 0.00, 8999.00, 0, 'Zhang San', '13800138001', 'Beijing', 'Beijing', 'Chaoyang', 'Jianguo Road 88');

INSERT INTO t_order (id, order_no, user_id, total_amount, freight_amount, pay_amount, status, shipping_name, shipping_phone, shipping_province, shipping_city, shipping_district, shipping_address) VALUES
(2, 'ORD202606140002', 1001, 299.00, 10.00, 309.00, 1, 'Zhang San', '13800138001', 'Beijing', 'Beijing', 'Chaoyang', 'Jianguo Road 88');

INSERT INTO t_order (id, order_no, user_id, total_amount, freight_amount, pay_amount, status, shipping_name, shipping_phone, shipping_province, shipping_city, shipping_district, shipping_address) VALUES
(3, 'ORD202606140003', 1002, 1599.00, 0.00, 1599.00, 2, 'Li Si', '13800138002', 'Shanghai', 'Shanghai', 'Pudong', 'Century Avenue 100');

INSERT INTO t_order_item (id, order_id, product_id, product_name, product_icon, sku_id, sku_name, price, quantity, subtotal) VALUES
(1, 1, 1001, 'Apple iPhone 15 Pro 256GB', '/images/iphone15.jpg', 2001, 'Space Black', 8999.00, 1, 8999.00);

INSERT INTO t_order_item (id, order_id, product_id, product_name, product_icon, sku_id, sku_name, price, quantity, subtotal) VALUES
(2, 2, 1002, 'Xiaomi Band 8', '/images/miband.jpg', NULL, NULL, 299.00, 1, 299.00);

INSERT INTO t_order_item (id, order_id, product_id, product_name, product_icon, sku_id, sku_name, price, quantity, subtotal) VALUES
(3, 3, 1003, 'Huawei MatePad 11', '/images/huawei_pad.jpg', 2003, 'WiFi 8+128GB', 1599.00, 1, 1599.00);
