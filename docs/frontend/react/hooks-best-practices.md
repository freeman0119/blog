# React Hooks 最佳实践

_发布时间: 2024-01-15_  
_标签: React, Hooks, 最佳实践_

## 前言

React Hooks 自 16.8 版本引入以来，彻底改变了我们编写 React 组件的方式。本文将分享在实际项目中积累的 Hooks 最佳实践。

## 核心原则

### 1. 只在顶层调用 Hooks

```javascript
// ❌ 错误：在条件语句中调用
function UserProfile({ user }) {
  if (user) {
    const [name, setName] = useState(user.name);
  }
  // ...
}

// ✅ 正确：在顶层调用
function UserProfile({ user }) {
  const [name, setName] = useState(user?.name || "");
  // ...
}
```

### 2. 使用自定义 Hooks 提取逻辑

```javascript
// 自定义 Hook：用户数据管理
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// 使用自定义 Hook
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{user?.name}</div>;
}
```

## 常用 Hooks 优化

### useState 优化

```javascript
// 使用函数式更新避免过时闭包
const [count, setCount] = useState(0);

// ❌ 可能使用过时的 count
const increment = () => setCount(count + 1);

// ✅ 使用函数式更新
const increment = () => setCount((prev) => prev + 1);
```

### useEffect 依赖管理

```javascript
// ❌ 缺少依赖
useEffect(() => {
  fetchData(userId);
}, []); // userId 变化时不会重新执行

// ✅ 正确的依赖
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ 使用 useCallback 稳定函数引用
const fetchUserData = useCallback(async (id) => {
  const response = await api.getUser(id);
  setUser(response.data);
}, []);

useEffect(() => {
  fetchUserData(userId);
}, [userId, fetchUserData]);
```

### useMemo 和 useCallback 使用时机

```javascript
function ExpensiveComponent({ items, onItemClick }) {
  // ✅ 缓存昂贵的计算
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  // ✅ 缓存函数防止子组件不必要的重渲染
  const handleClick = useCallback(
    (item) => {
      onItemClick(item);
    },
    [onItemClick]
  );

  return (
    <div>
      <div>Total: {expensiveValue}</div>
      {items.map((item) => (
        <ItemComponent key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

## 实战案例：表单管理

```javascript
// 自定义表单 Hook
function useForm(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const rule = validationRules[field];
      const value = values[field];

      if (rule.required && !value) {
        newErrors[field] = "此字段必填";
      } else if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
  };
}

// 使用表单 Hook
function ContactForm() {
  const { values, errors, touched, setValue, setFieldTouched, validate } =
    useForm(
      { name: "", email: "" },
      {
        name: { required: true },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "请输入有效的邮箱地址",
        },
      }
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // 提交表单
      console.log("提交数据:", values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={values.name}
        onChange={(e) => setValue("name", e.target.value)}
        onBlur={() => setFieldTouched("name")}
        placeholder="姓名"
      />
      {touched.name && errors.name && <span>{errors.name}</span>}

      <input
        type="email"
        value={values.email}
        onChange={(e) => setValue("email", e.target.value)}
        onBlur={() => setFieldTouched("email")}
        placeholder="邮箱"
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
```

## 总结

React Hooks 的最佳实践包括：

1. **遵循 Hooks 规则**: 只在顶层调用，只在 React 函数中调用
2. **合理使用依赖**: 确保 useEffect 的依赖数组正确
3. **抽取自定义 Hooks**: 提高代码复用性和可维护性
4. **性能优化**: 适当使用 useMemo 和 useCallback
5. **状态管理**: 选择合适的状态管理方案

通过这些实践，我们可以写出更清晰、更高效的 React 代码。

---

_下一篇文章将探讨 React 18 的并发特性，敬请期待！_
