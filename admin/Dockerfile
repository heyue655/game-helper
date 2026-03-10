# ── Stage 1: 构建 ─────────────────────────────────────────
FROM node:20.18.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 生产构建
RUN npx vite build

# ── Stage 2: 运行 ─────────────────────────────────────────
FROM nginx:latest

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
