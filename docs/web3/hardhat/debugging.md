# 调试技巧

## 控制台调试

```javascript
// 在合约或测试中添加调试点
await hre.run("console");

// 在控制台中查看变量
console.log("Balance:", await token.balanceOf(address));

// 使用内置的调试器
await debug("0x123..."); // 调试特定交易
```

## 堆栈追踪

```javascript
// 启用详细的错误信息
require("@nomiclabs/hardhat-trace");

// 运行时会显示详细的堆栈追踪
await token.transfer(to, amount);
// Error: VM Exception...
//   at Token.transfer (contracts/Token.sol:15)
//   at TestContract._callback (test/test.js:25)
```

## Gas 分析

```javascript
// 使用 gas 报告插件
require("hardhat-gas-reporter");

// 配置
module.exports = {
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 21,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
};
```

## 事件日志

```solidity
// 在合约中添加事件
contract Token {
    event Debug(string message, uint256 value);

    function transfer(address to, uint256 amount) public {
        emit Debug("Before transfer", amount);
        // ... 转账逻辑
        emit Debug("After transfer", balanceOf(msg.sender));
    }
}
```
