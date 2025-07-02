# Docker 前端项目容器化部署

_发布时间: 2024-01-18_  
_标签: Docker, 容器化, 部署, DevOps_

## 前言

Docker 容器化技术为前端项目部署带来了标准化、可移植性和环境一致性。本文将详细介绍如何将前端项目进行 Docker 容器化部署。

## 基础 Dockerfile

### React 项目容器化

```dockerfile
# 使用多阶段构建优化镜像大小
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 生产环境镜像
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建结果到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Vue 项目容器化

```dockerfile
# 构建阶段
FROM node:18-alpine AS build-stage

WORKDIR /app

# 复制 package 文件并安装依赖
COPY package*.json ./
RUN npm ci

# 复制源代码并构建
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine AS production-stage

# 复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Nginx 配置优化

### 基础配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # 启用 gzip 压缩
    gzip on;
    gzip_types
        text/plain
        text/css
        text/js
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

### 高性能配置

```nginx
# 高性能 nginx.conf
events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 50M;

    # 启用 Brotli 压缩（如果支持）
    brotli on;
    brotli_comp_level 4;
    brotli_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;

    server {
        listen 80;
        root /usr/share/nginx/html;

        # 禁用服务器标识
        server_tokens off;

        # 预加载关键资源
        location = /index.html {
            add_header Link "</static/css/main.css>; rel=preload; as=style";
            add_header Link "</static/js/main.js>; rel=preload; as=script";
        }

        # 静态资源版本化
        location ~* \.(js|css)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";

            # 启用 HTTP/2 推送
            http2_push_preload on;
        }
    }
}
```

## Docker Compose 多服务编排

### 前端 + 后端 + 数据库

```yaml
# docker-compose.yml
version: "3.8"

services:
  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    networks:
      - app-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - app-network

  # 数据库
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 开发环境配置

```yaml
# docker-compose.dev.yml
version: "3.8"

services:
  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
    networks:
      - dev-network

  backend-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
    environment:
      - NODE_ENV=development
    networks:
      - dev-network

networks:
  dev-network:
    driver: bridge
```

## 镜像优化技巧

### 多阶段构建优化

```dockerfile
# 优化的 Dockerfile
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html
# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置正确的权限
RUN chown -R nextjs:nodejs /usr/share/nginx/html
USER nextjs

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### .dockerignore 优化

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode
.idea

# 构建产物
dist
build

# 测试文件
**/*.test.js
**/*.spec.js
tests/

# 开发工具
.eslintrc.js
.prettierrc
webpack.config.js
```

## CI/CD 集成

### GitHub Actions 自动化部署

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            username/frontend-app:latest
            username/frontend-app:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            docker pull username/frontend-app:latest
            docker stop frontend-app || true
            docker rm frontend-app || true
            docker run -d \
              --name frontend-app \
              --restart unless-stopped \
              -p 80:80 \
              username/frontend-app:latest
```

### 健康检查配置

```dockerfile
# 添加健康检查
FROM nginx:alpine

# 安装 curl
RUN apk add --no-cache curl

# 复制文件
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 环境管理

### 环境变量注入

```dockerfile
# 支持环境变量的 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# 构建时注入环境变量
ARG REACT_APP_API_URL
ARG REACT_APP_ENV
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENV=$REACT_APP_ENV

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# 运行时环境变量替换脚本
COPY env-config.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/env-config.sh

EXPOSE 80
```

### 环境配置脚本

```bash
#!/bin/sh
# env-config.sh

# 为运行时环境变量创建配置文件
cat > /usr/share/nginx/html/config.js << EOF
window.env = {
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_ENV: "${REACT_APP_ENV}"
};
EOF

exec "$@"
```

## 监控与日志

### 日志配置

```yaml
# docker-compose.yml 日志配置
version: "3.8"

services:
  frontend:
    image: frontend:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`example.com`)"
```

### 性能监控

```dockerfile
# 添加监控工具
FROM nginx:alpine

# 安装监控工具
RUN apk add --no-cache htop iotop

# 复制监控脚本
COPY monitoring/health-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/health-check.sh

# 定期健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD /usr/local/bin/health-check.sh
```

## 安全最佳实践

### 安全强化

```dockerfile
# 安全优化的 Dockerfile
FROM node:18-alpine AS builder

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001

WORKDIR /app
USER frontend

# 复制并安装依赖
COPY --chown=frontend:nodejs package*.json ./
RUN npm ci --only=production

COPY --chown=frontend:nodejs . .
RUN npm run build

FROM nginx:alpine

# 移除不必要的包
RUN apk del --purge wget curl

# 创建非特权用户
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# 复制文件
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# 设置权限
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

## 总结

Docker 容器化为前端项目带来了：

1. **环境一致性**：开发、测试、生产环境完全一致
2. **快速部署**：标准化的部署流程
3. **弹性扩缩容**：根据负载自动调整实例数量
4. **版本管理**：通过镜像标签进行版本控制

通过合理的 Docker 配置和优化，可以显著提升前端项目的部署效率和运行稳定性。

---

_下一篇文章将介绍 Kubernetes 集群部署，敬请期待！_
