# React19 升级了哪些新特性？

React 19 的更新内容可以参考 React [官方更新博客](https://zh-hans.react.dev/blog/2024/12/05/react-19)

## 1、 Actions 相关

按照惯例，使用异步过渡的函数被称为 “Actions”。 在 Actions 的基础上，React 19 引入了 useOptimistic 来管理乐观更新，以及一个新的 Hook React.useActionState 来处理 Actions 的常见情况。在 react-dom 中添加了 `<form>` Actions 来自动管理表单和 useFormStatus 来支持表单中 Actions 的常见情况。

## 2、 新的 API: use

在 React 19 中，我们引入了一个新的 API 来在渲染中读取资源：use。

例如，你可以使用 use 读取一个 promise，React 将挂起，直到 promise 解析完成：

```jsx
import { use } from "react";

function Comments({ commentsPromise }) {
  // `use` 将被暂停直到 promise 被解决.
  const comments = use(commentsPromise);
  return comments.map((comment) => <p key={comment.id}>{comment}</p>);
}

function Page({ commentsPromise }) {
  // 当“use”在注释中暂停时,
  // 将显示此悬念边界。
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

## 3、服务端组件和动作

React 服务端组件现已稳定，允许提前渲染组件。与服务端动作（通过“use server”指令启用）配对后，客户端组件可以无缝调用异步服务端函数。

## 4、ref 属性

从 React 19 开始，你现在可以在函数组件中将 ref 作为 prop 进行访问：

```jsx
function MyInput({ placeholder, ref }) {
  return <input placeholder={placeholder} ref={ref} />;
}

//...
<MyInput ref={ref} />;
```

新的函数组件将不再需要 forwardRef。

## 5、`<Context>` 作为提供者

在 React 19 中，你可以将 `<Context>` 渲染为提供者，就无需再使用 `<Context.Provider>` 了：

```jsx
const ThemeContext = createContext("");

function App({ children }) {
  return <ThemeContext value="dark">{children}</ThemeContext>;
}
```

新的 Context 提供者可以使用 `<Context>`，我们将发布一个 codemod 来转换现有的提供者。在未来的版本中，我们将弃用 `<Context.Provider>`。

更多更新请参考[官方更新博客](https://zh-hans.react.dev/blog/2024/12/05/react-19)
