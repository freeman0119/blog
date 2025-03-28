# 性能优化

## DNS 优化

**DNS 是什么？**

域名系统是将网站域名和 IP 地址相互映射的一个分布式数据库，能够更方便的访问互联网。

**优化方案**

- 减少 DNS 请求次数

避免浏览器并发数限制，将 HTML/CSS/JS，jpg/png，api 接口等不同资源放在不同域名下

- DNS 预解析

## 配置 CDN 缓存

**CDN 是什么？**

内容分发网络，利用最靠近每一位用户的服务器，更快、更可靠地将文件发送给用户分发网络。

**CDN 的优点**

- 提速：会给用户指派较近、较顺畅的服务器节点，将数据传输给用户。
- 低成本：服务器被放到不同地点，减少了互连的流量，也降低了宽带成本。
- 高可用度：当某个服务器故障时，自动调用临近地区的服务器。

**CDN 回源**

回源指浏览器访问 CDN 集群上静态文件时，文件缓存过期，直接穿透 CDN 集群而访问源站机器的行为。

**配置方案**

cdn 缓存配置方案和 http 缓存配置保持一致，并以 cdn 服务商官方注意事项为准。

## 浏览器缓存优化

### indexDB

- 存储的数据量非常大。
- 可以直接存储任何类型的数据，如 js 任何类型的数据 、blob 流。
- 可以创建索引，提供高性能搜索功能。

### cookie

- 跨域限制，同一个域名下可多个网页内使用。
- cookie 可以设置有效期，超出有效期自动清除。
- cookie 存储大小在 4K 以内。

### localStorage

- 数据可以长久保存，没有有效期，直到手动删除为止。
- 存储的数据量大，一般 5M 以内。
- 存储的数据可以在同一个浏览器的多个窗口使用。
- 存储的数据不会发送到服务器。

### sessionStorage

- 存储的数据在浏览器关闭后删除，与网页窗口具有相同的生命周期。
- 可以存储的数据大小 5M
- 存储的数据不会发送到服务器。

## HTML5 离线化

**离线包类型**

- 全局离线包：包含公共的资源，可供多个应用共同使用。
- 私有离线包：只可以被某个应用单独使用。

**离线包功能实现原理**

## webview 性能优化

**webview 的启动过程**

当 APP 首次打开时，默认是不会初始化浏览器内核的。

当创建 WebView 实例的时候，才会启动浏览器内核（打开时间需要 70~700ms），并创建 Webview 的基础框架。

**优化方案**

- 使用全局 webview
  1. 在客户端启动时，就初始化一个全局的 webview 待用，并隐藏。
  2. 当用户访问了 webview 时，直接使用这个 webview 加载对应网页，并展示。
- 客户端代理数据请求：数据请求和 webview 初始化并行，缩短时间
  1. 在客户端初始化 WebView 的同时，直接由 native 开始网络请求数据。
  2. 当页面初始化完成后，向 native 获取其代理请求的数据。

## 接口优化

- **接口合并**：减少 http 请求
- **接口上 cdn**：把不需要实时更新的接口同步到 CDN，如果接口数据更新再重新同步 CDN
- **接口域名上 CDN**：增强可用性，稳定性
- **接口域名上 CDN**：异步接口数据优先使用本地 localstorage 中的缓存数据，通过 md5 判断是否需要数据更新

## 页面加载策略优化

### 网络请求优化

减少网络资源的请求和加载耗时。

- **预加载**
  - **preload**：告诉浏览器如何将特定资源提前提取到当前页面中，会在当前页面开始加载之前在浏览器后台提前下载资源，不会花费额外的带宽。
    preload 预加载当前访问页面会立刻使用到的资源。
  - **prefetch**：利用浏览器的空闲时间来预取用（下载）用户可能在不久的将来会访问的资源。浏览器会在空闲时间下载 js 文件，缓存到磁盘中，当有页面使用该 js 文件时，再从磁盘中读取。
  - **dns-prefetch**：当你浏览网页时，浏览器会在加载网页时对网页中的域名进行解析缓存，这样在你单击当前网页中的连接时就无需进行 DNS 的解析，减少用户等待时间，提高用户体验。
  - **preconnect**：和 DNS prefetch 类似，preconnect 不光会解析 DNS，还会建立 TCP 握手连接和 TLS 协议（如果需要）
- **开启 GZIP**
- **CDN**
- **预渲染**：可以让浏览器提前加载指定页面的所有资源。
- 使用 HTTP/2、HTTP/3 提升资源请求速度
- 资源请求合并，减少 http 请求
- 合理使用 defer，async

### 首屏加载优化

- 对页面内容进行分片/分屏加载
- 懒加载
  - 监听 scroll 事件
  - 使用 IntersectionObserver
- 楼层式加载
  - 楼层数据异步加载和本地缓存相结合的方式
  - 在页面上放 MD5 值，用来判断是使用接口数据还是缓存数据。
    进入页面后，将数据请求回来后，进行缓存。对楼层分别判断是使用接口数据还是缓存数据。
- 首屏只加载需要的资源，对于不需要的资源不加载
- SSR
- 客户端离线包方案
- 客户端进行预请求和预加载

### 渲染过程优化

减少用户操作等待时间

- 按需加载
- 减少回流和重绘
- 减少/合并 dom 操作，减少浏览器的计算损耗

### 浏览器运算逻辑优化

- 拆解长任务，避免出现长时间计算导致页面卡顿
- 提前将计算结果缓存

### 关键渲染路径优化

定义：浏览器将 HTML，CSS，JavaScript 转换为屏幕上所呈现的实际像素这期间所经历的一系列步骤。

**优化方案**

- CSS 的`<link>`标签放在`<head></head>`之间
- script>标签放在`</body>`之前

## 页面静态化（SSR）

**为什么要 SSR?**

- 提高页面访问速度，降低服务器负担，因为访问时不需要每次都去访问数据库
- SEO
- 页面稳定性，如果后端接口出现问题，页面还会有缓存，不会出问题

**SSR 有啥问题**

- 服务器存储占用问题，因为页面量级在增加，要占用更大硬盘空间
- 静态页面中的链接更新问题会有死链或者错误链接问题，解决方案：利用模板字符串，进行动态替换

## 图片优化

### 选择合适的图片格式

- JPEG：有损压缩
  :::info
  优点：

  - 可以呈现数百万种颜色，当网站需要呈现色彩丰富的图片，JPEG 总是最佳选择。
  - 是有损压缩，可以通过压缩大大的减少图片的体积。

  缺点：

  - JPEG 不适用于所含颜色很少、具有大块颜色相近的区域或亮度差异十分明显的较简单的图片。
  - JPEG 图像不支持透明度处理，透明图片可选择使用 PNG。

  使用场景：

  - 经常作为大的背景图、轮播图或 Banner 图出现。
    :::

- PNG：无损压缩且高保真
  :::info
  优点：

  - 比 JPEG 更强的色彩表现力，对线条的处理更加细腻，对透明度有良好的支持。

  缺点：

  - 体积太大

  使用场景：

  - 呈现小的 Logo、颜色简单且对比强烈的图片或背景等。
  - 支持透明度处理，透明图片可选择使用 PNG
    :::

- GIF：最多支持 256 种颜色的 8 位无损图片格式
  :::info
  优点：

  - 支持 256 种颜色，文件体积通常都很小
  - 支持透明

  使用场景：

  - 动画
    :::

- webp：提供了有损压缩与无损压缩
  :::info
  优点：

  - 像 JPEG 一样对细节丰富的图片信手拈来，像 PNG 一样支持透明，像 GIF 一样可以显示动态图片，集多种图片文件格式的优点于一身。

  缺点：

  - 兼容性较差
    :::

### 图片压缩

- **压缩 png**：node-pngquant-native
- **压缩 jpg**：jpegtran
- **压缩 gif**：Gifsicle
- **在线压缩**：tinypng 免费、批量、速度块

### 图片优化方案

- 使用 iconfont
- 使用 base64 格式
- 采用 Image spriting 雪碧图
- 使用 CDN 图片
- 图片懒加载
- 图片预加载
- 渐进式图片

## HTML 代码优化

- 精简 HTML 代码
  - 减少 HTML 的嵌套
  - 减少 DOM 节点数
  - 减少无语义代码
  - 删除多余的空格、换行符、缩进等等
- 文件放在合适位置
  - CSS 样式文件链接尽量放在页面头部
  - JS 放在 HTML 底部

## CSS 代码优化

- 提升文件加载性能
  - 使用外链的 CSS
  - 尽量避免使用 @import，@import 影响 css 文件的加载速度
- 精简 CSS 代码
  - 利用 CSS 继承减少代码量
  - 避免使用复杂的选择器，层级越少越好

## 字体文件优化

- 使用 cdn 加载字体文件
- 开启 gzip 压缩字体文件
- 通过 font-display 来调整加载顺序
- 字体裁剪，剔除不需要使用到的字体
- 内联字体

## JS 代码优化

- 提升 JS 文件加载性能
  - JS 文件放在 body 底部
  - 合并 js 文件
  - 合理使用 defer 和 async
- JS 变量和函数优化
  - 尽量使用 id 选择器
  - 尽量避免使用 eval
  - js 函数尽可能保持整洁
  - 使用节流、防抖函数
  - 使用事件委托
- js 动画优化
  - 避免添加大量 js 动画
  - 尽量使用 css3 动画
  - 尽量使用 Canvas 动画
  - 使用 requestAnimationFrame 代替 settimeout setinterval
- combo 文件合并
  - Combo 是 CDN 的一项技术。它的核心是把对静态资源文件们的多次请求合并到一起，达到请求一次 URL（减少了请求次数），就可以同时获取多个静态文件的目的。

## webpack 打包优化

### 构建速度优化

- 升级新版本
- 优化搜索文件
  > - 缩小文件的搜索范围
  >   - 合理使用 resolve 功能，resolve.alias、resolve.extensions、resolve.modules 等
  >   - 配置 loader 时，使用 test、exclude、include 缩小搜索范围
  > - 对匹配的文件进行分析、转化
  > - 使用 module.noParse，告诉 Webpack 不必解析哪些文件，可以用来排除对非模块化库文件的解析
- 通过 DllPlugin 和 DllReferencePlugin 避免重复编译第三方库
  > - DllPlugin：创建一个 dll-only-bundle，生成一个名为 manifest.json 的文件，用于让 DllReferencePlugin 能够映射到相应的依赖上。
  > - DllReferencePlugin：把 dll-only-bundles 引用到需要的预编译的依赖中。
- 使用 HappyPack 开启多进程 Loader 转换
  > - Loader 对文件的转换操作太耗时，JS 是单线程模型，只能一个一个文件进行处理，需要通过 HappyPack 将任务分解给多个子进程，最后将结果发给主进程，并行处理
- 使用 ParallelUglifyPlugin 开启多进程压缩 JS 文件
  > - ParallelUglifyPlugin 可以开启多个子进程，每个子进程使用 UglifyJS 压缩代码，可以并行执行，能显著缩短压缩时间。

### 开发优化

开启模块热替换: HMR 模块热替换不刷新整个网页而只重新编译发生变化的模块，并用新模块替换老模块，所以预览反应更快，等待时间更少

### 打包优化

压缩文件体积

- 通过 DefinePlugin 区分环境，减少生产环境代码体积
- 压缩资源(JS、CSS、图片)
- 使用 Tree Shaking 剔除 JS 无用代码
- 分离第三方库文件
  - 通过 externals，将第三方库使用 cdn 加载，而不需要打包到 bundle 中（缺点：组件库按需加载能力无法支持、不会有 TreeShaking）。
  - 通过 SplitChunksPlugin
- gzip 压缩：compression-webpack-plugin

## 常见性能测量工具

- Chrome DevTools
- Lighthouse
- WebPageTest
