# 根据 Promises/A+规范，一步步实现 promise

## 1. 专业术语

- “Promise”是一个具有符合以下规范的`then`方法的对象或函数。
- “Thenable”是一个定义了`then`方法的对象或函数。
- “Value”是任何合法的 JavaScript 值（包括`undefined`、一个`thenable`或一个`promise`）。
- “Exception”是使用`throw`语句抛出的值。
- “Reason”是一个值，指示为什么一个`promise`被拒绝。

## 2. 规范

#### 2.1 promise 状态

一个 `promise` 必须处于以下三种状态之一：`pending`（进行中）、`fulfilled`（已完成）或 `rejected`（已拒绝）。

- 2.1.1 当处于 `pending` 状态时，`promise`：

  - 2.1.1.1 可以转换到 `fulfilled`（已完成）或 `rejected`（已拒绝）状态之一。

- 2.1.2 当处于 `fulfilled` 状态时，`promise`：

  - 2.1.2.1 不得转换到任何其他状态。

  - 2.1.2.2 必须有一个值，这个值不能改变。

- 2.1.3 当处于 `rejected` 状态时，`promise`：

  - 2.1.3.1 不得转换到任何其他状态。

  - 2.1.3.2 必须有一个原因，这个原因不能改变。

#### 2.2 then 方法

promise 必须提供一个`then`方法来访问其当前或最终的值或原因。

promise 的`then`方法接受两个参数：

```js
promise.then(onFulfilled, onRejected);
```

- 2.2.1 `onFulfilled` 和 `onRejected` 都是可选参数：

  - 2.2.1.1 如果 `onFulfilled` 不是一个函数，则必须被忽略。

  - 2.2.1.2 如果 `onRejected` 不是一个函数，则必须被忽略。

- 2.2.2 如果 `onFulfilled` 是一个函数：

  - 2.2.2.1 它必须在 `promise` 被 `fulfilled` 后被调用，以 `promise` 的值作为它的第一个参数。
  - 2.2.2.2 它在 `promise` 被 `fulfilled` 之前不能被调用。
  - 2.2.2.3 它不能被调用超过一次。

- 2.2.3 如果 `onRejected` 是一个函数：

  - 2.2.3.1 它必须在 `promise` 被 `rejected` 后被调用，以 `promise` 的原因作为它的第一个参数。
  - 2.2.3.2 它在 `promise` 被 `rejected` 之前不能被调用。
  - 2.2.3.3 它不能被调用超过一次。

- 2.2.4 `onFulfilled` 或 `onRejected` 在执行上下文堆栈只包含平台代码时不能被调用。

- 2.2.5 `onFulfilled` 和 `onRejected` 必须作为函数被调用（没有 this 值）。

- 2.2.6 `then` 可以在同一个 `promise` 上被多次调用。

  - 2.2.6.1 当 `promise` 被 `fulfilled` 时，所有对应的 `onFulfilled` 回调函数必须按照它们原始调用 then 的顺序执行。

  - 2.2.6.2 当 `promise` 被 `rejected` 时，所有对应的 `onRejected` 回调函数必须按照它们原始调用 then 的顺序执行。

- 2.2.7 then 必须返回一个 promise。

```js
promise2 = promise1.then(onFulfilled, onRejected);
```

- 2.2.7.1 如果 `onFulfilled` 或 `onRejected` 返回一个值 x，则运行 Promise Resolution Procedure [[Resolve]](promise2, x)。

- 2.2.7.2 如果 `onFulfilled` 或 `onRejected` 抛出一个异常 e，则 promise2 必须以 e 作为原因被拒绝。

- 2.2.7.3 如果 `onFulfilled` 不是一个函数，并且 promise1 被 `fulfilled`，那么 promise2 必须以与 promise1 相同的值被 `fulfilled`。

- 2.2.7.4 如果 `onRejected` 不是一个函数，并且 promise1 被 `rejected`，那么 promise2 必须以与 promise1 相同的原因被拒绝。

#### 2.3 Promise Resolution Procedure

Promise Resolution Procedure 是一个抽象操作，它接受一个 promise 和一个值作为输入，我们将其表示为 [[Resolve]](promise, x)。如果 x 是一个 `thenable`，它试图使 promise 接受 x 的状态，假设 x 至少表现得像一个 `promise`。否则，它用值 x 来 fulfill promise。

对 `thenable` 的这种处理允许 `promise` 实现进行交互操作，只要它们暴露符合 Promises/A+ 规范的 then 方法。它还允许 Promises/A+ 实现“同化”不符合规范的实现，使其具有合理的 then 方法。

要运行 [[Resolve]](promise, x)，执行以下步骤：

- 2.3.1 如果 `promise` 和 x 引用同一个对象，则以 TypeError 为原因拒绝 promise。

- 2.3.2 如果 x 是一个 `promise`，则采用其状态 [3.4]：

  - 2.3.2.1 如果 x 是 `pending`，则 `promise` 必须保持 `pending` 状态，直到 x 被 `fulfilled` 或 `rejected`。
  - 2.3.2.2 如果/当 x 被 `fulfilled` 时，用相同的值 fulfill promise。
  - 2.3.2.3 如果/当 x 被 `rejected` 时，用相同的原因 reject promise。

- 2.3.3 否则，如果 x 是一个对象或函数，

  - 2.3.3.1 让 then 为 x.then。[3.5]

  - 2.3.3.2 如果检索属性 x.then 导致抛出异常 e，则以 e 为原因拒绝 promise。

  - 2.3.3.3 如果 then 是一个函数，则用 x 作为 this，`resolvePromise` 作为第一个参数，`rejectPromise` 作为第二个参数调用它，其中：

    - 2.3.3.3.1 如果当 `resolvePromise` 被调用以值 y 为参数时，运行 [[Resolve]](promise, y)。
    - 2.3.3.3.2 如果当 `rejectPromise` 被调用以原因 r 为参数时，用 r 拒绝 promise。
    - 2.3.3.3.3 如果 `resolvePromise` 和 `rejectPromise` 都被调用，或者对同一个参数进行了多次调用，则第一次调用优先，并且任何进一步的调用都将被忽略。

    - 2.3.3.3.4 如果调用 then 抛出异常 e，

      - 2.3.3.3.4.1 如果 `resolvePromise` 或 `rejectPromise` 已被调用，则忽略它。
      - 2.3.3.3.4.2 否则，以 e 为原因拒绝 `promise`。

  - 2.3.3.4 如果 then 不是一个函数，则以 x fulfill promise。

- 2.3.4 如果 x 不是一个对象或函数，则以 x fulfill promise。

如果一个 promise 被解析为一个参与循环 thenable 链的 thenable，这样 [[Resolve]](promise, thenable) 的递归性质最终导致再次调用 [[Resolve]](promise, thenable)，按照上述算法将导致无限递归。应该检测这种现象，并将错误信息 TypeError 为原因拒绝 promise。

## 3. 提示

- 3.1 之前提到的的“平台代码”指的是引擎、环境和 promise 实现代码。在实践中，这个要求确保 onFulfilled 和 onRejected 在 then 被调用的事件循环轮之后异步执行，并且使用一个新的执行栈。这可以通过“宏任务”机制（比如 setTimeout 或 setImmediate）或“微任务”机制（比如 MutationObserver 或 process.nextTick）来实现。由于 promise 实现被认为是平台代码，它本身可以包含一个任务调度队列或“跳板”，用于调用处理程序。

- 3.2 也就是说，在严格模式下，在这些函数内部，this 将是 undefined；在非严格模式下，它将是全局对象。

- 3.3 实现可以允许 promise2 === promise1，实现满足所有要求的实现。每个实现应该记录是否可以产生 promise2 === promise1，以及在什么条件下。

- 3.4 通常情况下，只有来自当前实现的 x 被认为是一个真正的 promise。这个条款允许使用特定于实现的方法来采用已知符合规范的 promises 的状态。

- 3.5 首先存储对 x.then 的引用，然后测试该引用，然后调用该引用的过程，避免了对 x.then 属性的多次访问。这样的预防措施对于在访问器属性中确保一致性是很重要的，因为访问器属性的值在检索之间可能会发生变化。

- 3.6 实现不应该对 thenable 链的深度设置任意限制，并假设在超过该任意限制之后递归将是无限的。只有真正的循环应该导致 TypeError；如果遇到一条无限的由不同的 thenables 组成的链，那么无限递归是正确的行为。

## 4.代码实现

#### 2.1 规范实现

```js
// 实现2.1,定义三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    // 定义状态status
    this.status = PENDING;

    // 定义value
    this.value = null;

    // 定义reason
    this.reason = null;

    // executor接收两个参数resolve， reject
    const resolve = (val) => {
      // 2.1.1
      // 2.1.2
      if (this.status === PENDING) {
        this.status = FULFILLED;
      }
    };
    const reject = (reason) => {
      // 2.1.1
      // 2.1.3
      this.status = REJECTED;
      this.reason = reason;
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}
```

上面实现了状态的定义，只能由`pending`状态变为`fulfilled`或`rejected`，并且状态改变之后不可修改。

#### 2.2 规范实现

```js
// other code...
class MyPromise {
  // other code...

  constructor(executor) {
    this.status = PENDING;
    this.value = null;
    this.reason = null;

    // 2.2.2
    this.onFulfilledCallbacks = [];

    // 2.2.3
    this.onRejectedCallbacks = [];

    let resolve = (val) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = val;

        // 2.2.2
        this.onFulfilledCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      this.status = REJECTED;
      this.reason = reason;

      // 2.2.3
      this.onRejectedCallbacks.forEach((fn) => fn());
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // 2.2 必须提供then方法
  then(onFulfilled, onRejected) {
    // 2.2.1
    // 2.2.4
    // 2.2.5
    // 2.2.7.3 若onFulfilled不是函数，则将结果传递给promise2
    // 2.2.7.4 若onRejected不是函数，则将结果传递给promise2
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (val) => val;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };

    // 2.2.7 then必须返回一个promise
    const promise2 = new MyPromise((resolve, reject) => {
      // 2.2.2 状态改为FULFILLED后，调用onFulfilled，因此需要先保存，在状态改变后调用
      // 2.2.6 同一个promise支持多次then，因此采用数组保存，调用时按顺序依次调用
      // 为了模拟微任务，用setTimeout包裹一下,同时用try catch捕获错误

      // 判断promise状态
      // 若为FULFILLED和REJECTED，则直接执行onFulfilled或onRejected
      // 若为PENDING，则存在回调数组中，等待状态改变时执行

      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            // 2.2.7.1
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            // 2.2.7.2
            reject(e);
          }
        });
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            // 2.2.7.1
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            // 2.2.7.2
            reject(e);
          }
        });
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              // 2.2.7.1
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              // 2.2.7.2
              reject(e);
            }
          });
        });

        // 2.2.3
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              // 2.2.7.2
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }
}
```

上面主要实现了 promise 的链式调用（promise 的 then 返回结果还是 promise），在 promise 状态改变时调用对应的回调函数。

#### 2.3 规范实现

这部分主要是实现 resolvePromise 的逻辑

```js
function resolvePromise(promise2, x, resolve, reject) {
  // 2.3.1
  if (promise2 === x) {
    return reject(new TypeError("循环引用"));
  }

  // 2.3.3.3.3 用called记录resolve，或reject是否被调用，一旦调用，则改变状态，不可再次调用
  let called;
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    // 2.3.3.2 捕获检索x.then时的错误
    try {
      // 2.3.3.1
      let then = x.then;

      // 2.3.3.3
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            // 2.3.3.3.3 防止多次调用
            if (called) return;
            called = true;

            // 2.3.3.3.1
            resolvePromise(promise2, y, resolve, reject);
          },
          (e) => {
            // 2.3.3.3.3 防止多次调用
            if (called) return;
            called = true;

            // 2.3.3.3.2
            reject(e);
          }
        );
      } else {
        // 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      // 2.3.3.3.4.1 已调用resolve或reject则忽略
      if (called) return;
      called = true;

      // 2.3.3.3.4.2 未调用resolve或reject，则以 e 为原因拒绝
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}
```

上面已经完成对 promiseA+规范的实现，可以安装`promises-aplus-tests`来对代码进行测试

**在 js 文件中添加以下代码**

```js
MyPromise.deferred = function () {
  const defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};

try {
  module.exports = MyPromise;
} catch (e) {}
```

**package.json**

```json
{
  "description": "",
  "scripts": {
    "test": "promises-aplus-tests index.js"
  },
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  }
}
```

运行 `npm run test`即可测试代码。

## 完整代码

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.value = null;
    this.reason = null;

    // 2.2.2
    this.onFulfilledCallbacks = [];

    // 2.2.3
    this.onRejectedCallbacks = [];

    let resolve = (val) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = val;

        // 2.2.2
        this.onFulfilledCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      this.status = REJECTED;
      this.reason = reason;

      // 2.2.3
      this.onRejectedCallbacks.forEach((fn) => fn());
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // 2.2 必须提供then方法
  then(onFulfilled, onRejected) {
    // 2.2.1
    // 2.2.4
    // 2.2.5
    // 2.2.7.3 若onFulfilled不是函数，则将结果传递给promise2
    // 2.2.7.4 若onRejected不是函数，则将结果传递给promise2
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (val) => val;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };

    // 2.2.7 then必须返回一个promise
    const promise2 = new MyPromise((resolve, reject) => {
      // 2.2.2 状态改为FULFILLED后，调用onFulfilled，因此需要先保存，在状态改变后调用
      // 2.2.6 同一个promise支持多次then，因此采用数组保存，调用时按顺序依次调用
      // 为了模拟微任务，用setTimeout包裹一下,同时用try catch捕获错误

      // 判断promise状态
      // 若为FULFILLED和REJECTED，则直接执行onFulfilled或onRejected
      // 若为PENDING，则存在回调数组中，等待状态改变时执行

      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            // 2.2.7.1
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            // 2.2.7.2
            reject(e);
          }
        });
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            // 2.2.7.1
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            // 2.2.7.2
            reject(e);
          }
        });
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              // 2.2.7.1
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              // 2.2.7.2
              reject(e);
            }
          });
        });

        // 2.2.3
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              // 2.2.7.2
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 2.3.1
  if (promise2 === x) {
    return reject(new TypeError("循环引用"));
  }

  // 2.3.3.3.3 用called记录resolve，或reject是否被调用，一旦调用，则改变状态，不可再次调用
  let called;
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    // 2.3.3.2 捕获检索x.then时的错误
    try {
      // 2.3.3.1
      let then = x.then;

      // 2.3.3.3
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            // 2.3.3.3.3 防止多次调用
            if (called) return;
            called = true;

            // 2.3.3.3.1
            resolvePromise(promise2, y, resolve, reject);
          },
          (e) => {
            // 2.3.3.3.3 防止多次调用
            if (called) return;
            called = true;

            // 2.3.3.3.2
            reject(e);
          }
        );
      } else {
        // 2.3.3.4
        resolve(x);
      }
    } catch (e) {
      // 2.3.3.3.4.1 已调用resolve或reject则忽略
      if (called) return;
      called = true;

      // 2.3.3.3.4.2 未调用resolve或reject，则以 e 为原因拒绝
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}

MyPromise.deferred = function () {
  const defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};

try {
  module.exports = MyPromise;
} catch (e) {}
```
