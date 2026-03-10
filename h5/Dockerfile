# ── Stage 1: 构建 ─────────────────────────────────────────
FROM node:20.18.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 生产构建（跳过 tsc 类型检查以加快构建，vite 本身会处理转译）
RUN npx vite build

# ── Stage 2: 运行 ─────────────────────────────────────────
FROM nginx:latest

# 拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 Nginx 配置（含 SPA 兜底 + /api 反向代理）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
