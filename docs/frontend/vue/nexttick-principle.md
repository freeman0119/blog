# nextTick 实现原理

## 什么是 nextTick

nextTick 是 Vue 提供的一个工具函数，用于在下次 DOM 更新循环结束之后执行延迟回调。

## 前置知识 - js 事件循环

JS 执行是单线程的，基于事件循环。事件循环大致分为以下步骤：

- 所有同步任务都在主线程上执行，形成一个执行栈。

- 异步任务放进任务队列，异步任务分为宏任务和微任务

- 执行栈所有同步任务执行完成，就会执行任务队列。对应的异步任务，结束等待状态，进入执行栈，开始执行。

- 主线程不断重复上面的第三步。

主线程的执行过程就是一个 tick，而所有的异步结果都是通过 “任务队列” 来调度。 消息队列中存放的是一个个的任务（task）。 task 分为两大类，分别是 macro task 和 micro task，并且每个 macro task(宏任务) 结束后，都要清空所有的 micro task(微任务)。

- **宏任务**：script、setTimeout、setInterval、Node 中的 setImmediate 等

- **微任务**：Promise.then、MutationObserver、Node 中的 Process.nextTick 等

## 具体实现原理

```js
export let isUsingMicroTask = false;
const callbacks = []; // 回调队列
let pending = false;

// 该方法执行队列中的全部回调
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  // 执行任务队列
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
let timerFunc; // 用来保存调用异步任务方法
// 判断1：是否原生支持Promise
if (typeof Promise !== "undefined" && isNative(Promise)) {
  // 保存一个异步任务
  const p = Promise.resolve();
  timerFunc = () => {
    // 执行回调函数
    p.then(flushCallbacks);
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === "[object MutationObserverConstructor]")
) {
  // 判断2：是否原生支持MutationObserver
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
  //判断3：是否原生支持setImmediat
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  //判断4：上面都不行，直接用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;
​
  // cb 回调函数会经统一处理压入 callbacks 数组
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
​
  // 执行异步延迟函数 timerFunc
  if (!pending) {
    pending = true;
    timerFunc();
  }
​
  // 当 nextTick 没有传入函数参数的时候，返回一个 Promise 化的调用
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    });
  }
}

```
