# Vue 3 响应式原理深度解析

深入探究 Vue 3 响应式系统的底层实现，从 Proxy 到 effect，理解现代前端框架的核心机制。

## 🎯 核心概念

### 响应式的本质

响应式系统是 Vue.js 的灵魂，它让数据的变化能够自动反映到视图上。Vue 3 的响应式系统相比 Vue 2 有了革命性的改进：

- **更强大的拦截能力**：从 `Object.defineProperty` 升级到 `Proxy`
- **更完整的类型支持**：支持 Map、Set、WeakMap、WeakSet
- **更好的性能表现**：减少初始化时的遍历开销
- **更灵活的组合能力**：独立的响应式模块

```javascript
// Vue 3 响应式核心示例
import { reactive, effect } from "vue";

const state = reactive({
  count: 0,
  name: "Vue",
});

// 自动追踪依赖
effect(() => {
  console.log(`${state.name}: ${state.count}`);
});

state.count++; // 自动触发 effect
```

## 🔧 核心架构

### 响应式对象创建

```javascript
// 简化的 reactive 实现原理
function reactive(target) {
  return createReactiveObject(target, mutableHandlers, reactiveMap);
}

function createReactiveObject(target, handlers, proxyMap) {
  // 检查是否已经代理过
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  // 创建 Proxy
  const proxy = new Proxy(target, handlers);

  // 缓存代理对象
  proxyMap.set(target, proxy);
  return proxy;
}
```

### Proxy Handlers 核心实现

```javascript
const mutableHandlers = {
  get(target, key, receiver) {
    // 获取原始值
    const res = Reflect.get(target, key, receiver);

    // 依赖收集
    track(target, "get", key);

    // 深度响应式
    if (isObject(res)) {
      return reactive(res);
    }

    return res;
  },

  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);

    // 派发更新
    if (hasChanged(value, oldValue)) {
      trigger(target, "set", key, value, oldValue);
    }

    return result;
  },
};
```

## 📊 依赖收集系统

### Effect 核心机制

```javascript
let activeEffect = undefined;
const targetMap = new WeakMap();

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    fn();
    activeEffect = undefined;
  };

  effectFn();
  return effectFn;
}

// 依赖收集
function track(target, type, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

// 派发更新
function trigger(target, type, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (effects) {
    effects.forEach((effect) => effect());
  }
}
```

### 完整的响应式流程

```javascript
// 1. 创建响应式对象
const state = reactive({ count: 0 });

// 2. 创建 effect，自动执行并收集依赖
effect(() => {
  console.log(state.count); // 触发 get 陷阱，收集依赖
});

// 3. 修改数据，触发更新
state.count = 1; // 触发 set 陷阱，派发更新
```

## 🔄 Ref 系统

### Ref 核心实现

```javascript
class RefImpl {
  constructor(value) {
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._value)) {
      this._value = convert(newValue);
      triggerRefValue(this);
    }
  }
}

function ref(value) {
  return new RefImpl(value);
}

const convert = (val) => (isObject(val) ? reactive(val) : val);

function trackRefValue(ref) {
  if (activeEffect) {
    ref.dep.add(activeEffect);
  }
}

function triggerRefValue(ref) {
  ref.dep.forEach((effect) => effect());
}
```

### Computed 计算属性

```javascript
class ComputedRefImpl {
  constructor(getter) {
    this._dirty = true;
    this._value = undefined;
    this.dep = new Set();

    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerRefValue(this);
        }
      },
    });
  }

  get value() {
    trackRefValue(this);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect();
    }
    return this._value;
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter);
}
```

## 🎨 高级特性

### 集合类型处理

Vue 3 对 Map、Set 等集合类型也提供了完整的响应式支持：

```javascript
const map = reactive(new Map());
const set = reactive(new Set());

// 这些操作都会触发响应式更新
map.set("key", "value");
set.add("item");

effect(() => {
  console.log(map.get("key")); // 会被追踪
  console.log(set.has("item")); // 会被追踪
});
```

### 数组特殊处理

```javascript
const arr = reactive([1, 2, 3]);

effect(() => {
  console.log(arr.length); // 追踪 length 属性
  console.log(arr[0]); // 追踪索引访问
});

// 这些操作都会正确触发更新
arr.push(4); // 修改 length
arr[0] = 10; // 修改索引
arr.splice(1, 1); // 数组方法
```

## 🔍 性能优化

### 浅层响应式

```javascript
// 只代理第一层属性
const shallowState = shallowReactive({
  surface: 'reactive',
  deep: { nested: 'not reactive' }
})

// 标记非响应式对象
const nonReactive = markRaw({
  largeDataset: [...],
  complexObject: {}
})
```

### 只读响应式

```javascript
const original = reactive({ count: 0 });
const copy = readonly(original);

// copy.count = 1 // 警告：不能修改只读属性
```

### 性能监控

```javascript
const state = reactive({ count: 0 });

const stopEffect = effect(
  () => {
    console.log(state.count);
  },
  {
    onTrack(e) {
      console.log("追踪:", e);
    },
    onTrigger(e) {
      console.log("触发:", e);
    },
  }
);

// 手动停止 effect
stopEffect();
```

## 🚀 实际应用

### 自定义响应式 Hook

```javascript
function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => (count.value = initialValue);

  return {
    count: readonly(count),
    increment,
    decrement,
    reset,
  };
}

// 使用
const { count, increment } = useCounter(0);
```

### 响应式状态管理

```javascript
// 简单的状态管理
function createStore(initialState) {
  const state = reactive(initialState);
  const getters = {};
  const actions = {};

  return {
    state: readonly(state),
    getters,
    actions,
  };
}

const store = createStore({
  user: null,
  todos: [],
});
```

## 📚 与 Vue 2 对比

| 特性         | Vue 2                 | Vue 3        |
| ------------ | --------------------- | ------------ |
| 响应式基础   | Object.defineProperty | Proxy        |
| 数组检测     | 需要特殊处理          | 原生支持     |
| 对象属性添加 | Vue.set               | 原生支持     |
| 集合类型     | 不支持                | 完整支持     |
| 性能         | 初始化开销大          | 按需代理     |
| 调试         | 有限                  | 完整调试信息 |

## 🔧 调试技巧

```javascript
import { isReactive, isRef, isReadonly, toRaw } from "vue";

const obj = reactive({ count: 0 });

console.log(isReactive(obj)); // true
console.log(isRef(obj)); // false
console.log(isReadonly(obj)); // false
console.log(toRaw(obj)); // 原始对象
```

---

_Vue 3 的响应式系统设计精妙，既保持了简洁的 API，又提供了强大的功能和性能优化..._
