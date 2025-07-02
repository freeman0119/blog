# Webpack 5 配置优化实战

_发布时间: 2024-01-10_  
_标签: Webpack, 性能优化, 构建工具_

## 前言

Webpack 作为最流行的前端构建工具，其配置优化直接影响开发体验和构建效率。本文分享在生产项目中的 Webpack 5 优化实践。

## 构建速度优化

### 1. 缓存配置

```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, ".webpack_cache"),
    buildDependencies: {
      config: [__filename],
    },
  },
};
```

### 2. 多进程构建

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 开启多进程压缩
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "thread-loader", // 多进程编译
            options: {
              workers: 2,
            },
          },
          "babel-loader",
        ],
      },
    ],
  },
};
```

### 3. 减少解析范围

```javascript
module.exports = {
  resolve: {
    // 减少文件搜索范围
    modules: [path.resolve(__dirname, "src"), "node_modules"],

    // 指定文件扩展名
    extensions: [".js", ".jsx", ".ts", ".tsx"],

    // 使用 alias 减少搜索
    alias: {
      "@": path.resolve(__dirname, "src"),
      components: path.resolve(__dirname, "src/components"),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        // 明确指定需要编译的目录
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
};
```

## 打包体积优化

### 1. 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // 提取第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 20,
        },

        // 提取公共代码
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
        },

        // 单独提取 React 相关
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          chunks: "all",
          priority: 30,
        },
      },
    },
  },
};
```

### 2. Tree Shaking 配置

```javascript
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false, // 保持 ES6 模块语法
              }],
            ],
          },
        },
      },
    ],
  },
};
```

### 3. 外部化依赖

```javascript
module.exports = {
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    lodash: "_",
  },
};
```

## 开发体验优化

### 1. 热更新配置

```javascript
module.exports = {
  devServer: {
    hot: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
    compress: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === "development"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
    ],
  },
};
```

### 2. Source Map 配置

```javascript
module.exports = {
  devtool:
    process.env.NODE_ENV === "development"
      ? "eval-cheap-module-source-map"
      : "source-map",
};
```

## 实战案例：完整配置

```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",

  entry: {
    main: "./src/index.js",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? "[name].[contenthash:8].js" : "[name].js",
    chunkFilename: isProduction
      ? "[name].[contenthash:8].chunk.js"
      : "[name].chunk.js",
    clean: true,
  },

  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, ".webpack_cache"),
  },

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: path.resolve(__dirname, "src"),
        use: [
          ...(isProduction
            ? [
                {
                  loader: "thread-loader",
                  options: { workers: 2 },
                },
              ]
            : []),
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
      },
    ],
  },

  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],

    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 20,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          priority: 30,
        },
      },
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      minify: isProduction,
    }),

    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: "[name].[contenthash:8].css",
            chunkFilename: "[name].[contenthash:8].chunk.css",
          }),
        ]
      : []),
  ],

  devServer: isProduction
    ? undefined
    : {
        hot: true,
        port: 3000,
        open: true,
        historyApiFallback: true,
      },

  devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
};
```

## 性能监控

### 1. 构建分析

```bash
# 安装分析工具
npm install --save-dev webpack-bundle-analyzer

# package.json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/static/js/*.js"
  }
}
```

### 2. 构建时间监控

```javascript
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  // webpack 配置
});
```

## 总结

Webpack 优化的关键点：

1. **缓存策略**: 合理使用 filesystem cache
2. **多进程**: 利用 CPU 多核优势
3. **代码分割**: 提高缓存命中率
4. **Tree Shaking**: 减少无用代码
5. **开发体验**: 快速的热更新和 Source Map

通过这些优化，我们的项目构建时间从 2 分钟优化到 30 秒，热更新速度提升 5 倍。

---

_下一篇将介绍如何从 Webpack 迁移到 Vite，敬请期待！_
