# 前端技术博客

> 记录前端开发、工程化和 Web3 的技术探索之路

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run docs:dev
```

### 构建部署

```bash
npm run docs:build
```

### 预览构建结果

```bash
npm run docs:preview
```

## 📁 项目结构

```
docs/
├── .vitepress/          # VitePress 配置
│   └── config.mts       # 主配置文件
├── frontend/            # 前端技术文章
│   ├── react/          # React 相关
│   ├── vue/            # Vue 相关
│   └── performance/    # 性能优化
├── engineering/         # 工程化文章
│   ├── webpack/        # Webpack 相关
│   ├── vite/           # Vite 相关
│   ├── package/        # 包管理
│   └── cicd/           # CI/CD 实践
├── web3/               # Web3 开发文章
│   ├── blockchain/     # 区块链基础
│   ├── smart-contracts/ # 智能合约
│   ├── defi/           # DeFi 应用
│   └── nft/            # NFT 项目
├── about.md            # 关于页面
└── index.md            # 首页
```

## ✨ 特性

- **📱 响应式设计**: 适配各种设备
- **🔍 全文搜索**: 本地搜索支持
- **🎨 美观界面**: 现代化的 UI 设计
- **⚡ 极速访问**: 基于 VitePress 的静态站点
- **📊 SEO 优化**: 搜索引擎友好
- **🔧 易于定制**: 灵活的配置选项

## 📝 写作指南

### 添加新文章

1. 在对应分类目录下创建 `.md` 文件
2. 添加文章头部信息：

   ```markdown
   # 文章标题

   _发布时间: 2024-01-01_  
   _标签: React, JavaScript_

   文章内容...
   ```

3. 在 `config.mts` 中更新侧边栏配置

### 文章格式规范

- 使用清晰的标题层级
- 代码块要指定语言类型
- 适当使用代码示例
- 添加实际应用场景

## 🚀 部署

### GitHub Pages

项目已配置自动部署，推送到 `main` 分支即可自动构建部署。

### 手动部署

```bash
# 构建
npm run docs:build

# 部署到你的服务器
# 将 docs/.vitepress/dist 目录上传到服务器
```

## 🛠️ 技术栈

- **框架**: VitePress
- **语言**: TypeScript/JavaScript
- **样式**: CSS3
- **部署**: GitHub Actions + GitHub Pages

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

✨ **Happy Coding!** ✨
