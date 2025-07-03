# Vue2 响应式原理

## 核心概念

- **defineReactive**​​：负责将对象的属性转换为响应式属性
- **Dep (Dependency)**：每个响应式属性都有一个对应的 Dep 实例，用于收集依赖
- **Watcher**：观察者，代表一个依赖，当数据变化时接收通知

## 具体实现原理

### 1. defineReactive

```javascript
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 为每个属性创建一个Dep实例

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      if (Dep.target) {
        // 如果有Watcher在收集依赖
        dep.depend(); // 将这个Watcher添加到Dep中
      }
      return val;
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify(); // 通知所有依赖的Watcher
    },
  });
}

// 使用示例
const data = {};
defineReactive(data, "message", "Hello");

console.log(data.message); // 触发 getter
data.message = "World"; // 触发 setter
```

### 2. Dep 类

Dep 是依赖收集的核心，每个响应式属性都有一个对应的 Dep 实例。

```javascript
class Dep {
  constructor() {
    this.subs = []; // 存储Watcher实例
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this); // Watcher记录自己依赖的Dep
    }
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update(); // 通知所有Watcher更新
    }
  }
}

Dep.target = null; // 静态属性，指向当前正在计算的Watcher
```

### 3. Watcher 类

Watcher 是观察者，有几种类型：

- 渲染 Watcher (组件渲染)
- 计算属性 Watcher
- 用户 Watcher (通过 watch 选项或 $watch 创建)

```js
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.getter = expOrFn;
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    Dep.target = this; // 设置当前Watcher为正在收集的依赖
    const value = this.getter.call(this.vm); // 触发getter，收集依赖
    Dep.target = null; // 重置
    return value;
  }

  addDep(dep) {
    dep.addSub(this); // Dep记录这个Watcher
  }

  update() {
    const oldValue = this.value;
    this.value = this.get(); // 重新计算
    this.cb.call(this.vm, this.value, oldValue); // 执行回调
  }
}
```

## 整体工作流程

### 初始化阶段

- Vue 遍历 data 对象的属性，通过 defineReactive 将其转换为响应式
- 每个属性创建一个对应的 Dep 实例

### 依赖收集阶段

- 当组件渲染时，会创建一个渲染 Watcher
- Watcher 执行其 get 方法，设置 Dep.target 指向自己
- 访问数据时触发 getter，Dep 收集当前 Watcher 作为依赖
  ​

### 更新阶段

- 当数据被修改时，触发 setter
- setter 调用 dep.notify()
- Dep 通知所有 Watcher 执行 update 方法
- Watcher 可能触发重新渲染或执行回调
