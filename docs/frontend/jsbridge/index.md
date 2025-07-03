# JSbridge 通信

### 一、背景

在当前的 app 开发模式中，hybrid 开发是一种常见的混合开发模式，通过将原生与 webview 结合，可以将一些业务逻辑通过 h5 实现，既可以提升开发效率，又方便后面的版本升级。

在某些场景下，h5 需要调用 native 的功能，反之亦然。此时就需要解决 h5 与 native 之间的通信问题。JSbridge 就是解决 web 与原生之间通信的方案。

### 二、JSbridge 实现方案

#### 1. 拦截 url schema

h5 是通过 webview 的形式加载，所有在 webview 中发出的请求，native 都可以进行拦截。h5 与 native 约定好自定义的协议，格式一般为：`<protocol>://<method>?params=xx`，如：`jsbridge://showToast?text=hello`，native 在检测 h5 发出的请求时，便会对请求的格式进行判断：

1. 如果符合自定义的 url schema，对 url 进行解析，拿到相关的操作、参数，进而调用 native 的方法
2. 如果不符合自定义的 url schema，则直接转发，请求真正的服务

#### web 发送 url 请求的方法一般有下面几种：

1. location.href
2. iframe.src
3. ajax 请求

这些方法中，location.href 会导致页面跳转，ajax 在 Android 中没有相应的拦截方法，所以 iframe 是常用的方案，通过动态创建 iframe 标签，给 src 赋值，之后删除 iframe 标签的方式，来发送请求。

这种方式兼容性很好，但由于 url 的方式，长度收到限制，且数据格式也收到限制，在特定场景下无法实现参数的传递问题。

#### 2. 注入 js 上下文

这个方法会通过 webview 提供的接口，将 native 的相关接口注入到 js 的 context（window）对象中，这样 web 端就可以直接在全局 window 对象下，调用原生的方法

```js
// Android
// 注入全局JS对象
webView.addJavascriptInterface(new NativeBridge(this), "NativeBridge");

class NativeBridge {
  private Context ctx;
  NativeBridge(Context ctx) {
    this.ctx = ctx;
  }

  // 增加JS调用接口
  @JavascriptInterface
  public void showNativeDialog(String text) {
    new AlertDialog.Builder(ctx).setMessage(text).create().show();
  }
}
```

在 web 端直接调用这个方法即可：

```js
window.NativeBridge.showNativeDialog("hello");
```

上面实现了 web 端对原生方法的调用，在某些场景下，还需要将 native 执行的结果返回给 web 端，这时就需要 js 回调来实现。

我们只需在一端调用的时候，在传输中加一个 callbackId 标记对应的回调，对端接收到调用请求后，进行实际操作，如果带有 callbackId，对端再进行一次调用，将结果、callbackId 回传回来，这端根据 callbackId 匹配对应的回调，将结果传入就可以了。

```js
// Web端代码：
<body>
  <div>
    <button id="showBtn">获取Native输入，以Web弹窗展现</button>
  </div>
</body>
<script>
  let id = 1;
  // 根据id保存callback
  const callbackMap = {};
  // 使用JSSDK封装调用与Native通信的事件，避免过多的污染全局环境
  window.JSSDK = {
    // 获取Native端输入框value，带有回调
    getNativeEditTextValue(callback) {
      const callbackId = id++;
      callbackMap[callbackId] = callback;
      // 调用JSB方法，并将callbackId传入
      window.NativeBridge.getNativeEditTextValue(callbackId);
    },
    // 接收Native端传来的callbackId
    receiveMessage(callbackId, value) {
      if (callbackMap[callbackId]) {
        // 根据ID匹配callback，并执行
        callbackMap[callbackId](value);
      }
    }
  };

  const showBtn = document.querySelector('#showBtn');
  // 绑定按钮事件
  showBtn.addEventListener('click', e => {
    // 通过JSSDK调用，将回调函数传入
    window.JSSDK.getNativeEditTextValue(value => window.alert('Natvie输入值：' + value));
  });
</script>
// Android端代码
webView.addJavascriptInterface(new NativeBridge(this), "NativeBridge");

class NativeBridge {
  private Context ctx;
  NativeBridge(Context ctx) {
    this.ctx = ctx;
  }

  // 获取Native端输入值
  @JavascriptInterface
  public void getNativeEditTextValue(int callbackId) {
    MainActivity mainActivity = (MainActivity)ctx;
    // 获取Native端输入框的value
    String value = mainActivity.editText.getText().toString();
    // 需要注入在Web执行的JS代码
    String jsCode = String.format("window.JSSDK.receiveMessage(%s, '%s')", callbackId, value);
    // 在UI线程中执行
    mainActivity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        mainActivity.webView.evaluateJavascript(jsCode, null);
      }
    });
  }
}
```

### 三、总结

#### url schema 方式：

**原理**：URL Schema 方式是一种基于 URL 的通信方案，通过约定特定的 URL 格式，在 JavaScript 和原生应用程序之间进行通信。

**实现步骤：**

1. 在 Web 页面中构造带有特定格式的 URL，包括调用的方法名和参数，并可以附带回调函数。
2. 原生应用程序拦截并解析 Web 页面加载的 URL，执行相应的原生方法，并将结果通过 URL 返回给 JavaScript。
3. JavaScript 接收到原生方法执行的结果，并进行相应的处理，包括调用回调函数。

**优点：**

- 实现简单，无需额外的技术支持，适用于基本的原生与 Web 交互需求。
- 支持双向通信，并且支持在原生调用 JavaScript 方法时传递参数。

**缺点：**

- 回调函数需要通过 URL 参数的方式传递，参数较多时不够灵活。
- 在 Web 页面中暴露了原生方法的调用方式，安全性较低。

#### JavaScript 注入方式：

**原理：**

- JavaScript 注入方式是通过 WebView 提供的接口方法，将 native 的接口注入到 WebView 中执行，从而实现 JavaScript 调用原生方法，以及原生调用 JavaScript 方法的功能。

**实现步骤：**

1. 通过 webview 的接口，将 native 的接口注入的 window 对象中
2. web 端通过 window 对象中对应的方法，实现调用 native 方法的功能，同时可以传入回调 id，实现回调的相关功能
3. native 可以通过 webview 的接口，直接调用 web 端中 window 对象下的方法

**优点：**

- 支持双向通信，并且调用灵活，可以直接在 JavaScript 中编写回调函数。
- 安全性较高，原生方法的调用方式不会暴露给 Web 页面。

**缺点：**

- 需要较多的原生代码来处理 JavaScript 方法的调用和结果的返回。
- 在 Android 平台，需要 Android 4.4（API level 19）及以上版本支持，iOS 平台需要 iOS 8.0 及以上版本支持。

> 总的来说，URL Schema 方式适用于简单的原生与 Web 交互需求，实现简单但灵活性较差；JavaScript 注入方式灵活性较高，安全性较好，适用于复杂的交互需求，但需要更多的原生代码来处理。
> 其次，相对于造轮子，更推荐使用目前已经开源的 JSBridge：DSBridge、jsBridge。
