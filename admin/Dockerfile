# ── Stage 1: 构建 ─────────────────────────────────────────
FROM docker.das-security.cn/node:22-alpine AS builder

# 配置 apk 阿里云镜像加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

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
