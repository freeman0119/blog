# ECMAScript 版本特性

## ES6 (ES2015)

### let 和 const

```js
// 块级作用域
{
  let x = 1;
  const y = 2;
}
// console.log(x); // ReferenceError

// 暂时性死区
console.log(a); // undefined (var 的提升)
// console.log(b); // ReferenceError (let 没有提升)
var a = 1;
let b = 2;
```

### 箭头函数

```js
// 简洁写法
const add = (a, b) => a + b;

// this 绑定
const obj = {
  value: 1,
  getValue: function () {
    setTimeout(() => {
      console.log(this.value); // 1 (this 绑定到 obj)
    }, 100);
  },
};
```

### 解构赋值

```js
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4];
console.log(a, b, rest); // 1, 2, [3, 4]

// 对象解构
const { name, age = 20 } = { name: "John" };
console.log(name, age); // 'John', 20
```

### 模板字符串

```js
const name = "World";
const greeting = `Hello ${name}!
This is a multiline
string.`;
```

### Promise

```js
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data fetched");
    }, 1000);
  });
};

Promise.all([fetchData(), fetchData()]).then((results) => {
  console.log(results); // ['Data fetched', 'Data fetched']
});
```

### Class 类

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  static create(name) {
    return new Animal(name);
  }

  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks.`);
  }
}
```

### 模块化

```js
// math.js
export const add = (a, b) => a + b;
export default class Calculator {}

// main.js
import Calculator, { add } from "./math.js";
```

### 其他特性

```js
// Symbol
const sym = Symbol("description");

// Set
const set = new Set([1, 2, 2, 3]);
console.log([...set]); // [1, 2, 3]

// Map
const map = new Map([["key", "value"]]);

// Proxy
const handler = {
  get: (target, prop) => `Property ${prop}`,
};
const proxy = new Proxy({}, handler);

// Generator
function* generator() {
  yield 1;
  yield 2;
}
```

## ES7 (ES2016)

### Array.prototype.includes()

```js
const array = [1, 2, NaN];
console.log(array.includes(2)); // true
console.log(array.includes(NaN)); // true
console.log([1, 2, 3].includes(4)); // false
```

### 指数运算符

```js
const result = 2 ** 3;
console.log(result); // 8

// 等同于
console.log(Math.pow(2, 3)); // 8
```

## ES8 (ES2017)

### async/await

```js
async function fetchUser() {
  try {
    const response = await fetch("https://api.example.com/user");
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Error:", error);
  }
}
```

### Object.values/entries

```js
const obj = { a: 1, b: 2 };
console.log(Object.values(obj)); // [1, 2]
console.log(Object.entries(obj)); // [['a', 1], ['b', 2]]
```

### String padding

```js
const str = "123";
console.log(str.padStart(5, "0")); // '00123'
console.log(str.padEnd(5, "0")); // '12300'
```

## ES9 (ES2018)

### 异步迭代

```js
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

async function example() {
  for await (const num of asyncGenerator()) {
    console.log(num); // 1, 2
  }
}
```

### Promise.finally()

```js
fetch("https://api.example.com/data")
  .then((response) => response.json())
  .catch((error) => console.error(error))
  .finally(() => {
    console.log("请求完成，无论成功失败");
  });
```

### Rest/Spread 属性

```js
// 对象解构
const { x, y, ...rest } = { x: 1, y: 2, a: 3, b: 4 };
console.log(rest); // { a: 3, b: 4 }

// 对象展开
const obj1 = { foo: "bar", x: 42 };
const obj2 = { foo: "baz", y: 13 };
const clonedObj = { ...obj1 };
const mergedObj = { ...obj1, ...obj2 };
```

### 正则表达式改进

```js
// 命名捕获组
const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = re.exec("2024-03-14");
console.log(match.groups); // { year: '2024', month: '03', day: '14' }

// 后行断言
const regex = /(?<=\$)\d+/;
console.log(regex.exec("$123")); // ['123']

// dotAll 模式
const re2 = /hello.world/s;
console.log(re2.test("hello\nworld")); // true
```

## ES10 (ES2019)

### Array 方法增强

```js
// flat
const arr = [1, 2, [3, 4, [5, 6]]];
console.log(arr.flat()); // [1, 2, 3, 4, [5, 6]]
console.log(arr.flat(2)); // [1, 2, 3, 4, 5, 6]

// flatMap
const arr2 = [1, 2, 3];
console.log(arr2.flatMap((x) => [x, x * 2])); // [1, 2, 2, 4, 3, 6]
```

### Object.fromEntries()

```js
const entries = [
  ["name", "John"],
  ["age", 30],
];
const obj = Object.fromEntries(entries);
console.log(obj); // { name: 'John', age: 30 }
```

### String 修剪方法

```js
const str = "  hello  ";
console.log(str.trimStart()); // "hello  "
console.log(str.trimEnd()); // "  hello"
```

### 可选的 catch 绑定

```js
try {
  // 可能抛出错误的代码
} catch {
  // 不需要错误参数
  console.log("发生错误");
}
```

## ES11 (ES2020)

### 可选链和空值合并

```js
const user = {
  address: {
    street: "Main St",
  },
};

// 可选链
console.log(user?.address?.street); // "Main St"
console.log(user?.contact?.email); // undefined

// 空值合并
const name = null ?? "Anonymous";
console.log(name); // "Anonymous"
```

### Promise.allSettled()

```js
const promises = [
  Promise.resolve(1),
  Promise.reject("error"),
  Promise.resolve(3),
];

Promise.allSettled(promises).then((results) => {
  console.log(results);
  // [
  //   { status: "fulfilled", value: 1 },
  //   { status: "rejected", reason: "error" },
  //   { status: "fulfilled", value: 3 }
  // ]
});
```

### BigInt

```js
const bigInt = 9007199254740991n;
console.log(bigInt + 1n); // 9007199254740992n
```

### 动态 import

```js
const loadModule = async () => {
  const module = await import("./module.js");
  module.doSomething();
};
```

## ES12 (ES2021)

ES2021 带来了一些实用的字符串处理方法和逻辑操作符，使代码更简洁优雅。

### String.prototype.replaceAll()

在此之前，要替换字符串中的所有匹配项，需要使用正则表达式或其他变通方法。replaceAll 方法提供了一个更直接的解决方案。

```js
const str = "hello hello world";
console.log(str.replaceAll("hello", "hi")); // "hi hi world"
```

### Promise.any()

Promise.any() 是 Promise 并发处理的新成员，它会在任意一个 Promise 成功时立即解决，只有当所有 Promise 都失败时才会拒绝。这对于需要"至少一个成功"的场景特别有用。

与 Promise.race() 的区别：

- Promise.race() 返回第一个完成的 Promise 结果，无论成功或失败
- Promise.any() 返回第一个成功的 Promise 结果，会等待直到有一个成功
- Promise.race() 适用于"超时控制"等场景
- Promise.any() 适用于"备选方案"等场景

```js
const promises = [
  Promise.reject("Error 1"),
  Promise.resolve("Success"),
  Promise.reject("Error 2"),
];

Promise.any(promises)
  .then((result) => console.log(result)) // "Success"
  .catch((error) => console.log(error));

const promises2 = [
  new Promise((resolve) => setTimeout(() => resolve("快"), 100)),
  new Promise((resolve) => setTimeout(() => resolve("慢"), 200)),
  new Promise((_, reject) => setTimeout(() => reject("失败"), 50)),
];

Promise.race(promises2)
  .then((result) => console.log(result))
  .catch((error) => console.log(error)); // "失败"（因为失败的 Promise 最快完成）
```

### 逻辑赋值运算符

逻辑赋值运算符结合了逻辑运算和赋值操作，提供了更简洁的语法来处理条件赋值。包括：

- ??= : 仅在值为 null 或 undefined 时赋值
- &&= : 仅在左侧为真值时赋值
- ||= : 仅在左侧为假值时赋值

```js
// 空值合并赋值
let x = null;
x ??= 42;
console.log(x); // 42

// 逻辑与赋值
let obj = { count: 5 };
obj.count &&= 10;
console.log(obj.count); // 10

// 逻辑或赋值
let y = 0;
y ||= 42;
console.log(y); // 42
```

### 数字分隔符

数字分隔符（\_）提高了长数字的可读性，可以用在任何数字字面量中，包括二进制、十六进制等。这个特性纯粹是为了提高代码可维护性。

```js
const billion = 1_000_000_000;
const bytes = 0xff_ff_ff_ff;
const binary = 0b1010_0001_1000;
```

## ES13 (ES2022)

ES2022 带来了类字段的重大改进，以及一些便利的新方法和特性。

### Class 字段

类字段声明极大地简化了类的编写方式：

- 公共字段：直接在类中声明实例属性
- 私有字段：使用 # 前缀声明私有属性
- 静态字段：使用 static 关键字声明类级别的属性

```js
class Counter {
  count = 0; // 公共字段
  #privateValue = 42; // 私有字段
  static version = "1.0"; // 静态字段

  increment() {
    this.count++;
    console.log(this.#privateValue); // 可以访问私有字段
  }
}
```

### Top-level await

顶层 await 允许在模块的顶层使用 await 关键字，不再需要包装在 async 函数中。这对于模块初始化和依赖加载特别有用。

```js
// 不需要包装在 async 函数中
const response = await fetch("https://api.example.com/data");
const data = await response.json();
console.log(data);
```

### Object.hasOwn() 和 at()

- Object.hasOwn()：提供了一个更安全的方式来检查对象自有属性
- at()：支持数组和字符串的相对索引访问，特别适合访问最后几个元素

```js
const obj = { prop: 42 };
console.log(Object.hasOwn(obj, "prop")); // true
console.log(Object.hasOwn(obj, "toString")); // false

const arr = [1, 2, 3, 4, 5];
console.log(arr.at(-1)); // 5
console.log(arr.at(-2)); // 4
```

### Error Cause

Error Cause 允许在创建错误时添加额外的上下文信息，使错误处理和调试更加方便。这对于错误链和错误追踪特别有用。

```js
try {
  throw new Error("Failed to fetch", {
    cause: {
      code: 404,
      path: "/api/data",
    },
  });
} catch (error) {
  console.log(error.cause); // { code: 404, path: "/api/data" }
}
```

## ES14 (ES2023)

ES2023 主要关注数组操作的改进，引入了一系列不会修改原数组的新方法。

### Array 新方法

这些新方法都返回新数组而不修改原数组，符合函数式编程的不可变性原则：

- toSorted()：返回排序后的新数组
- toReversed()：返回反转后的新数组
- with()：返回替换指定索引元素后的新数组
- toSpliced()：返回删除/插入元素后的新数组

```js
const arr = [3, 1, 4, 1, 5];
// 不修改原数组的方法
console.log(arr.toSorted()); // [1, 1, 3, 4, 5]
console.log(arr.toReversed()); // [5, 1, 4, 1, 3]
console.log(arr.with(2, 6)); // [3, 1, 6, 1, 5]
console.log(arr.toSpliced(1, 2, 7, 8)); // [3, 7, 8, 1, 5]
console.log(arr); // 原数组保持不变: [3, 1, 4, 1, 5]
```

### WeakMap 支持 Symbol 键

允许使用 Symbol 作为 WeakMap 的键，这扩展了 WeakMap 的使用场景，特别是在需要唯一标识符但又不想防止垃圾回收的情况下。

```js
const weak = new WeakMap();
const key = Symbol("key");
const obj = {};

weak.set(key, "value");
console.log(weak.get(key)); // "value"
```

## 最新提案

这些特性仍在提案阶段，语法和行为可能会发生变化。

### 装饰器

装饰器提供了一种声明式的方式来修改类和类成员的行为。它们可以用于：

- 类的修改和增强
- 属性描述符的修改
- 方法行为的扩展
- 元数据的添加

```js
@logged
class Example {
  @nonenumerable
  method() {}
}

function logged(target) {
  console.log(`${target.name} 类被创建`);
}

function nonenumerable(target, name, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
```

### 管道操作符

管道操作符提供了一种函数式编程风格的数据转换方式，使数据处理流程更清晰：

- 从左到右的数据流
- 避免嵌套函数调用
- 提高代码可读性

```js
// 提案中的语法
const result =
  "hello"
  |> (str) => str.toUpperCase()
  |> (str) => str.split("")
  |> (arr) => arr.reverse()
  |> (arr) => arr.join("");

console.log(result); // "OLLEH"
```
