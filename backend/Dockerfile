FROM docker.das-security.cn/node:22-alpine

# 配置 apk 阿里云镜像加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装必要的系统依赖（Prisma 需要 openssl）
RUN apk add --no-cache openssl

WORKDIR /app

# 先复制依赖文件，利用 Docker 层缓存
COPY package*.json ./
RUN npm install --production

# 复制 Prisma schema 并生成客户端
COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# 复制其余源码
COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
