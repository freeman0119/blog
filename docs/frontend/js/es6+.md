# ES6+ 新特性全解析

## 引言

ECMAScript 2015（ES6）是 JavaScript 语言的重大更新，随后每年都有新特性加入。本文全面介绍 ES6 及后续版本的核心特性。

## ES6

### 变量声明：let 与 const

```js
// let 块级作用域变量
let name = "John";
name = "Jane"; // 允许重新赋值

// const 块级作用域常量
const PI = 3.14159;
// PI = 3.14; // 报错：常量不能重新赋值

// 块级作用域示例
{
  let localVar = "inside";
  const LOCAL_CONST = 123;
}
// console.log(localVar); // 报错
// console.log(LOCAL_CONST); // 报错
```

### 箭头函数

```js
// 传统函数
const sum = function (a, b) {
  return a + b;
};

// 箭头函数简写
const arrowSum = (a, b) => a + b;

// 单参数可省略括号
const square = (n) => n * n;

// 多行函数体
const greet = (name) => {
  const message = `Hello, ${name}!`;
  return message;
};

// this绑定（箭头函数没有自己的this）
const person = {
  name: "Alice",
  tasks: ["task1", "task2", "task3"],
  showTasks() {
    this.tasks.forEach((task) => {
      console.log(`${this.name} needs to do ${task}`);
    });
  },
};
```

### 模板字符串

```js
const user = "Sarah";
const age = 28;
const items = 3;
const total = 35;

// 多行字符串
const message = `Hello ${user},
Thank you for your purchase of ${items} items.
Total: $${total}.`;

// 表达式计算
console.log(`Next year, ${user} will be ${age + 1}`);

// 函数调用
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
console.log(`Total: ${formatCurrency(total)}`);
```

### 解构赋值

```js
// 数组解构
const colors = ["red", "green", "blue"];
const [firstColor, secondColor] = colors;
console.log(firstColor); // "red"

// 对象解构
const person = {
  name: "Mike",
  age: 35,
  job: "Developer",
};
const { name, age, job: occupation } = person;
console.log(name, occupation); // "Mike", "Developer"

// 函数参数解构
function displayPerson({ name, age, city = "Unknown" }) {
  console.log(`${name}, ${age}, from ${city}`);
}
displayPerson({ name: "Tom", age: 40 }); // "Tom, 40, from Unknown"

// 嵌套解构
const company = {
  name: "TechCorp",
  employees: ["John", "Lisa", "David"],
  address: {
    city: "San Francisco",
    zip: 94103,
  },
};
const {
  name: companyName,
  employees: [firstEmployee],
  address: { city },
} = company;
console.log(companyName, firstEmployee, city); // "TechCorp", "John", "San Francisco"
```

### 扩展运算符与剩余参数

```js
// 数组扩展
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1,2,3,4,5,6]

// 对象扩展
const defaults = { theme: "light", fontSize: 16 };
const userSettings = { fontSize: 18, darkMode: true };
const finalSettings = { ...defaults, ...userSettings };
// { theme: "light", fontSize: 18, darkMode: true }

// 剩余参数
function sumAll(...numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}
console.log(sumAll(1, 2, 3, 4)); // 10

// 参数解构
function registerUser({ username, email, ...otherInfo }) {
  // 保存用户名和邮箱
  // otherInfo包含其他属性
}
```

### 增强的对象字面量

```js
const name = "Emma";
const age = 32;

// 属性简写
const person = { name, age };

// 方法简写
const app = {
  start() {
    console.log("App started");
  },
};

// 计算属性名
const role = "admin";
const user = {
  id: 1,
  [`${role}_permissions`]: ["read", "write"],
};
```

### 类与继承

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    super.speak();
    console.log(`${this.name} barks!`);
  }

  // Getter
  get description() {
    return `${this.name} is a ${this.breed}`;
  }

  // Setter
  set nickname(value) {
    this.nick = value;
  }
}

const rex = new Dog("Rex", "Labrador");
rex.speak();
console.log(rex.description); // "Rex is a Labrador"
```

### 模块系统

```js
// math.js
export const PI = 3.14159;

export function square(x) {
  return x * x;
}

export default class Calculator {
  add(a, b) {
    return a + b;
  }
}

// app.js
import { PI, square } from "./math.js";
import Calc from "./math.js";

console.log(square(PI)); // 约9.87
const calc = new Calc();
console.log(calc.add(2, 3)); // 5
```

### Promise

```js
// 创建Promise
function fetchData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url.startsWith("https")) {
        resolve({ data: "Sample Data" });
      } else {
        reject(new Error("Invalid URL"));
      }
    }, 1000);
  });
}

// 使用Promise
fetchData("https://api.example.com")
  .then((response) => {
    console.log(response.data);
    return processData(response);
  })
  .then((processed) => {
    console.log(processed);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

// Promise.all
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve) => {
  setTimeout(resolve, 100, "foo");
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values); // [3, 42, "foo"]
});
```

### 迭代器与生成器

```js
// 自定义迭代器
const myIterable = {
  [Symbol.iterator]() {
    let step = 0;
    return {
      next() {
        step++;
        if (step <= 5) {
          return { value: step, done: false };
        }
        return { done: true };
      },
    };
  },
};

for (const value of myIterable) {
  console.log(value); // 1,2,3,4,5
}

// 生成器函数
function* idGenerator() {
  let id = 1;
  while (true) {
    const increment = yield id;
    if (increment !== undefined) {
      id += increment;
    } else {
      id++;
    }
  }
}

const gen = idGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next(5).value); // 7 (2+5)
```

### Set、Map、WeakSet、WeakMap

```js
// Set - 唯一值集合
const uniqueNumbers = new Set([1, 2, 3, 3, 4]);
console.log([...uniqueNumbers]); // [1,2,3,4]
console.log(uniqueNumbers.has(2)); // true

// Map - 键值对集合
const userMap = new Map();
userMap.set("id", 123);
userMap.set("name", "John");
console.log(userMap.get("name")); // "John"

// WeakMap (键必须是对象)
const weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, "private data");
obj = null; // 垃圾回收时自动清除

// WeakSet
const weakSet = new WeakSet();
const userObj = { id: 1 };
weakSet.add(userObj);
console.log(weakSet.has(userObj)); // true
```

### Proxy 与 Reflect

```js
// 创建Proxy
const user = { name: "Alex", age: 30 };
const validator = {
  set(target, property, value) {
    if (property === "age") {
      if (typeof value !== "number" || value < 0) {
        throw new TypeError("Age must be a positive number");
      }
    }
    Reflect.set(target, property, value);
    return true;
  },
};

const userProxy = new Proxy(user, validator);

try {
  userProxy.age = "thirty"; // 抛出错误
} catch (e) {
  console.error(e.message); // "Age must be a positive number"
}

// 使用Reflect
console.log(Reflect.get(user, "name")); // "Alex"
Reflect.set(user, "age", 31);
console.log(user.age); // 31
```

## ES7

### Array.prototype.includes

用于判断数组是否包含特定元素，替代传统的 indexOf 检查，返回布尔值更直观。

```js
const fruits = ["apple", "banana", "orange"];
console.log(fruits.includes("banana")); // true
console.log(fruits.includes("grape")); // false
```

### 指数运算符

简化幂运算，替代 Math.pow()，提升代码可读性

```js
console.log(2 ** 3); // 8
console.log(10 ** -2); // 0.01

let num = 3;
num **= 2; // 等同于 num = num ** 2;
console.log(num); // 9
```

## ES8

### Object.values/Object.entries

- Object.values()：返回对象自身可枚举属性值的数组
- Object.entries() ：返回一个包含对象自身可枚举属性键值对的数组，每个键值对是一个 [key, value] 数组。

```js
const person = { name: "Lisa", age: 28, job: "Designer" };

console.log(Object.values(person));
// ["Lisa", 28, "Designer"]

console.log(Object.entries(person));
// [["name", "Lisa"], ["age", 28], ["job", "Designer"]]
```

### 字符串填充

padStart 和 padEnd 方法，分别是对字符串的首尾进行填充

```js
"5".padStart(3, "0"); // 开头填充 → "005"
"5".padEnd(3, "0"); // 结尾填充 → "500"
//padStart:位数不够往前填充，第一个值填所需位数，第二个值填当位数不够时的填充内容
const minute = "2".padStart(2, "0");
//padEnd:位数不够往后填充
const second = "1".padEnd(2, "0");
console.log(`${minute}:${second}`); //02:10
//连续链式调用
const minute = "2".padStart(2, "0").padEnd(3, "0"); //020
```

### Async/Await

基于 Promise，但提供了更直观、更同步风格的代码结构来处理异步操作 async 函数

```js
// 使用 async/await
async function fetchData() {
  const user = await getUser();
  const posts = await getPosts(user.id);
  return { user, posts };
}

function fetchData() {
  return getUser()
    .then((user) => getPosts(user.id))
    .then((posts) => ({ user, posts }));
}
// 代码纵向扩展而非横向嵌套，逻辑清晰易维护
```

​​try/catch 统一捕获 ​​async/await 允许使用同步代码的 try/catch 结构处理异步错误，替代 Promise 的 .catch() 分散处理

```js
async function fetchWithRetry() {
  try {
    const data = await fetchData();
    return process(data);
  } catch (error) {
    console.error("失败重试:", error);
  }
}
```

### Object.getOwnPropertyDescriptors()

用于获取对象 ​​ 所有自身属性（非继承属性）​​ 的描述符。这些描述符包含属性的元信息（如可写性、可配置性等），为高级对象操作提供了基础支持

```js
const obj = { a: 1 };
const descriptors = Object.getOwnPropertyDescriptors(obj);
// 输出：
// {
//   a: {
//     value: 1,
//     writable: true,
//     enumerable: true,
//     configurable: true
//   }
// }

// 描述符可能包含以下字段：
// value：属性值（数据属性）。
// get/set：访问器属性的函数（访问器属性）。
// writable：是否可修改值。
// enumerable：是否可枚举（如 for...in 遍历）。
// configurable：是否可删除或修改属性特性
```

## ES9

### Promise.finally()

Promise.finally() 是 ES9 (2018) 引入的方法，用于在 Promise 无论成功或失败时执行清理操作

```js
fetchData()
  .then((result) => console.log(result))
  .catch((error) => console.error(error))
  .finally(() => console.log("清理操作"));
```

### 正则表达式命名捕获组

正则表达式命名捕获组是 ES9 (2018) 引入的特性，允许为捕获组指定名称，增强了正则表达式的可读性和可维护性

**语法 ​​：(?pattern)**

```js
const regex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = regex.exec("2025-05-29");
console.log(match.groups.year); // 2025
console.log(match.groups.month); // 05
console.log(match.groups.day); // 29
```

### 异步迭代器

异步迭代器是 ES9 (2018) 引入的概念，用于处理异步迭代操作，如 for...await...of 循环

- 异步迭代器：具有 Symbol.asyncIterator 方法的对象，用于生成异步迭代器
- 异步迭代器对象：具有 next() 方法的对象，用于获取异步迭代结果

```js
async function* asyncIterable() {
  yield 1;
  yield 2;
  yield 3;
}

for await (const value of asyncIterable()) {
  console.log(value); // 1, 2, 3
}
```

## ES10 新特性

### flat() 和 flatMap()

flat() 是 ES10 (2019) 引入的方法，用于扁平化数组，支持指定深度

```js
// 基本用法
[1, 2, [3, 4]].flat(); // [1, 2, 3, 4]

// 多层嵌套
[1, [2, [3, [4]]]].flat(2); // [1, 2, 3, [4]]

// 无限层级展平
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]

// 稀疏数组处理
[1, , 3, [4, , 6]].flat(); // [1, 3, 4, 6] (空位会被移除)
```

flatMap() 是 ES10 (2019) 引入的方法，用于映射数组后扁平化

```js
// 基本用法
[1, 2, 3].flatMap((x) => [x, x * 2]);
// [1, 2, 2, 4, 3, 6]

// 与 map + flat 对比
[1, 2, 3].map((x) => [x, x * 2]).flat();
// 等效结果，但 flatMap 性能更好

// 返回非数组值
["hello world", "es2019"].flatMap((str) => str.split(" "));
// ['hello', 'world', 'es2019']

// 可以返回空数组实现过滤效果
[-1, 2, -3].flatMap((num) => (num < 0 ? [] : [num]));
// [2] (替代 filter + map 组合)
```

### Object.fromEntries()

Object.fromEntries() 是 ES10 (2019) 引入的方法，用于将键值对数组转换为对象,与 Object.entries() 互为逆操作。

```js
const entries = [
  ["a", 1],
  ["b", 2],
];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2 }

// 2.Object.fromEntries的应用场景
const queryString = "name=why&age=18&height=1.88";
const queryParams = new URLSearchParams(queryString);
for (const param of queryParams) {
  console.log(param);
}
// [ 'name', 'why' ]
// [ 'age', '18' ]
// [ 'height', '1.88' ]

const paramObj = Object.fromEntries(queryParams);
// { name: 'why', age: '18', height: '1.88' }
```

### trimStart trimEnd

trimStart() 是 ES10 (2019) 引入的方法，用于去除字符串开头的空格

```js
const str = "   Hello World   ";
console.log(str.trimStart()); // 'Hello World    '
```

trimEnd() 是 ES10 (2019) 引入的方法，用于去除字符串结尾的空格

```js
const str = "  Hello World    ";
console.log(str.trimEnd()); // '  Hello World'
```

### Symbol.description

Symbol.description 是 ES10 (2019) 引入的属性，用于获取 Symbol 的描述字符串

```js
const sym = Symbol("description");
console.log(sym.description); // 'description'
// Symbol 描述字符串
```

## ES11 新特性

### BigInt

BigInt 是 ES11 (2020) 引入的基本数据类型，用于表示任意精度的整数,BitInt 的表示方法是在数值的后面加上 n

```js
const bigInt = 1234567890123456789012345678901234567890n;
console.log(bigInt); // 1234567890123456789012345678901234567890n

onst bigInt = 900719925474099100n
console.log(bigInt + 10n) // 900719925474099110n

const num = 100
console.log(bigInt + BigInt(num)) //900719925474099200n

const smallNum = Number(bigInt)  //900719925474099100

```

### 可选链操作符（?.）

```js
const user = {
  profile: {
    name: "Sam",
    address: {
      city: "New York",
    },
  },
};

console.log(user.profile?.name); // "Sam"
console.log(user.settings?.theme); // undefined
console.log(user.profile?.address?.street?.length); // undefined
```

### 空值合并操作符（??）

```js
const settings = {
  theme: null,
  fontSize: 0,
};

console.log(settings.theme ?? "light"); // "light"
console.log(settings.fontSize ?? 16); // 0
```

### Promise.allSettled

```js
const promises = [
  Promise.resolve("Success"),
  Promise.reject("Error"),
  Promise.resolve("Another success"),
];

Promise.allSettled(promises).then((results) => {
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      console.log("Success:", result.value);
    } else {
      console.log("Failure:", result.reason);
    }
  });
});
// Success: Success
// Failure: Error
// Success: Another success
```

### 动态导入

```js
// 按需加载模块
async function loadModule() {
  const module = await import("./dynamic-module.js");
  module.doSomething();
}

// 条件导入
if (user.isAdmin) {
  import("./admin-panel.js");
}
```

### import.meta

import.meta 是 ES11 (2020) 引入的对象，用于提供模块的元信息，包括模块的 URL 和其他相关信息

- 获取模块的 URL

```js
// test.js
const moduleURL = import.meta.url;
console.log(moduleURL);
// 'file:///Users/xx/xx/sumu/typescript-vue3/markdown/markdown-md/md/Javascript/test.js'
```

- 访问环境特定的元数据 在某些环境中，比如浏览器或特定的构建工具（如 Vite），import.meta 可能会被扩展以提供额外的信息。例如，Vite 在开发和生产环境中会通过 import.meta.env 提供环境变量

```js
// 在 Vite 中访问环境变量
console.log(import.meta.env.MODE); // 当前模式（开发/生产）
console.log(import.meta.env.BASE_URL); // 基础 URL

// .env 文件
VITE_API_URL=https://api.example.com

// 在模块中使用
console.log(import.meta.env.VITE_API_URL); // 输出：https://api.example.com

```

- 动态加载资源 结合 import.meta.url，可以动态地加载与模块相关的资源，比如图片、样式表等

```js
// 假设模块位于 /src/components/Component.js
const componentStyleUrl = new URL("./styles.css", import.meta.url).href;
console.log(componentStyleUrl); // 输出：file:///src/components/styles.css
```

## ES12 新特性

### String.prototype.replaceAll()

String.prototype.replaceAll() 是 ES12 (2021) 引入的方法，用于替换字符串中所有匹配的子字符串
**语法 ​​：str.replaceAll(searchValue, replaceValue)**

```js
const str = "hello world";
console.log(str.replaceAll("l", "L")); // 'heLLo worLd'

const str = "hello world, hello everyone";
const newStr = str.replaceAll("hello", "hi");
console.log(newStr); // "hi world, hi everyone"
```

### 逻辑赋值运算符

逻辑赋值运算符是 ES12 (2021) 引入的特性，用于简化逻辑表达式中的赋值操作（ &&=，||=，??= ）

```js
let x = 5;
x &&= 10; // 等价于 x = x && 10;
console.log(x); // 10
let y = null;
y ||= 10; // 等价于 y = y || 10;
console.log(y); // 10
let z = undefined;
z ??= 10; // 等价于 z = z ?? 10;
console.log(z); // 10
let message = 0;
message ??= "default value"; // 等价于 message = message?? "default value"; // 0
```

### Numeric Separators

Numeric Separators 是 ES12 (2021) 引入的特性，用于在数字字面量中添加分隔符，提高数字的可读性

```js
const num1 = 1000000; // 传统方式
const num2 = 1_000_000; // 使用分隔符
console.log(num1); // 1000000
console.log(num2); // 1000000
```

### Promise.any()

Promise.any() 是 ES12 (2021) 引入的方法，返回第一个完成的 Promise 的值

```js
const promises = [Promise.reject(1), Promise.reject(2), Promise.resolve(3)];
Promise.any(promises)
  .then((value) => {
    console.log(value); // 3
  })
  .catch((errors) => {
    console.log(errors); // [1, 2]
  });
```
