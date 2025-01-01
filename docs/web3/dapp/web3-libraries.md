# Web3 开发库对比

## Web3.js vs Ethers.js

两个库都是用于与以太坊区块链交互的主流 JavaScript 库，各有特点：

| 特性     | Web3.js        | Ethers.js         |
| -------- | -------------- | ----------------- |
| 维护团队 | 以太坊基金会   | 独立开发者        |
| 社区规模 | 较大           | 快速增长          |
| 代码体积 | 较大           | 较小              |
| 使用难度 | 相对简单       | 稍复杂但更灵活    |
| 文档质量 | 完善但部分过时 | 清晰且持续更新    |
| 类型支持 | 一般           | TypeScript 支持好 |
| 性能     | 一般           | 较好              |
| 安全性   | 一般           | 较好              |

## Web3.js 特点

### 优势

1. 更容易上手
2. 社区资源丰富
3. 与以太坊生态紧密集成
4. API 设计直观

### 劣势

1. 包体积较大
2. 部分 API 设计过时
3. TypeScript 支持不够完善
4. 错误处理相对简单

### 基本使用

```javascript
// 初始化
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");

// 账户操作
const account = web3.eth.accounts.create();
const balance = await web3.eth.getBalance(address);

// 合约交互
const contract = new web3.eth.Contract(ABI, contractAddress);
const result = await contract.methods.myMethod().call();
const tx = await contract.methods.myMethod().send({
  from: myAddress,
  gas: 100000,
});

// 事件监听
contract.events.MyEvent(
  {
    fromBlock: 0,
  },
  (error, event) => {
    console.log(event);
  }
);
```

## Ethers.js 特点

### 优势

1. 更现代的 API 设计
2. 更好的 TypeScript 支持
3. 更小的包体积
4. 更完善的安全特性

### 劣势

1. 学习曲线较陡
2. 社区资源相对较少
3. 部分高级功能使用复杂
4. 与一些老项目兼容性不够好

### 基本使用

```javascript
// 初始化
const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider();

// 账户操作
const wallet = ethers.Wallet.createRandom();
const balance = await provider.getBalance(address);

// 合约交互
const contract = new ethers.Contract(address, ABI, signer);
const result = await contract.myMethod();
const tx = await contract.myMethod();
await tx.wait(); // 等待确认

// 事件监听
contract.on("MyEvent", (param1, param2, event) => {
  console.log(param1, param2, event);
});
```

## 功能对比

### 1. Provider 连接

Web3.js:

```javascript
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
```

Ethers.js:

```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
// 或者
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
```

### 2. 合约交互

Web3.js:

```javascript
const contract = new web3.eth.Contract(ABI, address);
await contract.methods.myMethod().call();
await contract.methods.myMethod().send({ from: account });
```

Ethers.js:

```javascript
const contract = new ethers.Contract(address, ABI, signer);
await contract.myMethod(); // 自动判断是 call 还是 send
```

### 3. 事件处理

Web3.js:

```javascript
contract.events.MyEvent(
  {
    fromBlock: "latest",
  },
  (error, event) => {
    /* ... */
  }
);

// 获取过去的事件
const events = await contract.getPastEvents("MyEvent");
```

Ethers.js:

```javascript
contract.on("MyEvent", (...args) => {
  /* ... */
});

// 获取过去的事件
const filter = contract.filters.MyEvent();
const events = await contract.queryFilter(filter);
```

## 选择建议

1. 选择 Web3.js 的情况：

   - 项目较简单，想快速上手
   - 需要大量社区资源
   - 与老项目集成
   - 团队已熟悉 Web3.js

2. 选择 Ethers.js 的情况：
   - 新项目开发
   - 需要更好的 TypeScript 支持
   - 注重安全性
   - 需要更现代的 API 设计
   - 在意包体积
