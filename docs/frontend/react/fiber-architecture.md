# Fiber 架构原理与实现机制

## 前言

React Fiber 是 React 16 中引入的全新协调算法，它彻底改变了 React 的内部工作方式，实现了可中断、增量式和优先级调度的渲染机制。

## 为什么需要 Fiber？

### React 15 的痛点

在 React 15 及之前的版本中，协调过程是同步且递归的：

```javascript
// React 15 的递归协调过程
function reconcileChildren(currentFiber, newChildren) {
  // 递归处理所有子节点
  newChildren.forEach((child) => {
    reconcileChild(currentFiber, child); // 同步递归
  });
}
```

**问题**：

- **不可中断**：一旦开始协调就必须完成整个树
- **阻塞主线程**：大型组件树导致页面卡顿
- **用户体验差**：无法响应高优先级的用户交互

### 解决方案：时间切片

Fiber 通过**时间切片**技术解决了这个问题：

```javascript
// 伪代码：Fiber 的时间切片机制
function workLoop() {
  while (workInProgress && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }

  if (workInProgress) {
    // 还有工作未完成，让出控制权
    return continueWorkInNextFrame;
  }

  // 工作完成，提交更新
  commitRoot();
}

function shouldYield() {
  return getCurrentTime() >= frameDeadline;
}
```

## Fiber 节点结构

### 核心数据结构

```javascript
interface Fiber {
  // 节点类型信息
  type: any; // 组件类型或DOM标签
  key: null | string; // React元素的key
  elementType: any; // 原始的元素类型

  // 树结构
  child: Fiber | null; // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点
  return: Fiber | null; // 父节点
  index: number; // 在父节点中的索引

  // 状态和属性
  stateNode: any; // 真实DOM节点或组件实例
  pendingProps: any; // 新的props
  memoizedProps: any; // 上次渲染的props
  memoizedState: any; // 上次渲染的state
  updateQueue: UpdateQueue; // 更新队列

  // 双缓冲
  alternate: Fiber | null; // 对应的另一棵树的节点

  // 副作用
  effectTag: number; // 副作用标记
  nextEffect: Fiber | null; // 下一个有副作用的节点
  firstEffect: Fiber | null; // 第一个有副作用的子节点
  lastEffect: Fiber | null; // 最后一个有副作用的子节点

  // 调度优先级
  lanes: number; // 更新车道
  childLanes: number; // 子节点的车道
}
```

### 示例组件的 Fiber 树

```jsx
function App() {
  return (
    <div>
      <Header />
      <Main>
        <Article />
        <Sidebar />
      </Main>
    </div>
  );
}
```

对应的 Fiber 树结构：

```
FiberRoot
    |
   App ————————————————————————— (return)
    |                              ↑
   div ————————————————————————— (sibling)
    |                              ↑
 Header ——→ Main ————————————— (sibling)
              |                    ↑
           Article ——→ Sidebar — (sibling)
```

## 双缓冲机制

### Current Tree 和 WorkInProgress Tree

Fiber 使用双缓冲技术来确保一致性：

```javascript
// 当前显示的树
let currentRoot = {
  stateNode: containerElement,
  child: currentFiber,
  alternate: null,
};

// 正在构建的新树
let workInProgressRoot = {
  stateNode: containerElement,
  child: workInProgressFiber,
  alternate: currentRoot,
};

// 建立双向链接
currentRoot.alternate = workInProgressRoot;
workInProgressRoot.alternate = currentRoot;
```

### 工作流程

```javascript
function commitRoot() {
  // 1. 提交副作用
  commitAllWork(workInProgressRoot);

  // 2. 切换根节点
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;

  // 3. 重置状态
  workInProgress = null;
}

function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // 创建新的 Fiber 节点
    workInProgress = createFiber(current.type, current.key, current.mode);
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用现有节点
    workInProgress.pendingProps = pendingProps;
    workInProgress.effectTag = NoEffect;
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  return workInProgress;
}
```

## 工作循环

### 主要阶段

React 的工作循环分为两个主要阶段：

```javascript
function performSyncWorkOnRoot(root) {
  // 阶段1：Render 阶段（可中断）
  let finishedWork = renderRootSync(root);

  // 阶段2：Commit 阶段（不可中断）
  commitRoot(finishedWork);
}

function renderRootSync(root) {
  prepareFreshStack(root);

  // 工作循环
  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);

  return workInProgressRoot;
}
```

### Render 阶段

```javascript
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;

  // 开始工作：处理当前节点
  let next = beginWork(current, unitOfWork, renderLanes);

  // 保存新的props
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // 完成工作：处理副作用
    completeUnitOfWork(unitOfWork);
  } else {
    // 继续处理子节点
    workInProgress = next;
  }
}
```

### Commit 阶段

```javascript
function commitRootImpl(root) {
  // 阶段1：Before Mutation
  commitBeforeMutationLifeCycles();

  // 阶段2：Mutation
  commitAllHostEffects();

  // 切换当前树
  root.current = finishedWork;

  // 阶段3：Layout
  commitAllLifeCycles();
}
```

## 优先级调度

### Lane 模型

React 18 使用 Lane 模型来管理优先级：

```javascript
// 优先级车道
const SyncLane = 0b0000000000000000000000000000001;
const InputContinuousLane = 0b0000000000000000000000000000010;
const DefaultLane = 0b0000000000000000000000000000100;
const TransitionLane = 0b0000000000000000000000000001000;
const IdleLane = 0b0100000000000000000000000000000;

function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 标记更新车道
  markUpdateLaneFromFiberToRoot(fiber, lane);

  if (lane === SyncLane) {
    // 同步更新
    performSyncWorkOnRoot(root);
  } else {
    // 异步更新
    scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }
}
```

### 中断和恢复

```javascript
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function shouldYield() {
  const currentTime = getCurrentTime();

  // 检查是否有更高优先级任务
  if (hasHigherPriorityWork()) {
    return true;
  }

  // 检查时间切片是否用完
  return currentTime >= frameDeadline;
}
```

## 实际应用示例

### 长列表渲染优化

```jsx
import { useMemo, useState, useTransition } from "react";

function LargeList({ filter }) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  // 大量数据计算
  const filteredItems = useMemo(() => {
    return heavyDataProcessing(data, filter);
  }, [data, filter]);

  const handleSearch = (newQuery) => {
    // 低优先级更新，可被中断
    startTransition(() => {
      setQuery(newQuery);
    });
  };

  return (
    <div>
      <SearchInput onChange={handleSearch} />
      {isPending && <Spinner />}
      <div>
        {filteredItems.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 并发渲染示例

```jsx
import { Suspense, lazy } from "react";

const HeavyComponent = lazy(() =>
  import("./HeavyComponent").then((module) => ({
    default: module.HeavyComponent,
  }))
);

function App() {
  return (
    <div>
      {/* 高优先级：用户交互 */}
      <Navigation />

      {/* 低优先级：可延迟加载 */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## 性能影响

### 对比测试

```javascript
// React 15 vs React 18 性能对比
function PerformanceTest() {
  const [count, setCount] = useState(0);
  const [items] = useState(Array.from({ length: 10000 }, (_, i) => i));

  // React 15: 会阻塞用户交互
  // React 18: 可中断，保持响应性
  const heavyRender = () => {
    return items.map((item) => <ExpensiveComponent key={item} data={item} />);
  };

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        Count: {count} {/* 始终保持响应 */}
      </button>
      <div>{heavyRender()}</div>
    </div>
  );
}
```

## 总结

Fiber 架构的核心价值：

1. **可中断性**：长任务可被优先级更高的任务中断
2. **增量渲染**：将工作分解为小单元，避免阻塞
3. **优先级调度**：根据用户交互重要性安排更新顺序
4. **并发模式**：支持同时处理多个版本的组件树
