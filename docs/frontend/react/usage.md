# React 使用

React 是全球应用最广泛的框架，国内大厂多用 React

## React 组件生命周期

::: info

React 组件生命周期分为以下三个阶段。

**挂载阶段**：这是组件首次被创建并插入到 DOM 中的阶段。

**更新阶段**：当组件的 props 或 state 发生变化时，就会触发更新阶段。

**卸载阶段**：组件从 DOM 中移除时进入卸载阶段。

函数组件是没有明确的生命周期方法，但可以通过 `useEffect` 来模拟生命周期行为。

模拟**挂载阶段**的生命周期方法：

- 只需要在 `useEffect` 的依赖数组中传入一个空数组 `[]`。这样，该副作用只会在组件挂载后运行一次。

  ```js
  useEffect(() => {
    console.log("代码只会在组件挂载后执行一次");
  }, []);
  ```

模拟**更新阶段**的生命周期方法：

- 通过将依赖项放入依赖数组中，`useEffect` 可以在依赖项更改时执行。如果你省略了依赖数组，副作用将在每次渲染后执行。
  ```js
  // 注意这里没有提供依赖数组
  useEffect(() => {
    console.log("代码会在组件挂载后以及每次更新后执行");
  });
  // 特定依赖更新时执行
  useEffect(() => {
    console.log("代码会在 count 更新后执行");
  }, [count]);
  ```

模拟**卸载阶段**的生命周期方法：

- 在 `useEffect` 的函数中返回一个函数，该函数会在组件卸载前执行。

  ```js
  useEffect(() => {
    return () => {
      console.log("代码会在组件卸载前执行");
    };
  }, []);
  ```

  :::

## React 父子组件生命周期调用顺序

::: info

函数组件的生命周期通过 `useEffect` 模拟，其调用顺序如下：

**挂载阶段**

- **父组件**：执行函数体（首次渲染）
- **子组件**：执行函数体（首次渲染）
- **子组件**：`useEffect`（挂载阶段）
- **父组件**：`useEffect`（挂载阶段）

**更新阶段**

- **父组件**：执行函数体（重新渲染）
- **子组件**：执行函数体（重新渲染）
- **子组件**：`useEffect` 清理函数（如果依赖项变化）
- **父组件**：`useEffect` 清理函数（如果依赖项变化）
- **子组件**：`useEffect`（如果依赖项变化）
- **父组件**：`useEffect`（如果依赖项变化）

**卸载阶段**

- **父组件**：`useEffect` 清理函数
- **子组件**：`useEffect` 清理函数

:::

## React 组件通讯方式

::: info

- **通过 props 向子组件传递数据**

```js
//父组件
const Parent = () => {
  const message = "Hello from Parent";
  return <Child message={message} />;
};

// 子组件
const Child = ({ message }) => {
  return <div>{message}</div>;
};
```

- **通过回调函数向父组件传递数据**

```js
//父组件
const Parent = () => {
  const handleData = (data) => {
    console.log("Data from Child:", data);
  };
  return <Child onSendData={handleData} />;
};

// 子组件
const Child = ({ message }) => {
  return (
    <button onClick={() => onSendData("Hello from Child")}>Send Data</button>
  );
};
```

- **使用 refs 调用子组件暴露的方法**

```js
import React, { useRef, forwardRef, useImperativeHandle } from "react";

// 子组件
const Child = forwardRef((props, ref) => {
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    sayHello() {
      alert("Hello from Child Component!");
    },
  }));

  return <div>Child Component</div>;
});

// 父组件
function Parent() {
  const childRef = useRef(null);

  const handleClick = () => {
    if (childRef.current) {
      childRef.current.sayHello();
    }
  };

  return (
    <div>
      <Child ref={childRef} />
      <button onClick={handleClick}>Call Child Method</button>
    </div>
  );
}

export default Parent;
```

- **通过 Context 进行跨组件通信**

```js
import React, { useState } from "react";

// 创建一个 Context
const MyContext = React.createContext();

// 父组件
function Parent() {
  const [sharedData, setSharedData] = useState("Hello from Context");

  const updateData = () => {
    setSharedData("Updated Data from Context");
  };

  return (
    // 提供数据和更新函数
    <MyContext.Provider value={{ sharedData, updateData }}>
      <ChildA />
    </MyContext.Provider>
  );
}

// 子组件 A（引用子组件 B）
function ChildA() {
  return (
    <div>
      <ChildB />
    </div>
  );
}

// 子组件 B（使用 useContext）
function ChildB() {
  const { sharedData, updateData } = React.useContext(MyContext);
  return (
    <div>
      <div>ChildB: {sharedData}</div>
      <button onClick={updateData}>Update Data</button>
    </div>
  );
}

export default Parent;
```

- **使用状态管理库进行通信**

  - **React Context + useReducer**

    ```js
    import React, { useReducer } from "react";

    const initialState = { count: 0 };

    function reducer(state, action) {
      switch (action.type) {
        case "increment":
          return { count: state.count + 1 };
        case "decrement":
          return { count: state.count - 1 };
        default:
          throw new Error();
      }
    }

    const CounterContext = React.createContext();

    function CounterProvider({ children }) {
      const [state, dispatch] = useReducer(reducer, initialState);
      return (
        <CounterContext.Provider value={{ state, dispatch }}>
          {children}
        </CounterContext.Provider>
      );
    }

    function Counter() {
      const { state, dispatch } = React.useContext(CounterContext);
      return (
        <div>
          Count: {state.count}
          <button onClick={() => dispatch({ type: "increment" })}>+</button>
          <button onClick={() => dispatch({ type: "decrement" })}>-</button>
        </div>
      );
    }

    function App() {
      return (
        <CounterProvider>
          <Counter />
        </CounterProvider>
      );
    }

    export default App;
    ```

  - **Zustand**

  ```
  import create from "zustand";

  const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }));

  function Counter() {
    const { count, increment, decrement } = useStore();
    return (
      <div>
        Count: {count}
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
      </div>
    );
  }

  export default Counter;
  ```

:::

## state 和 props 有什么区别？

::: info

在 React 中，props 和 state 都用于管理组件的数据和状态。

**Props（属性）：**

props 是组件之间传递数据的一种方式，用于从父组件向子组件传递数据。
props 是只读的，即父组件传递给子组件的数据在子组件中不能被修改。
props 是在组件的声明中定义，通过组件的属性传递给子组件。
props 的值由父组件决定，子组件无法直接改变它的值。
当父组件的 props 发生变化时，子组件会重新渲染。

**State（状态）：**

state 是组件内部的数据，用于管理组件的状态和变化。
state 是可变的，组件可以通过 setState 方法来更新和修改 state。
state 是在组件的构造函数中初始化的，通常被定义为组件的类属性。
state 的值可以由组件自身内部改变，通过调用 setState 方法触发组件的重新渲染。
当组件的 state 发生变化时，组件会重新渲染。

**总结：**

props 是父组件传递给子组件的数据，是只读的，子组件无法直接修改它。
state 是组件内部的数据，是可变的，组件可以通过 setState 方法来修改它。
props 用于组件之间的数据传递，而 state 用于管理组件自身的状态和变化。

:::

## React 有哪些内置 Hooks ？

::: info

React 目前有多个 Hooks API，可以参考[官方文档 Hooks](https://zh-hans.react.dev/reference/react/hooks)，可以按照功能进行分类:

**1. 状态管理 Hooks**

- useState: 用于在函数组件中添加局部状态。
- useReducer: 用于管理复杂的状态逻辑，类似于 Redux 的 reducer。

**2. 副作用 Hooks**

- useEffect: 用于在函数组件中执行副作用操作（如数据获取、订阅、手动 DOM 操作等）。
- useLayoutEffect: 与 useEffect 类似，但在 DOM 更新后同步执行，适用于需要直接操作 DOM 的场景。

**3. 上下文 Hooks**

- useContext: 用于访问 React 的上下文（Context）。

**4. 引用 Hooks**

- useRef: 用于创建一个可变的引用对象，通常用于访问 DOM 元素或存储可变值。

**5. 性能优化 Hooks**

- useMemo: 用于缓存计算结果，避免在每次渲染时都重新计算。
- useCallback: 用于缓存回调函数，避免在每次渲染时都创建新的回调。

**6. 其他 Hooks**

- useDeferredValue: 延迟更新 UI 的某些部分。
- useActionState: 根据某个表单动作的结果更新 state。
- useImperativeHandle: 用于自定义暴露给父组件的实例值，通常与 forwardRef 一起使用。
- useDebugValue: 用于在 React 开发者工具中显示自定义 Hook 的标签。
- useOptimistic 帮助你更乐观地更新用户界面
- useTransition: 用于标记某些状态更新为“过渡”状态，允许你在更新期间显示加载指示器。
- useId: 用于生成唯一的 ID，可以生成传递给无障碍属性的唯一 ID。
- useSyncExternalStore: 用于订阅外部存储（如 Redux 或 Zustand）的状态。
- useInsertionEffect: 为 CSS-in-JS 库的作者特意打造的，在布局副作用触发之前将元素插入到 DOM 中

:::

## useEffect 和 useLayoutEffect 的区别

::: info

**1. 执行时机**

- **useEffect**:

  - **执行时机**: 在浏览器完成绘制（即 DOM 更新并渲染到屏幕）之后异步执行。
  - **适用场景**: 适用于大多数副作用操作，如数据获取、订阅、手动 DOM 操作等，因为这些操作通常不需要阻塞浏览器的渲染。

- **useLayoutEffect**:
  - **执行时机**: 在 DOM 更新之后，但在浏览器绘制之前同步执行。
  - **适用场景**: 适用于需要在浏览器绘制之前同步执行的副作用操作，如测量 DOM 元素、同步更新 DOM 等。由于它是同步执行的，可能会阻塞浏览器的渲染，因此应谨慎使用。

**2. 对渲染的影响**

- **useEffect**:

  - 由于是异步执行，不会阻塞浏览器的渲染过程，因此对用户体验的影响较小。
  - 如果副作用操作导致状态更新，React 会重新渲染组件，但用户不会看到中间的闪烁或不一致的状态。

- **useLayoutEffect**:
  - 由于是同步执行，会阻塞浏览器的渲染过程，直到副作用操作完成。
  - 如果副作用操作导致状态更新，React 会立即重新渲染组件，用户可能会看到中间的闪烁或不一致的状态。

**3. 总结**

- **useEffect**: 异步执行，不阻塞渲染，适合大多数副作用操作。
- **useLayoutEffect**: 同步执行，阻塞渲染，适合需要在绘制前同步完成的副作用操作。

:::

## 为何 dev 模式下 useEffect 执行两次？

::: info

React 官方文档其实对这个问题进行了[解答](https://zh-hans.react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts)：

在开发环境下，如果开启严格模式，React 会在实际运行 setup 之前额外运行一次 setup 和 cleanup。

这是一个压力测试，用于验证 Effect 的逻辑是否正确实现。如果出现可见问题，则 cleanup 函数缺少某些逻辑。cleanup 函数应该停止或撤消 setup 函数所做的任何操作。一般来说，用户不应该能够区分 setup 被调用一次（如在生产环境中）和调用 setup → cleanup → setup 序列（如在开发环境中）。

借助严格模式的目标是帮助开发者提前发现以下问题：

1. 不纯的渲染逻辑：例如，依赖外部状态或直接修改 DOM。
2. 未正确清理的副作用：例如，未在 useEffect 的清理函数中取消订阅或清除定时器。
3. 不稳定的组件行为：例如，组件在多次挂载和卸载时表现不一致。

通过强制组件挂载和卸载两次，React 可以更好地暴露这些问题。

:::

## React 闭包陷阱

::: info

让我们举个例子：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 每次打印的都是初始值 0
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 依赖数组为空，effect 只运行一次

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

在这个例子中：

- `useEffect` 只在组件挂载时运行一次。
- `setInterval` 的回调函数形成了一个闭包，捕获了初始的 `count` 值（即 0）。
- 即使 `count` 状态更新了，`setInterval` 中的回调函数仍然访问的是旧的 `count` 值。

闭包陷阱的根本原因是 JavaScript 的闭包机制：

- 当一个函数被定义时，它会捕获当前作用域中的变量。
- 如果这些变量是状态或 props，它们的值在函数定义时被“固定”下来。
- 当状态或 props 更新时，闭包中的值并不会自动更新。

为了避免闭包陷阱，可以将依赖的状态或 props 添加到 useEffect 的依赖数组中，这样每次状态更新时，useEffect 都会重新运行，闭包中的值也会更新。

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 每次打印最新的 count 值
  }, 1000);

  return () => clearInterval(timer);
}, [count]); // 将 count 添加到依赖数组
```

:::

## React state 不可变数据

::: info

在 React 中，**状态（state）的不可变性** 是指你不能直接修改状态的值，而是需要创建一个新的值来替换旧的状态。

使用不可变数据可以带来如下好处：

1. **性能优化**

React 使用浅比较（shallow comparison）来检测状态是否发生变化。如果状态是不可变的，React 只需要比较引用（即内存地址）是否变化，而不需要深度遍历整个对象或数组。

2. **可预测性**

- 不可变数据使得状态的变化更加可预测和可追踪。
- 每次状态更新都会生成一个新的对象或数组，这样可以更容易地调试和追踪状态的变化历史。

3. **避免副作用**

- 直接修改状态可能会导致意外的副作用，尤其是在异步操作或复杂组件中。
- 不可变数据确保了状态的更新是纯函数式的，避免了副作用。

**关于如何实现不可变数据？**

1. **更新对象时使用新的对象**

```jsx
// ❌ 错误：直接修改状态
state.name = "new name";
setState(state);
```

```jsx
// ✅ 正确：创建新对象
setState({
  ...state, // 复制旧状态
  name: "new name", // 更新属性
});
```

2. **更新数组时使用新的数组**

```jsx
// ❌ 错误：直接修改数组
state.items.push(newItem);
setState(state);
```

```jsx
// ✅ 正确：创建新数组
setState({
  ...state,
  items: [...state.items, newItem], // 添加新元素
});
```

3. **使用工具库简化不可变更新**

常用的库有：

1. **Immer.js**
   [Immer](https://immerjs.github.io/immer/) 是一个流行的库，它允许你以可变的方式编写代码，但最终生成不可变的数据。

```jsx
import produce from "immer";

setState(
  produce(state, (draft) => {
    draft.user.profile.name = "new name"; // 直接修改
    draft.items.push(newItem); // 直接修改
  })
);
```

2. **Immutable.js**

[Immutable.js](https://immutable-js.com/) 提供了不可变的数据结构（如 `List`、`Map` 等），可以更方便地处理不可变数据。

```jsx
import { Map } from "immutable";

const state = Map({ name: "John", age: 30 });
const newState = state.set("name", "Jane");
```

:::

## React state 异步更新

::: info

在 React 18 之前，React 采用批处理策略来优化状态更新。在批处理策略下，React 将在事件处理函数结束后应用所有的状态更新，这样可以避免不必要的渲染和 DOM 操作。

然而，这个策略在异步操作中就无法工作了。因为 React 没有办法在适当的时机将更新合并起来，所以结果就是在异步操作中的每一个状态更新都会导致一个新的渲染。

例如，当你在一个 onClick 事件处理函数中连续调用两次 setState，React 会将这两个更新合并，然后在一次重新渲染中予以处理。

然而，在某些场景下，如果你在事件处理函数之外调用 setState，React 就无法进行批处理了。比如在 setTimeout 或者 Promise 的回调函数中。在这些场景中，每次调用 setState，React 都会触发一次重新渲染，无法达到批处理的效果。

React 18 引入了自动批处理更新机制，让 React 可以捕获所有的状态更新，并且无论在何处进行更新，都会对其进行批处理。这对一些异步的操作，如 Promise，setTimeout 之类的也同样有效。

这一新特性的实现，核心在于 React 18 对渲染优先级的管理。React 18 引入了一种新的协调器，被称为“React Scheduler”。它负责管理 React 的工作单元队列。每当有一个新的状态更新请求，React 会创建一个新的工作单元并放入这个队列。当 JavaScript 运行栈清空，Event Loop 即将开始新的一轮循环时，Scheduler 就会进入工作，处理队列中的所有工作单元，实现了批处理。

:::

## React state 的“合并”特性

::: info

React **状态的“合并”特性** 是指当使用 `setState` 更新状态时，React 会将新状态与旧状态进行浅合并（shallow merge），而不是直接替换整个状态对象。

合并特性在类组件中尤为明显，而在函数组件中需要手动实现类似的行为。

1. **类组件中的状态合并**

在类组件中，`setState` 会自动合并状态对象。例如：

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "John",
      age: 30,
    };
  }

  updateName = () => {
    this.setState({ name: "Jane" }); // 只更新 name，age 保持不变
  };

  render() {
    return (
      <div>
        <p>Name: {this.state.name}</p>
        <p>Age: {this.state.age}</p>
        <button onClick={this.updateName}>Update Name</button>
      </div>
    );
  }
}
```

在这个例子中：

- 调用 `this.setState({ name: 'Jane' })` 只会更新 `name` 属性，而 `age` 属性保持不变。
- React 会自动将新状态 `{ name: 'Jane' }` 与旧状态 `{ name: 'John', age: 30 }` 进行浅合并，结果是 `{ name: 'Jane', age: 30 }`。

2. **函数组件中的状态替换**

在函数组件中，`useState` 的 setter 函数不会自动合并状态。如果你直接传递一个新对象，它会完全替换旧状态。

```jsx
function MyComponent() {
  const [state, setState] = useState({
    name: "John",
    age: 30,
  });

  const updateName = () => {
    setState({ name: "Jane" }); // ❌ 直接替换，age 会丢失
  };

  return (
    <div>
      <p>Name: {state.name}</p>
      <p>Age: {state.age}</p>
      <button onClick={updateName}>Update Name</button>
    </div>
  );
}
```

在这个例子中：

- 调用 `setState({ name: 'Jane' })` 会完全替换状态对象，导致 `age` 属性丢失。
- 最终状态变为 `{ name: 'Jane' }`，而不是 `{ name: 'Jane', age: 30 }`。

3. **如何在函数组件中实现状态合并？**

在函数组件中，如果需要实现类似类组件的状态合并特性，可以手动合并状态：

方法 1：使用扩展运算符

```jsx
function MyComponent() {
  const [state, setState] = useState({
    name: "John",
    age: 30,
  });

  const updateName = () => {
    setState((prevState) => ({
      ...prevState, // 复制旧状态
      name: "Jane", // 更新 name
    }));
  };

  return (
    <div>
      <p>Name: {state.name}</p>
      <p>Age: {state.age}</p>
      <button onClick={updateName}>Update Name</button>
    </div>
  );
}
```

方法 2：使用 `useReducer`
`useReducer` 可以更灵活地管理复杂状态，并实现类似合并的行为。

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_NAME":
      return {
        ...state,
        name: action.payload,
      };
    default:
      throw new Error();
  }
}

function MyComponent() {
  const [state, dispatch] = useReducer(reducer, {
    name: "John",
    age: 30,
  });

  const updateName = () => {
    dispatch({ type: "UPDATE_NAME", payload: "Jane" });
  };

  return (
    <div>
      <p>Name: {state.name}</p>
      <p>Age: {state.age}</p>
      <button onClick={updateName}>Update Name</button>
    </div>
  );
}
```

:::

## 什么是 React 受控组件？

::: info
在 React 中，受控组件（Controlled Component） 是指表单元素（如 `<input>`、`<textarea>`、`<select>` 等）的值由 React 的状态（state）控制，而不是由 DOM 自身管理。换句话说，表单元素的值通过 value 属性绑定到 React 的状态，并通过 onChange 事件处理函数来更新状态。

这是一个简单的受控组件示例：

```jsx
function ControlledInput() {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value); // 更新状态
  };

  return (
    <div>
      <input
        type="text"
        value={value} // 绑定状态
        onChange={handleChange} // 监听输入变化
      />
      <p>Current value: {value}</p>
    </div>
  );
}
```

受控组件的优点：

1. 完全控制表单数据：React 状态是表单数据的唯一来源，可以轻松地对数据进行验证、格式化或处理。
2. 实时响应输入：可以在用户输入时实时更新 UI 或执行其他操作（如搜索建议）。
3. 易于集成：与其他 React 状态和逻辑无缝集成。

:::
