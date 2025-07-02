# JSbridge 通信实践

_发布时间: 2024-01-20_  
_标签: JSbridge, 移动端开发, 跨端通信_

## 前言

JSbridge 是前端与原生 App 进行通信的桥梁，在混合开发中起着至关重要的作用。本文将详细介绍 JSbridge 的实现原理和最佳实践。

## JSbridge 基本原理

### 通信机制

JSbridge 主要通过以下几种方式实现通信：

```javascript
// 1. URL Scheme 方式
window.location.href = "myapp://method?param=value";

// 2. 注入全局对象方式
window.MyAppBridge.callNative("method", params);

// 3. MessageHandler 方式 (iOS WKWebView)
window.webkit.messageHandlers.myHandler.postMessage(data);

// 4. 自定义 prompt 拦截
window.prompt(
  "jsbridge://method?data=" + encodeURIComponent(JSON.stringify(params))
);
```

### 双向通信模型

```javascript
class JSBridge {
  constructor() {
    this.callbacks = new Map();
    this.callbackId = 0;
    this.setupMessageListener();
  }

  // 调用原生方法
  callNative(method, params = {}, callback) {
    const callbackId = ++this.callbackId;

    if (callback) {
      this.callbacks.set(callbackId, callback);
    }

    const message = {
      method,
      params,
      callbackId: callback ? callbackId : null,
    };

    this.postMessage(message);
  }

  // 处理原生回调
  handleNativeCallback(callbackId, result) {
    const callback = this.callbacks.get(callbackId);
    if (callback) {
      callback(result);
      this.callbacks.delete(callbackId);
    }
  }

  // 发送消息到原生
  postMessage(message) {
    if (window.webkit?.messageHandlers?.myHandler) {
      // iOS WKWebView
      window.webkit.messageHandlers.myHandler.postMessage(message);
    } else if (window.MyAppBridge) {
      // Android 注入对象
      window.MyAppBridge.postMessage(JSON.stringify(message));
    } else {
      // 降级方案：URL Scheme
      const url = `myapp://bridge?data=${encodeURIComponent(
        JSON.stringify(message)
      )}`;
      window.location.href = url;
    }
  }

  // 监听原生消息
  setupMessageListener() {
    window.JSBridgeReceiver = (data) => {
      const { type, callbackId, result, method, params } = JSON.parse(data);

      if (type === "callback") {
        this.handleNativeCallback(callbackId, result);
      } else if (type === "invoke") {
        this.handleNativeInvoke(method, params);
      }
    };
  }

  // 处理原生主动调用
  handleNativeInvoke(method, params) {
    const handlers = {
      onPageShow: () => console.log("页面显示"),
      onPageHide: () => console.log("页面隐藏"),
      onNetworkChange: (status) => console.log("网络状态:", status),
    };

    const handler = handlers[method];
    if (handler) {
      handler(params);
    }
  }
}

// 全局实例
const bridge = new JSBridge();
```

## 常用功能实现

### 设备信息获取

```javascript
// 获取设备信息
bridge.callNative("getDeviceInfo", {}, (result) => {
  console.log("设备信息:", result);
  // { platform: 'iOS', version: '15.0', model: 'iPhone 13' }
});

// 获取网络状态
bridge.callNative("getNetworkStatus", {}, (result) => {
  console.log("网络状态:", result);
  // { type: 'wifi', isConnected: true }
});
```

### 用户交互

```javascript
// 显示原生提示框
bridge.callNative(
  "showAlert",
  {
    title: "提示",
    message: "这是一个原生提示框",
    buttonText: "确定",
  },
  (result) => {
    console.log("用户点击了确定");
  }
);

// 显示加载中
bridge.callNative("showLoading", {
  message: "加载中...",
});

// 隐藏加载中
bridge.callNative("hideLoading");
```

### 导航控制

```javascript
// 设置导航标题
bridge.callNative("setNavigationTitle", {
  title: "新页面标题",
});

// 设置右上角按钮
bridge.callNative("setNavigationRightButton", {
  text: "分享",
  action: "share",
});

// 返回上一页
bridge.callNative("goBack");

// 关闭当前页面
bridge.callNative("closePage");
```

### 本地存储

```javascript
// 存储数据
bridge.callNative("setStorage", {
  key: "user_token",
  value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
});

// 获取数据
bridge.callNative(
  "getStorage",
  {
    key: "user_token",
  },
  (result) => {
    console.log("Token:", result.value);
  }
);

// 删除数据
bridge.callNative("removeStorage", {
  key: "user_token",
});
```

## 实战案例：图片选择器

```javascript
class ImagePicker {
  static pick(options = {}) {
    return new Promise((resolve, reject) => {
      const params = {
        maxCount: options.maxCount || 1,
        quality: options.quality || 0.8,
        allowEdit: options.allowEdit || false,
        source: options.source || "camera_album", // camera, album, camera_album
      };

      bridge.callNative("pickImage", params, (result) => {
        if (result.success) {
          resolve(result.images);
        } else {
          reject(new Error(result.message));
        }
      });
    });
  }

  static async uploadImage(imageData) {
    try {
      const result = await this.pick({ maxCount: 1, quality: 0.7 });
      const image = result[0];

      // 上传到服务器
      const uploadResult = await this.uploadToServer(image.base64);
      return uploadResult;
    } catch (error) {
      console.error("图片上传失败:", error);
      throw error;
    }
  }

  static uploadToServer(base64Data) {
    return new Promise((resolve, reject) => {
      bridge.callNative(
        "uploadFile",
        {
          data: base64Data,
          url: "https://api.example.com/upload",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
        (result) => {
          if (result.success) {
            resolve(result.url);
          } else {
            reject(new Error(result.message));
          }
        }
      );
    });
  }
}

// 使用示例
async function handleImageUpload() {
  try {
    const imageUrl = await ImagePicker.uploadImage();
    console.log("图片上传成功:", imageUrl);

    // 更新UI
    document.getElementById("avatar").src = imageUrl;
  } catch (error) {
    console.error("操作失败:", error.message);
  }
}
```

## 错误处理与兼容性

### 环境检测

```javascript
class BridgeDetector {
  static isApp() {
    return !!(window.MyAppBridge || window.webkit?.messageHandlers?.myHandler);
  }

  static getPlatform() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      return "iOS";
    } else if (/Android/.test(ua)) {
      return "Android";
    }
    return "Unknown";
  }

  static getBridgeVersion() {
    return new Promise((resolve) => {
      if (!this.isApp()) {
        resolve(null);
        return;
      }

      bridge.callNative("getBridgeVersion", {}, (result) => {
        resolve(result.version || "1.0.0");
      });
    });
  }
}

// 功能降级处理
async function handleWithFallback(bridgeMethod, webMethod) {
  if (BridgeDetector.isApp()) {
    try {
      return await bridgeMethod();
    } catch (error) {
      console.warn("Native method failed, fallback to web:", error);
      return await webMethod();
    }
  } else {
    return await webMethod();
  }
}

// 使用示例
const showAlert = async (message) => {
  return handleWithFallback(
    // 原生方法
    () =>
      new Promise((resolve) => {
        bridge.callNative("showAlert", { message }, resolve);
      }),
    // Web降级方法
    () => {
      alert(message);
      return Promise.resolve();
    }
  );
};
```

### 超时处理

```javascript
class SafeBridge {
  static callWithTimeout(method, params, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let resolved = false;

      // 设置超时
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`Bridge call timeout: ${method}`));
        }
      }, timeout);

      // 调用原生方法
      bridge.callNative(method, params, (result) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(result);
        }
      });
    });
  }
}

// 使用示例
try {
  const result = await SafeBridge.callWithTimeout("getLocation", {}, 3000);
  console.log("位置信息:", result);
} catch (error) {
  console.error("获取位置超时:", error.message);
}
```

## 最佳实践

### 1. 统一错误处理

```javascript
class BridgeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "BridgeError";
  }
}

// 统一的调用封装
function safeBridgeCall(method, params = {}) {
  return new Promise((resolve, reject) => {
    bridge.callNative(method, params, (result) => {
      if (result.success) {
        resolve(result.data);
      } else {
        reject(new BridgeError(result.code, result.message));
      }
    });
  });
}
```

### 2. 方法注册机制

```javascript
class BridgeRegistry {
  static methods = new Map();

  static register(name, handler) {
    this.methods.set(name, handler);
  }

  static call(name, ...args) {
    const handler = this.methods.get(name);
    if (handler) {
      return handler(...args);
    }
    throw new Error(`Method ${name} not registered`);
  }
}

// 注册方法
BridgeRegistry.register("getDeviceInfo", () => safeBridgeCall("getDeviceInfo"));
BridgeRegistry.register("showAlert", (message) =>
  safeBridgeCall("showAlert", { message })
);

// 统一调用
const deviceInfo = await BridgeRegistry.call("getDeviceInfo");
```

## 总结

JSbridge 是混合开发的核心技术：

1. **选择合适的通信方式**：根据平台特性选择最优方案
2. **做好错误处理**：超时、降级、异常情况处理
3. **保持接口一致性**：统一的调用方式和返回格式
4. **版本兼容性**：向前兼容，渐进增强

通过合理的架构设计，JSbridge 可以为 H5 页面提供接近原生的用户体验。

---

_下一篇文章将探讨小程序开发的技术要点，敬请期待！_
