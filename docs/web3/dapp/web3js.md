# Web3.js 介绍

## 什么是 Web3.js

Web3.js 是一个 JavaScript 库，它允许 Web 应用程序与以太坊区块链进行交互。它提供了一组 API，使开发者能够：

1. 连接以太坊网络
2. 读取区块链数据
3. 发送交易
4. 与智能合约交互
5. 管理账户和签名

## 工作原理

### 1. JSON-RPC 通信

Web3.js 通过 JSON-RPC 协议与以太坊节点通信：

```
Web 应用 ←→ Web3.js ←→ JSON-RPC ←→ 以太坊节点
```

主要流程：

1. Web3.js 将方法调用转换为 JSON-RPC 请求
2. 通过 HTTP/WebSocket 发送到以太坊节点
3. 节点处理请求并返回结果
4. Web3.js 解析响应并返回给应用

### 2. Provider 机制

Provider 是 Web3.js 与区块链网络通信的桥梁：

```javascript
// HTTP Provider
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// WebSocket Provider
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8546")
);

// MetaMask Provider
const web3 = new Web3(window.ethereum);
```

### 3. ABI 编码解码

Web3.js 使用 ABI（应用程序二进制接口）来编码/解码与智能合约的交互：

```javascript
// ABI 编码
const data = web3.eth.abi.encodeFunctionCall(
  {
    name: "transfer",
    type: "function",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "value" },
    ],
  },
  [receiverAddress, amount]
);

// ABI 解码
const result = web3.eth.abi.decodeParameters(
  ["uint256", "string"],
  encodedData
);
```

## 基本使用

### 1. 安装和初始化

```javascript
// 安装
npm install web3

// 初始化
import Web3 from "web3";

// 连接到以太坊网络
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// 检查连接
const isConnected = await web3.eth.net.isListening();
console.log("连接状态:", isConnected);
```

### 2. 账户操作

```javascript
// 获取账户列表
const accounts = await web3.eth.getAccounts();

// 创建新账户
const account = web3.eth.accounts.create();
console.log("新账户地址:", account.address);
console.log("私钥:", account.privateKey);

// 获取余额
const balance = await web3.eth.getBalance(accounts[0]);
console.log("余额:", web3.utils.fromWei(balance, "ether"), "ETH");
```

### 3. 合约交互

```javascript
// 创建合约实例
const contract = new web3.eth.Contract(ABI, contractAddress);

// 调用只读方法
const result = await contract.methods.balanceOf(address).call();

// 发送交易
const tx = await contract.methods.transfer(to, amount).send({
  from: accounts[0],
  gas: 100000,
});
```

### 4. 事件监听

```javascript
// 监听合约事件
contract.events
  .Transfer({
    fromBlock: "latest",
  })
  .on("data", (event) => {
    console.log("转账事件:", {
      from: event.returnValues.from,
      to: event.returnValues.to,
      value: event.returnValues.value,
    });
  })
  .on("error", console.error);

// 获取历史事件
const events = await contract.getPastEvents("Transfer", {
  fromBlock: 0,
  toBlock: "latest",
});
```

### 5. 交易管理

```javascript
// 创建交易
const tx = {
  from: accounts[0],
  to: receiverAddress,
  value: web3.utils.toWei("1", "ether"),
  gas: 21000,
  gasPrice: await web3.eth.getGasPrice(),
};

// 发送交易
const receipt = await web3.eth.sendTransaction(tx);

// 等待确认
await web3.eth.waitForTransactionReceipt(receipt.transactionHash);
```

### 6. 工具函数

```javascript
// 单位转换
const weiValue = web3.utils.toWei("1", "ether");
const etherValue = web3.utils.fromWei("1000000000000000000", "ether");

// 哈希计算
const hash = web3.utils.sha3("Hello World");
const keccak = web3.utils.keccak256("Hello World");

// 地址检查
const isValid = web3.utils.isAddress(address);
```

## 最佳实践

1. 错误处理

```javascript
try {
  const result = await contract.methods.transfer(to, amount).send({
    from: account,
  });
} catch (error) {
  if (error.code === 4001) {
    console.log("用户拒绝交易");
  } else if (error.code === -32603) {
    console.log("交易执行失败");
  }
}
```

2. Gas 估算

```javascript
const gas = await contract.methods
  .transfer(to, amount)
  .estimateGas({ from: account });

const gasPrice = await web3.eth.getGasPrice();
const gasCost = web3.utils.fromWei((gas * gasPrice).toString(), "ether");
```

3. 批量请求

```javascript
const batch = new web3.BatchRequest();
batch.add(web3.eth.getBalance.request(address1));
batch.add(web3.eth.getBalance.request(address2));
const results = await batch.execute();
```
