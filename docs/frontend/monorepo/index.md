# Monorepo

## 引言

在目前的前端和全栈开发中，随着项目复杂度的增加，Monorepo（单一代码仓库） 逐渐成为中大型项目组织代码的重要方式。它可以有效的处理项目间复杂的依赖关系，本文将详细介绍 Monorepo 的使用方式。

## 什么是 Monorepo？

### 传统多仓库(Multi-repo)的痛点

在项目开发中，我们可能有多个项目，在多个仓库中去库管理，比如

- `admin`：后台管理系统
- `mobile`：移动端
- `ui`：ui 组件库
- `utils`：工具库

每次更新`utils`后，需要

1. 发布新版本到 npm
2. 在每个项目中更新依赖
3. 确保所有项目兼容新版本

这就是多仓库开发的痛点，而 Monorepo 正是解决这些问题的好方法。

### Monorepo 的本质

Monorepo（单一代码库）是一种将多个相关项目放在同一个代码仓库中的开发策略。比如：

```md
my-monorepo/
├── apps/
│ ├── admin
│ └── mobile
└── packages/
├── utils
└── ui
```

核心优势：

- 原子提交：一次提交可修改多个相关项目
- 轻松跨项目引用：直接引用本地包，无需发布
- 统一工具链：共享 ESLint、Prettier 等配置
- 依赖优化：避免重复安装相同依赖

## 主流 Monorepo 方案

### PNPM Workspaces - 轻量级首选

特点： 极速安装、磁盘空间优化、非扁平化 node_modules

**创建 PNPM Monorepo**

```bash
# 1. 全局安装 pnpm
npm install -g pnpm

# 2. 初始化项目
mkdir my-monorepo && cd my-monorepo
pnpm init

# 3. 创建基础结构
mkdir -p apps/web packages/shared

# 4. 配置 pnpm-workspace.yaml
echo "packages:
  - 'apps/*'
  - 'packages/*'" > pnpm-workspace.yaml

# 5. 添加项目
cd apps/web && pnpm init
cd ../../packages/shared && pnpm init

# 6. 安装依赖 (根目录执行)
pnpm add react -w # -w 表示安装到根 workspace

```

**跨包引用示例：**

```bash
# 在 web 应用中引用 shared 包
pnpm add shared@workspace:* --filter web

# 在 shared 包的 package.json 中：
{
  "name": "shared",
  "version": "1.0.0",
  "exports": {
    "./utils": "./src/utils.js"
  }
}

# 在 web 应用中直接使用：
import { formatDate } from 'shared/utils';

```

### Turborepo - 构建加速神器

特点： 智能缓存、并行构建、依赖感知的任务调度

**创建 Turborepo 项目：**

```bash
# 1. 使用官方模板
npx create-turbo@latest

# 2. 选择模板（这里选 next.js）
? Where would you like to create your turborepo? ./my-turbo-repo
? Select a template: next.js

# 3. 安装依赖
cd my-turbo-repo
pnpm install

# 4. 查看项目结构
.
├── apps/
│   ├── docs # Next.js 文档站点
│   └── web # Next.js 主应用
├── packages/
│   ├── eslint-config # 共享 ESLint 配置
│   ├── tsconfig # 共享 TypeScript 配置
│   └── ui # 共享 UI 组件库

```

**配置 turbo.json 实现智能构建：**

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // 先构建依赖项
      "outputs": [".next/**"] // 缓存输出
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.ts", "test/**/*.ts"]
    },
    "dev": {
      "cache": false // 开发模式不缓存
    }
  }
}
```

**运行命令示例：**

```bash
# 并行运行所有项目的 build 命令
pnpm turbo run build

# 仅运行 web 应用的开发模式
pnpm turbo run dev --filter=web

# 查看构建管线
pnpm turbo run build --graph

```
