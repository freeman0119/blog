# PWA 实战指南

## 引言

随着 Web 技术的不断进化，`Progressive Web App（PWA）` 成为前端开发者越来越关注的一项重要技术。它试图打破传统 Web 应用与原生 App 之间的界限，让网页具备媲美原生应用的体验，例如离线访问、推送通知、快速加载、图标安装等。

## PWA 是什么？

PWA，全称 `Progressive Web App`，直译为“渐进式网页应用”。这个概念最早由 Google 提出，旨在利用现代 Web API，让网页具备原生应用的体验和功能。

PWA 具有以下几个核心特点：

**可安装（Installable）：** 用户可以将网页“添加到主屏幕”，像原生 App 一样打开。

**离线可用（Offline-capable）：** 即使网络断开，也能访问缓存的页面。

**可靠加载（Reliable）：** 使用缓存机制，加快页面加载速度。

**渐进增强（Progressive）：** 在支持的浏览器上启用高级功能，不支持的浏览器也能正常运行。

这些特性使得 PWA 尤其适合移动端访问较多的 Web 应用。

## PWA 三大核心技术

要构建一个完整的 PWA 应用，主要涉及三项关键技术：`Service Worker`、`Web App Manifest` 和 `HTTPS` 安全环境。

### Service Worker

Service Worker 是一种运行在浏览器后台的脚本，拦截和处理网络请求。它是 PWA 实现离线支持、缓存资源、推送通知的核心。

Service Worker 提供几个事件用来监听生命周期的变化，如下：

- `self.addEventListener("install")` 该事件触发时的标准行为是准备 service worker 用于使用，例如使用内建的 storage API 来创建缓存，并且放置应用离线时所需资源。
- `self.addEventListener("activate")` 事件触发的时间点通常是清理旧缓存以及其他与你的 service worker 的先前版本相关的东西。
- `self.addEventListener("fetch")` 事件触发的时间点是每次获取 service worker 控制的资源时，都会触发 fetch 事件

**_这里的 this 代表的是 Service Worker 本身对象。_**

一个简单的 Service Worker 注册过程如下：

```js
// 注册 Service worker
if ("serviceWorker" in window.navigator) {
  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", {
          scope: "/",
        });
        if (registration.installing) {
          console.log("正在安装 Service worker");
        } else if (registration.waiting) {
          console.log("已安装 Service worker installed");
        } else if (registration.active) {
          console.log("激活 Service worker");
        }
      } catch (error) {
        console.error(`注册失败：${error}`);
      }
    }
  };

  registerServiceWorker();
}
```

在 sw.js 中，我们可以拦截网络请求并将资源缓存：

```js
//sw.js
self.addEventListener("install", function (event) {
  // 确保 Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成
  event.waitUntil(
    // 创建了叫做 v1 的新缓存
    caches.open("v1").then(function (cache) {
      cache.addAll([
        "./index.html", // 相对于 sw.js 的路径 缓存 index.html
      ]);
    })
  );
});

// 缓存优先
const cacheFirst = async (request) => {
  // 从缓存中读取 respondWith表示拦截请求并返回自定义的响应
  const responseFromCache = await caches.match(request);
  console.log("responseFromCache", responseFromCache);
  if (responseFromCache) {
    return responseFromCache;
  }
  return fetch(request);
};

self.addEventListener("fetch", (event) => {
  // 拦截请求
  console.log("caches match");
  console.log("fetch", event.request.url);
  event.respondWith(cacheFirst(event.request));
});
```

上面是将固定的资源进行缓存，如果是需要对整个页面请求资源进行缓存管理，那么可以通过 fetch 事件拦截请求实现动态缓存，代码如下：

```js
const cacheFirst = async (request) => {
  // 从缓存中读取 respondWith表示拦截请求并返回自定义的响应
  const responseFromCache = await caches.match(request);
  console.log("responseFromCache", responseFromCache);
  if (responseFromCache) {
    return responseFromCache;
  }
  // 如果缓存中没有，就从网络中请求
  const responseFromServer = await fetch(request);
  const cache = await caches.open(cacheName);
  // 将请求到的资源添加到缓存中
  cache.put(request, responseFromServer.clone());
  return responseFromServer;
};

self.addEventListener("fetch", (event) => {
  // 拦截请求
  console.log("caches match");
  console.log("fetch", event.request.url);
  event.respondWith(cacheFirst(event.request));
});
```

### Manifest

Manifest 文件是一个 JSON 文件，告诉浏览器你是个“App”，包含应用的元数据，如图标、名称、起始页、背景颜色等。

```json
{
  "name": "My PWA App",
  "short_name": "PWA",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#317EFB",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

只需要在 HTML 中引用它：

```html
<link rel="manifest" href="/manifest.json" />
```

### HTTPS

由于 Service Worker 有强大的网络控制能力，PWA 只能在 HTTPS 环境中运行（本地除外）。这保证了内容的完整性与用户的数据安全。
