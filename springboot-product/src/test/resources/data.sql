-- ============================================================
-- H2 测试数据（使用英文字段，避免 Windows 编码问题）
-- ============================================================

INSERT INTO t_product (name, category, price, stock, description, status, sales, rating) VALUES
('Apple iPhone 15 Pro 256GB', 'phones', 7999.00, 200, 'A17 Pro chip, titanium body', 1, 12580, 4.8),
('Sony WH-1000XM5 Wireless Headphones', 'phones', 2299.00, 500, 'Industry-leading noise cancelling', 1, 8920, 4.9),
('MacBook Air M3 13 inch Laptop', 'computer', 8999.00, 150, 'Apple M3 chip, lightweight design', 1, 6540, 4.9),
('Nike Air Jordan 1 High OG Sneakers', 'sports', 1299.00, 300, 'Classic high-top design, premium leather', 1, 15230, 4.7),
('Dyson V15 Detect Cordless Vacuum', 'home', 4690.00, 80, 'Laser dust detection, 60 min battery', 1, 4280, 4.8),
('Kindle Paperwhite 5 E-Reader', 'computer', 998.00, 400, '6.8 inch display, waterproof', 1, 7890, 4.8);
