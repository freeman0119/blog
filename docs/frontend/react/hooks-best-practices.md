# React Hooks 实现原理

## 前言

React Hooks 是 React 16.8 引入的革命性特性，它让函数组件拥有了状态和生命周期能力。本文将深入解析 Hooks 的底层实现原理，帮助你理解 Hooks 是如何在 Fiber 架构中工作的。

## Hooks 设计原理

### 基本架构

每个 Hook 在 React 内部都用一个特殊的数据结构来表示。这个结构不仅要存储当前的状态值，还要维护更新队列、依赖关系等信息。

```javascript
// Hook 节点的基本结构
interface Hook {
  memoizedState: any; // 当前状态值
  baseState: any; // 基础状态
  baseQueue: Update | null; // 基础更新队列
  queue: UpdateQueue | null; // 更新队列
  next: Hook | null; // 下一个 Hook
}

// 组件的 Hooks 链表
interface Fiber {
  memoizedState: Hook | null; // 第一个 Hook
  // ... 其他 Fiber 属性
}
```

这种链表结构是 Hooks 能够正确工作的关键。每个组件的所有 Hooks 按照调用顺序形成一个链表，React 通过遍历这个链表来更新状态。这也解释了为什么 Hooks 必须在组件的顶层调用，不能在条件语句或循环中使用。

## useState 实现原理

### 状态管理的核心机制

`useState` 是最基础也是最重要的 Hook。它的实现展现了 React 状态管理的核心思想：通过闭包和队列机制来管理状态更新。

### 基本结构

```javascript
// useState 的简化实现
function useState(initialState) {
  // 获取当前正在工作的 Fiber 节点
  const currentFiber = getCurrentFiber();

  // 获取当前 Hook 或创建新的 Hook
  const hook = mountWorkInProgressHook();

  if (currentFiber.memoizedState === null) {
    // 首次渲染：初始化状态
    hook.memoizedState = hook.baseState =
      typeof initialState === "function" ? initialState() : initialState;
  } else {
    // 更新渲染：从队列中计算新状态
    hook.memoizedState = updateReducer(basicStateReducer, initialState)[0];
  }

  // 返回状态和更新函数
  return [
    hook.memoizedState,
    dispatchAction.bind(null, currentFiber, hook.queue),
  ];
}

// 基础状态 reducer
function basicStateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}
```

这段代码展示了 `useState` 的双重性质：

- **首次渲染时**：创建新的 Hook 节点并初始化状态
- **更新渲染时**：从更新队列中计算新的状态值

注意 `initialState` 可以是函数，这种设计允许延迟初始化复杂的状态值，避免每次渲染都重新计算。

### 状态更新机制

状态更新不是立即发生的，而是通过一个精巧的队列系统来管理。这个系统确保了状态更新的正确性和性能。

```javascript
// 状态更新的详细实现
function dispatchAction(fiber, queue, action) {
  // 创建更新对象
  const update = {
    lane: getCurrentUpdateLane(),
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  };

  // 尝试立即计算新状态（优化）
  const currentState = queue.lastRenderedState;
  const eagerState = basicStateReducer(currentState, action);

  update.eagerReducer = basicStateReducer;
  update.eagerState = eagerState;

  // 如果状态没有变化，直接返回
  if (Object.is(eagerState, currentState)) {
    return;
  }

  // 将更新加入队列
  enqueueUpdate(fiber, queue, update);

  // 调度更新
  scheduleUpdateOnFiber(fiber, lane, eventTime);
}

// 更新队列管理
function enqueueUpdate(fiber, queue, update) {
  const pending = queue.pending;

  if (pending === null) {
    // 首个更新，创建环形链表
    update.next = update;
  } else {
    // 插入到环形链表中
    update.next = pending.next;
    pending.next = update;
  }

  queue.pending = update;
}
```

这里有几个关键的优化策略：

1. **急切状态计算（Eager State）**：React 会尝试立即计算新状态，如果发现状态没有变化，就跳过整个更新流程。
2. **环形链表**：更新队列使用环形链表结构，便于插入和遍历操作。
3. **优先级调度**：每个更新都有自己的优先级（lane），高优先级的更新可以打断低优先级的更新。

### 批量更新处理

React 的一个重要特性是批量处理多个状态更新，这避免了不必要的重复渲染。

```javascript
// 处理批量更新
function updateReducer(reducer, initialArg) {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  queue.lastRenderedReducer = reducer;

  // 获取当前基础状态
  let baseQueue = hook.baseQueue;
  let pendingQueue = queue.pending;

  if (pendingQueue !== null) {
    // 合并待处理的更新
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;

      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }

    hook.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  if (baseQueue !== null) {
    // 应用所有更新
    let newState = hook.baseState;
    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;

    let update = baseQueue.next;
    do {
      const updateLane = update.lane;

      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // 优先级不够，跳过此更新
        const clone = {
          lane: updateLane,
          action: update.action,
          eagerReducer: update.eagerReducer,
          eagerState: update.eagerState,
          next: null,
        };

        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
      } else {
        // 应用更新
        if (update.eagerReducer === reducer) {
          newState = update.eagerState;
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }

      update = update.next;
    } while (update !== null && update !== baseQueue.next);

    // 更新 Hook 状态
    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = newBaseQueueFirst;
    }

    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;

    queue.lastRenderedState = newState;
  }

  return [hook.memoizedState, queue.dispatch];
}
```

这个复杂的更新逻辑处理了几个重要场景：

1. **优先级跳过**：低优先级的更新会被跳过，等待后续的渲染周期
2. **状态基线**：维护一个基础状态，确保即使跳过某些更新，最终状态仍然正确
3. **循环处理**：通过 do-while 循环处理环形链表中的所有更新

## useEffect 实现原理

### Effect 的生命周期管理

`useEffect` 是处理副作用的核心 Hook，它的实现涉及复杂的调度和生命周期管理。

### Effect 数据结构

```javascript
// Effect 对象结构
interface Effect {
  tag: number; // Effect 类型标记
  create: () => (() => void) | void; // 创建函数
  destroy: (() => void) | void; // 销毁函数
  deps: Array<any> | null; // 依赖数组
  next: Effect; // 下一个 Effect（环形链表）
}

// Effect Hook 结构
interface EffectHook extends Hook {
  memoizedState: Effect; // 当前 Effect
}
```

每个 Effect 都有自己的标记（tag），用于区分不同类型的 Effect：

- **PassiveEffect**：普通的 useEffect
- **LayoutEffect**：useLayoutEffect，在 DOM 更新后同步执行
- **PassiveStaticEffect**：静态依赖的 Effect

### 依赖比较算法

依赖比较是 `useEffect` 优化的核心。React 使用浅比较来判断依赖是否发生变化。

```javascript
// 依赖比较的核心逻辑
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }

  // 长度检查
  if (nextDeps.length !== prevDeps.length) {
    console.error("useEffect received different number of dependencies");
    return false;
  }

  // 逐个比较依赖项
  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }

  return true;
}

// useEffect 的实现
function useEffect(create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;

  // 创建 Effect 对象
  const effect = {
    tag: PassiveEffect | PassiveStaticEffect,
    create,
    destroy: undefined,
    deps: nextDeps,
    next: null,
  };

  if (currentlyRenderingFiber.updateQueue === null) {
    currentlyRenderingFiber.updateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = currentlyRenderingFiber.updateQueue.lastEffect;
    if (lastEffect === null) {
      currentlyRenderingFiber.updateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      currentlyRenderingFiber.updateQueue.lastEffect = effect;
    }
  }

  hook.memoizedState = effect;
  return effect;
}
```

这里的关键点：

1. **Object.is 比较**：使用 `Object.is` 进行精确比较，能正确处理 NaN 和 +0/-0 的情况
2. **环形链表管理**：所有 Effect 形成环形链表，便于遍历和执行
3. **依赖数组验证**：在开发模式下会检查依赖数组长度的一致性

### Effect 执行时机

Effect 的执行是异步的，不会阻塞浏览器的渲染过程。

```javascript
// Effect 的调度和执行
function commitPassiveEffects(finishedWork) {
  // 执行销毁函数
  commitPassiveHookEffectListUnmount(PassiveEffect, finishedWork);

  // 执行创建函数
  commitPassiveHookEffectListMount(PassiveEffect, finishedWork);
}

function commitPassiveHookEffectListMount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // 执行 effect 创建函数
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

function commitPassiveHookEffectListUnmount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // 执行销毁函数
        const destroy = effect.destroy;
        effect.destroy = undefined;

        if (destroy !== undefined) {
          destroy();
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

Effect 的执行遵循严格的顺序：

1. **先销毁**：执行所有旧 Effect 的销毁函数
2. **后创建**：执行所有新 Effect 的创建函数

这确保了资源的正确清理和创建。

## Hooks 链表管理

### 链表是 Hooks 的核心

所有 Hooks 的状态都通过链表来管理。这个设计确保了 Hooks 的调用顺序保持一致，也是 Hooks 规则存在的根本原因。

### 链表构建

```javascript
// 全局变量管理
let currentlyRenderingFiber = null;
let currentHook = null; // 当前 Hook
let workInProgressHook = null; // 工作中的 Hook

// 挂载阶段创建 Hook
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // 第一个 Hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 后续 Hook，链接到链表
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

// 更新阶段获取 Hook
function updateWorkInProgressHook() {
  let nextCurrentHook;

  if (currentHook === null) {
    // 第一个 Hook
    const current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    // 后续 Hook
    nextCurrentHook = currentHook.next;
  }

  let nextWorkInProgressHook;

  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null) {
    // 复用现有 Hook
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;

    currentHook = nextCurrentHook;
  } else {
    // 创建新的 Hook
    if (nextCurrentHook === null) {
      throw new Error("Rendered more hooks than during the previous render.");
    }

    currentHook = nextCurrentHook;

    const newHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null,
    };

    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  return workInProgressHook;
}
```

这个链表管理系统有几个重要特点：

1. **双缓冲机制**：维护当前树（current）和工作树（workInProgress）两个版本
2. **顺序保证**：Hook 的调用顺序必须保持一致，否则会抛出错误
3. **复用优化**：尽可能复用现有的 Hook 节点，避免不必要的内存分配

### 为什么需要 Hooks 规则？

现在我们可以理解为什么 Hooks 有这些规则：

1. **只能在顶层调用**：因为 React 依靠调用顺序来匹配 Hook 状态
2. **不能在条件语句中调用**：条件语句会改变调用顺序
3. **只能在 React 函数中调用**：需要访问 Fiber 节点和相关上下文

## 总结

React Hooks 的实现原理体现了几个关键设计：

1. **链表结构**：通过链表维护 Hook 调用顺序，确保状态的一致性
2. **闭包机制**：利用闭包保持状态和函数引用，实现状态的持久化
3. **Fiber 集成**：与 Fiber 架构深度结合，支持优先级调度和并发特性
4. **优先级调度**：支持并发特性的优先级更新，提升用户体验
5. **依赖比较**：通过浅比较优化性能，避免不必要的重新执行

理解这些原理不仅有助于我们更好地使用 Hooks，避免常见陷阱，更能让我们编写出高性能的 React 应用。当我们遇到 Hooks 相关的问题时，从这些底层原理出发思考，往往能找到最优的解决方案。
