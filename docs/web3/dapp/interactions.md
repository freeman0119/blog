# DApp 与智能合约交互

## 交互方式

### 1. 直接调用

```javascript
// 读取合约数据
const value = await contract.methods.getValue().call();

// 发送交易
const tx = await contract.methods.setValue(123).send({
  from: userAddress,
  gas: 100000,
});
```

### 2. 事件监听

```javascript
// 监听合约事件
contract.events.ValueChanged(
  {
    fromBlock: "latest",
  },
  (error, event) => {
    console.log("Value changed:", event.returnValues);
  }
);

// 获取历史事件
const events = await contract.getPastEvents("ValueChanged", {
  fromBlock: 0,
  toBlock: "latest",
});
```

### 3. 批量调用

```javascript
// 使用 Multicall 合约
const multicall = new Multicall({
  multicallAddress: MULTICALL_ADDRESS,
  provider,
});

const calls = [
  {
    target: contractAddress,
    call: ["getValue()"],
    returns: [["value", (val) => val]],
  },
];

const results = await multicall.call(calls);
```

## 数据编码解码

### 1. 输入参数编码

```javascript
// 编码函数调用
const data = web3.eth.abi.encodeFunctionCall(
  {
    name: "setValue",
    type: "function",
    inputs: [
      {
        type: "uint256",
        name: "value",
      },
    ],
  },
  [123]
);

// 编码参数
const params = web3.eth.abi.encodeParameters(
  ["uint256", "string"],
  [123, "hello"]
);
```

### 2. 输出结果解码

```javascript
// 解码函数返回值
const result = web3.eth.abi.decodeParameters(["uint256", "string"], data);

// 解码事件日志
const log = web3.eth.abi.decodeLog(
  [{ type: "uint256", name: "value" }],
  data,
  topics
);
```

## 交易管理

### 1. 交易构建

```javascript
const tx = {
  from: userAddress,
  to: contractAddress,
  data: encodedData,
  gas: estimatedGas,
  gasPrice: await web3.eth.getGasPrice(),
  nonce: await web3.eth.getTransactionCount(userAddress),
};
```

### 2. 交易签名

```javascript
// 使用私钥签名
const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

// 使用钱包签名
const signedTx = await ethereum.request({
  method: "eth_signTransaction",
  params: [tx],
});
```

### 3. 交易发送和确认

```javascript
// 发送交易
const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

// 等待确认
const receipt = await web3.eth.getTransactionReceipt(txHash);
```

## 错误处理

### 1. 交易错误

```javascript
try {
  await contract.methods.setValue(123).send({
    from: userAddress,
  });
} catch (error) {
  if (error.code === 4001) {
    console.log("用户拒绝交易");
  } else if (error.code === -32603) {
    console.log("交易执行失败");
  }
}
```

### 2. 合约错误

```javascript
// 自定义错误
contract.methods
  .riskyOperation()
  .call()
  .catch((error) => {
    // 解析合约抛出的错误
    const reason = error.message.match(/reason string "(.*?)"/)?.[1];
    console.log("合约错误:", reason);
  });
```

## 性能优化

### 1. 批量查询

```javascript
// 使用 Multicall 优化多次调用
const calls = addresses.map((address) => ({
  target: tokenAddress,
  call: ["balanceOf(address)(uint256)", address],
  returns: [[address, (val) => val]],
}));

const results = await multicall.call(calls);
```

### 2. 事件过滤

```javascript
// 使用过滤器优化事件查询
const filter = {
  address: contractAddress,
  topics: [
    web3.utils.sha3("Transfer(address,address,uint256)"),
    web3.utils.padLeft(userAddress, 64),
  ],
};

const events = await web3.eth.getPastLogs(filter);
```
