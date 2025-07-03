# 事件循环：宏任务、微任务

## 引言 ​

JavaScript 是单线程语言，但通过 ​​ 事件循环（Event Loop）​​ 实现了异步非阻塞的执行模型。

本文将介绍一下内容

- ​​ 浏览器 vs Node.js 的事件循环差异 ​
- 宏任务（MacroTask）与微任务（MicroTask）的执行顺序 ​
- async/await 的本质（Generator + Promise 的语法糖）​

## 事件循环的基本模型 ​

### 调用栈（Call Stack）​

JavaScript 代码执行时，函数调用会形成一个 ​​ 调用栈 ​​（后进先出）。

```js
function foo() {
  console.log("foo");
  bar();
}
function bar() {
  console.log("bar");
}
foo(); // 调用栈：foo → bar
```

### 任务队列（Task Queue）

异步任务（如 setTimeout、fetch）不会立即执行，而是放入 ​​ 任务队列 ​​，等待调用栈清空后执行。

## 宏任务（MacroTask） vs 微任务（MicroTask）​

### 宏任务（MacroTask）​

- 常见宏任务
  - setTimeout、setInterval
  - I/O 操作
  - UI 渲染（浏览器）
  - script 整体代码

### 微任务（MicroTask）​

- 常见微任务 ​​
  - Promise.then、Promise.catch、Promise.finally
  - queueMicrotask
  - MutationObserver（浏览器）

### 执行顺序规则 ​

1. 执行当前调用栈的所有同步代码 ​​。
2. 清空微任务队列 ​​（所有 Promise、queueMicrotask）。
3. 执行一个宏任务 ​​（如 setTimeout）。
4. 重复步骤 2~3​​（微任务优先于宏任务）。

## 浏览器 vs Node.js 的事件循环差异 ​

### 浏览器的事件循环 ​

- 单循环阶段
  - 执行宏任务 → 清空微任务 → 渲染（如有需要）→ 下一轮循环

### Node.js 的事件循环（更复杂）

- 6 个阶段 ​​（每个阶段执行特定的宏任务）
  1. Timers​​（setTimeout、setInterval）
  2. Pending I/O​​（系统级回调）
  3. Idle/Prepare​​（内部使用）
  4. Poll​​（I/O 回调，如 fs.readFile）
  5. Check​​（setImmediate）
  6. Close​​（socket.on('close')）
- process.nextTick 比微任务更快 ​​（不属于事件循环阶段，但优先级极高）。
