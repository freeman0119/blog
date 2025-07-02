# React 18 并发特性深度解析

## 前言

React 18 正式引入了并发特性，这是 React 历史上最重要的更新之一。并发模式让 React 能够在不阻塞主线程的情况下准备多个版本的 UI，显著提升了用户体验。

## 什么是并发模式？

### 核心概念

并发模式允许 React **同时**处理多个任务，根据优先级决定哪个任务应该优先完成：

```javascript
// 传统模式：阻塞式渲染
function TraditionalMode() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);

  const handleClick = () => {
    setCount((c) => c + 1); // 高优先级
    setList(generateList()); // 低优先级，但会阻塞上面的更新
  };
}

// 并发模式：可中断渲染
function ConcurrentMode() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setCount((c) => c + 1); // 高优先级，立即更新
    startTransition(() => {
      setList(generateList()); // 低优先级，可被中断
    });
  };
}
```

## useTransition

### 基本用法

```javascript
import { useState, useTransition } from "react";

function SearchApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery) => {
    // 高优先级：立即更新输入框
    setQuery(newQuery);

    // 低优先级：可被中断的搜索
    startTransition(() => {
      const searchResults = performExpensiveSearch(newQuery);
      setResults(searchResults);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />

      {isPending && <div className="loading">搜索中...</div>}

      <SearchResults results={results} />
    </div>
  );
}
```

## Suspense

### 1. 数据获取

```javascript
import { Suspense } from "react";

// 使用 React 18 的 Suspense 进行数据获取
function UserProfile({ userId }) {
  const user = use(fetchUser(userId)); // 假设的数据获取 Hook

  return (
    <div>
      <h1>{user.name}</h1>
      <img src={user.avatar} alt={user.name} />
      <p>{user.bio}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>用户列表</h1>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userId="123" />
      </Suspense>
    </div>
  );
}
```

### 2. 路由切换优化

```javascript
import { Router, Routes, Route } from "react-router-dom";

function AppRouter() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const navigateWithTransition = (to) => {
    startTransition(() => {
      navigate(to);
    });
  };

  return (
    <>
      <Navigation onNavigate={navigateWithTransition} isPending={isPending} />

      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </>
  );
}
```

## 总结

React 18 的并发特性带来了革命性的改变：

1. **自动批处理**：所有更新都自动批处理，减少重渲染
2. **useTransition**：将非紧急更新标记为可中断
3. **Suspense 增强**：支持数据获取和选择性水合

这些特性让我们能够构建更流畅、响应更快的用户界面。
