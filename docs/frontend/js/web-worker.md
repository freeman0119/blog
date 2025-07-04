# Web Workers 完全指南：释放 JavaScript 的多线程潜力

## 引言：为什么我们需要 Web Workers？

在现代 Web 应用中，JavaScript 承担着越来越复杂的任务：图像处理、数据分析、3D 渲染等。然而，**JavaScript 的单线程特性**意味着所有任务都在同一个主线程上执行。当一个耗时任务运行时，页面会冻结，用户交互无响应 - 这就是所谓的"阻塞"问题。

Web Workers 正是为解决这一问题而生！它们允许你在**后台线程**中运行脚本，与主线程并行执行，从而保持 UI 的流畅响应。

## 什么是 Web Workers？

Web Workers 是浏览器提供的 API，它允许在**独立于主线程的后台线程**中运行 JavaScript 脚本。Worker 线程与主线程并行运行，彼此通过消息传递进行通信。

**核心特点：**

- **独立的全局上下文：**Worker 运行在完全独立的环境中，无法访问 DOM
- **消息驱动通信：**使用 postMessage 和 onmessage 进行线程间通信
- **无阻塞执行：**长时间任务不会阻塞主线程
- **支持现代浏览器：**所有现代浏览器均支持 Web Workers

## Web Workers 的类型

### 1. 专用 Workers (Dedicated Workers)

- 由单个脚本创建和使用
- 只能由创建它的脚本访问
- 最常用的 Worker 类型

```js
// 主线程中创建
const worker = new Worker("worker.js");
```

### 2. 共享 Workers (Shared Workers)

- 可被多个脚本共享（同源）
- 通过端口进行通信
- 适用于多个标签页共享计算资源

```js
// 不同脚本中可共享
const worker = new SharedWorker("shared-worker.js");
```

### 3. Service Workers

- 主要用于离线缓存和网络请求拦截
- 是实现 PWA（渐进式 Web 应用）的核心技术
- 独立于页面，在后台运行

```js
// 注册 Service Worker
navigator.serviceWorker.register("service-worker.js");
```

## 如何使用 Web Workers

### 基本工作流程

![工作流程](/images/webworker_01.png)

### 创建和使用专用 Worker

```js
// 创建 Worker
const worker = new Worker("worker.js");

// 向 Worker 发送消息
worker.postMessage({
  type: "CALCULATE",
  data: { values: [1, 2, 3, 4, 5] },
});

// 接收 Worker 的消息
worker.onmessage = function (event) {
  console.log("收到结果:", event.data);

  // 更新 UI
  document.getElementById("result").textContent = event.data.result;
};

// 错误处理
worker.onerror = function (error) {
  console.error("Worker 错误:", error);
};
```

**worker.js**

```js
// 监听主线程消息
self.onmessage = function (event) {
  const { type, data } = event.data;

  if (type === "CALCULATE") {
    // 执行耗时计算
    const result = heavyCalculation(data.values);

    // 将结果发送回主线程
    self.postMessage({
      type: "RESULT",
      result,
    });
  }
};

// 模拟耗时计算
function heavyCalculation(values) {
  // 模拟复杂计算
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < 100000000; j++) {
      // 模拟计算密集型任务
    }
    sum += values[i];
  }
  return sum;
}
```

## Web Workers 的适用场景

### 1.复杂计算

- 数学计算（加密/解密）
- 大数据处理
- 图像/视频处理

### 2.后台任务

- 日志处理
- 数据同步
- 实时数据处理

### 3.性能优化

- 保持 UI 响应
- 分帧处理大型任务
- 预加载和处理资源

### 4.并行处理

- 同时处理多个独立任务
- 使用多个 Workers 实现并行计算

## 实战案例：图像处理 Worker

**index.html**

```html
<input type="file" id="imageInput" accept="image/*" />
<button id="processBtn">处理图像</button>
<canvas id="resultCanvas"></canvas>
<script src="main.js"></script>
```

**main.js**

```js
const worker = new Worker("image-worker.js");
const canvas = document.getElementById("resultCanvas");
const ctx = canvas.getContext("2d");

document.getElementById("processBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("imageInput");
  if (!fileInput.files.length) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      // 发送给 Worker 处理
      worker.postMessage(
        {
          type: "PROCESS_IMAGE",
          imageData,
          width: img.width,
          height: img.height,
        },
        [imageData.data.buffer]
      );
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

// 接收处理后的图像
worker.onmessage = function (e) {
  const { processedData } = e.data;
  ctx.putImageData(processedData, 0, 0);
};
```

**image-worker.js**

```js
self.onmessage = function (e) {
  if (e.data.type === "PROCESS_IMAGE") {
    const { imageData, width, height } = e.data;
    const data = imageData.data;

    // 灰度化处理
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // R
      data[i + 1] = avg; // G
      data[i + 2] = avg; // B
    }

    // 创建处理后的图像数据
    const processedData = new ImageData(data, width, height);

    self.postMessage(
      {
        type: "IMAGE_PROCESSED",
        processedData,
      },
      [processedData.data.buffer]
    );
  }
};
```

## 总结

Web Workers 是提升 Web 应用性能的强大工具，通过将耗时任务移出主线程，它们可以显著改善用户体验。虽然使用 Workers 需要考虑线程通信和资源管理等问题，但其带来的性能收益是值得的。
