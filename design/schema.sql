-- 和悦电竞系统数据库设计
-- MySQL 8.0+
-- 创建数据库
CREATE DATABASE IF NOT EXISTS game_helper DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE game_helper;

-- 普通用户表（H5端玩家）
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone       VARCHAR(20)  NOT NULL UNIQUE COMMENT '手机号',
  nickname    VARCHAR(50)  NOT NULL DEFAULT '' COMMENT '昵称',
  avatar      VARCHAR(500) NOT NULL DEFAULT '' COMMENT '头像URL',
  gender      TINYINT      NOT NULL DEFAULT 0 COMMENT '0=未知 1=男 2=女',
  age         TINYINT UNSIGNED COMMENT '年龄',
  game        VARCHAR(100) NOT NULL DEFAULT '' COMMENT '擅长游戏',
  is_builtin  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否内置玩家（供分配用）',
  is_blacklisted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否被拉黑',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='普通用户/玩家表';

-- 管理员表（PC端后台用户）
CREATE TABLE IF NOT EXISTS admins (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE COMMENT '登录账号',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  role          ENUM('SUPER','ADMIN') NOT NULL DEFAULT 'ADMIN' COMMENT '角色',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='管理员表';

-- 专区表（固定8个分类）
CREATE TABLE IF NOT EXISTS zones (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL COMMENT '专区名称',
  icon       VARCHAR(500) NOT NULL DEFAULT '' COMMENT '专区封面图',
  sort       INT         NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='商品专区表';

-- 游戏表（用于全站游戏筛选和商品归属）
CREATE TABLE IF NOT EXISTS games (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE COMMENT '游戏名称',
  sort       INT          NOT NULL DEFAULT 0 COMMENT '排序',
  is_active  TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='游戏配置表';

-- 初始化游戏数据
INSERT INTO games (name, sort, is_active) VALUES
  ('三角洲', 1, 1),
  ('王者荣耀', 2, 1),
  ('英雄联盟', 3, 1),
  ('原神', 4, 1),
  ('和平精英', 5, 1);

-- 初始化专区数据
INSERT INTO zones (name, sort) VALUES
  ('性价比专区', 1),
  ('保底专区',   2),
  ('清图专区',   3),
  ('活动专区',   4),
  ('大红专区',   5),
  ('带出专区',   6),
  ('保险专区',   7),
  ('金牌考核专区', 8);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_name     VARCHAR(100)   NOT NULL COMMENT '游戏名称（用于搜索筛选）',
  name          VARCHAR(200)   NOT NULL COMMENT '商品名称',
  description   TEXT           COMMENT '商品描述',
  price         DECIMAL(10,2)  NOT NULL COMMENT '现价',
  original_price DECIMAL(10,2) NOT NULL COMMENT '原价',
  thumbnail     VARCHAR(500)   NOT NULL DEFAULT '' COMMENT '缩略图URL',
  images        JSON           COMMENT '详情图片URL数组',
  specs         JSON           COMMENT '规格列表 [{name, value}]',
  detail_content TEXT          COMMENT '商品详情富文本/图文',
  status        ENUM('ON','OFF') NOT NULL DEFAULT 'OFF' COMMENT '上架状态',
  sales         INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '销量',
  views         INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '浏览量',
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_game_name (game_name),
  INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='商品表';

-- 商品与专区关联表（多对多）
CREATE TABLE IF NOT EXISTS product_zones (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  zone_id    INT UNSIGNED    NOT NULL,
  UNIQUE KEY uk_product_zone (product_id, zone_id),
  INDEX idx_zone_id (zone_id)
) ENGINE=InnoDB COMMENT='商品专区关联表';

-- Banner表
CREATE TABLE IF NOT EXISTS banners (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_url  VARCHAR(500) NOT NULL COMMENT 'Banner图片URL',
  link       VARCHAR(500) NOT NULL DEFAULT '' COMMENT '点击跳转链接（可为空）',
  sort       INT          NOT NULL DEFAULT 0 COMMENT '排序',
  is_active  TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Banner轮播表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no     VARCHAR(32)    NOT NULL UNIQUE COMMENT '订单号',
  user_id      BIGINT UNSIGNED NOT NULL COMMENT '下单用户ID',
  product_id   BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  product_name VARCHAR(200)   NOT NULL COMMENT '商品名称快照',
  spec         VARCHAR(200)   NOT NULL DEFAULT '' COMMENT '规格选择快照',
  price        DECIMAL(10,2)  NOT NULL COMMENT '实付金额',
  status       ENUM(
    'PENDING_PAY',
    'PENDING_ASSIGN',
    'PENDING_DELIVERY',
    'PENDING_REVIEW',
    'COMPLETED',
    'PENDING_SETTLEMENT',
    'SETTLED'
  ) NOT NULL DEFAULT 'PENDING_PAY' COMMENT '订单状态',
  assignee_id  BIGINT UNSIGNED COMMENT '分配的内置玩家ID',
  pay_time     DATETIME COMMENT '支付时间',
  deliver_time DATETIME COMMENT '交单时间',
  completed_at DATETIME COMMENT '完成时间',
  is_complained TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否被投诉',
  alipay_trade_no VARCHAR(64) COMMENT '支付宝交易号',
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_assignee_id (assignee_id),
  INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB COMMENT='订单表';

-- 投诉表
CREATE TABLE IF NOT EXISTS complaints (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id   BIGINT UNSIGNED NOT NULL COMMENT '关联订单ID',
  user_id    BIGINT UNSIGNED NOT NULL COMMENT '投诉用户ID',
  reason     TEXT            NOT NULL COMMENT '投诉原因',
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_id (order_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB COMMENT='投诉表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_product (user_id, product_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB COMMENT='收藏表';

-- 平台通用说明表（全局唯一一条）
CREATE TABLE IF NOT EXISTS platform_notes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content    TEXT NOT NULL COMMENT '平台通用说明内容（富文本/图文）',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='平台通用说明';

INSERT INTO platform_notes (content) VALUES ('请在此处配置平台通用说明内容');

-- 初始化超级管理员（密码：admin123，正式上线后请及时修改）
-- password_hash 为 bcrypt hash of 'admin123'（cost=10）
INSERT INTO admins (username, password_hash, role) VALUES
  ('admin', '$2b$10$2yzGpryzCER/Dt7/ScWg1uxirebST6ncIovpq1W/ovB1KI4cCqhqK', 'SUPER');
