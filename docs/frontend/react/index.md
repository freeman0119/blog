# React 技术栈

深入探讨 React 生态系统，从核心原理到最新特性，掌握现代前端开发的核心技术。

## 🚀 最新文章

- [React 18 并发特性深度解析](/frontend/react/concurrent-features)
- [Fiber 架构原理与实现机制](/frontend/react/fiber-architecture)
- [React Hooks 实现原理](/frontend/react/hooks-best-practices)

## 🎯 核心原理

### Virtual DOM 与 Diff 算法

React 的核心思想是通过 Virtual DOM 提高 UI 更新效率：

**Virtual DOM 优势**：

- 批量更新减少 DOM 操作
- 跨浏览器兼容性
- 更好的开发体验和调试能力
- 支持服务端渲染

**Diff 算法策略**：

- **树级别比较**：只对同层级节点进行比较
- **组件级别比较**：不同类型组件直接替换
- **元素级别比较**：通过 key 优化列表渲染

### Fiber 架构

React 16 引入的 Fiber 架构实现了时间切片和优先级调度：

**核心特性**：

- **可中断渲染**：长任务可被高优先级任务打断
- **增量渲染**：将渲染工作分解为小块
- **优先级调度**：不同更新具有不同优先级
- **并发模式**：支持并发渲染多个版本

**工作原理**：

```javascript
// Fiber 节点结构
interface Fiber {
  type: any; // 组件类型
  key: null | string; // React Element key
  stateNode: any; // 真实 DOM 节点
  child: Fiber | null; // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点
  return: Fiber | null; // 父节点
  alternate: Fiber | null; // 对应的 Fiber 节点
  effectTag: number; // 副作用标记
  // ...更多属性
}
```

## 📈 版本演进史

### React 15 及之前 (2013-2016)

**核心特性**：

- 引入 Virtual DOM 概念
- 组件化开发模式
- 单向数据流
- JSX 语法

**主要限制**：

- 同步渲染，无法中断
- 大型应用性能瓶颈
- 缺乏官方状态管理方案

### React 16 - 架构重构 (2017)

**🔥 重大突破**：

- **Fiber 架构**：全新的协调算法
- **Error Boundaries**：错误边界处理
- **Portals**：跨层级渲染
- **Fragment**：避免额外 DOM 包装

```javascript
// Error Boundaries 示例
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### React 16.8 - Hooks (2019)

**🚀 函数式组件增强**：

```javascript
import { useState, useEffect, useContext } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useContext(ThemeContext);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const userData = await api.getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className={`profile ${theme}`}>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**核心 Hooks**：

- `useState` - 状态管理
- `useEffect` - 副作用处理
- `useContext` - 上下文消费
- `useReducer` - 复杂状态逻辑
- `useMemo` / `useCallback` - 性能优化

### React 17 - 渐进升级 (2020)

**主要特性**：

- **无新特性发布**：专注于升级体验
- **渐进式升级**：支持多版本 React 共存
- **事件委托改进**：事件绑定到根容器而非 document
- **新 JSX 转换**：无需手动导入 React

```javascript
// 旧 JSX 转换
import React from "react";
function App() {
  return React.createElement("h1", null, "Hello World");
}

// 新 JSX 转换 (自动)
function App() {
  return <h1>Hello World</h1>; // 无需导入 React
}
```

### React 18 - 并发特性 (2022)

**🎯 并发模式正式发布**：

**自动批处理**：

```javascript
// React 18 自动批处理所有更新
function handleClick() {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // 只触发一次重新渲染
}
```

**Suspense 增强**：

```javascript
import { Suspense, lazy } from "react";

const LazyComponent = lazy(() => import("./LazyComponent"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

**并发特性 Hooks**：

```javascript
import { useTransition, useDeferredValue } from "react";

function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const handleSearch = (newQuery) => {
    startTransition(() => {
      setQuery(newQuery); // 低优先级更新
    });
  };

  return (
    <div>
      {isPending && <div>Searching...</div>}
      <Results query={deferredQuery} />
    </div>
  );
}
```

## ⚡ 性能优化策略

### 组件优化

```javascript
// React.memo 防止无意义重渲染
const ExpensiveComponent = React.memo(
  ({ data, onUpdate }) => {
    return (
      <div>
        {data.map((item) => (
          <Item key={item.id} {...item} onUpdate={onUpdate} />
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    return prevProps.data.length === nextProps.data.length;
  }
);

// useMemo 缓存计算结果
function ExpensiveCalculation({ items }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>Total: {expensiveValue}</div>;
}

// useCallback 缓存函数引用
function Parent({ items }) {
  const handleItemClick = useCallback((id) => {
    console.log("Clicked item:", id);
  }, []);

  return (
    <div>
      {items.map((item) => (
        <Child key={item.id} item={item} onClick={handleItemClick} />
      ))}
    </div>
  );
}
```

### 代码分割

```javascript
// 路由级别分割
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

// 组件级别分割
const HeavyModal = lazy(() =>
  import("./HeavyModal").then((module) => ({
    default: module.HeavyModal,
  }))
);
```
