-- 清空所有表数据（保留表结构）
-- 使用方法：mysql -u用户名 -p 数据库名 < clear-data.sql

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE auth_codes;
TRUNCATE TABLE complaints;
TRUNCATE TABLE favorites;
TRUNCATE TABLE orders;
TRUNCATE TABLE product_zones;
TRUNCATE TABLE products;
TRUNCATE TABLE banners;
TRUNCATE TABLE zones;
TRUNCATE TABLE games;
TRUNCATE TABLE users;
TRUNCATE TABLE admins;
TRUNCATE TABLE platform_notes;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All tables cleared successfully!' AS result;
