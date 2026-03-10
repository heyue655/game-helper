# 常用更新命令
全量重建（代码有改动时用这个）：

docker-compose up -d --build

# 只重建某个服务（推荐，改了哪个重建哪个）：

# 只改了后端
docker-compose up -d --build backend
# 只改了 H5
docker-compose up -d --build h5
# 只改了 admin
docker-compose up -d --build admin
# 不重建，只重启容器（改了 .env 等配置时用）：

docker-compose up -d